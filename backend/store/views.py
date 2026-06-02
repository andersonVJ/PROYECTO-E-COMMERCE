from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import Sum, Count, F
from django.utils import timezone
from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, Category, Product, ProductImage, Inventory, Order, OrderItem, BlogPost, StoreConfig
from .serializers import (
    UserSerializer, UserRegisterSerializer, CategorySerializer, ProductSerializer, 
    ProductImageSerializer, OrderSerializer, BlogPostSerializer, StoreConfigSerializer
)

# --- AUTH VIEWS ---

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# --- STORE VIEWS ---

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images', 'inventory')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Admin can view inactive products
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            queryset = Product.objects.all().prefetch_related('images', 'inventory')

        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        is_featured = self.request.query_params.get('featured', None)
        if is_featured == 'true':
            queryset = queryset.filter(is_featured=True)

        is_weekly = self.request.query_params.get('weekly', None)
        if is_weekly == 'true':
            queryset = queryset.filter(is_weekly_recommendation=True)

        promo = self.request.query_params.get('promo', None)
        if promo == 'true':
            queryset = queryset.filter(discount_price__isnull=False)

        best_seller = self.request.query_params.get('best_sellers', None)
        if best_seller == 'true':
            queryset = queryset.filter(inventory__stock_sold__gt=0).order_by('-inventory__stock_sold')

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(sku__icontains=search)

        return queryset

# --- IMAGE MANAGEMENT ---

class ProductImageUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist('images')
        created_images = []
        
        # Calculate current order count
        order_start = ProductImage.objects.filter(product=product).count()

        for idx, img in enumerate(images):
            product_img = ProductImage.objects.create(
                product=product,
                image=img,
                order=order_start + idx
            )
            created_images.append(product_img)

        serializer = ProductImageSerializer(created_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProductImageDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, image_id):
        try:
            img = ProductImage.objects.get(id=image_id)
            product = img.product
            img.delete()
            
            # Reorder remaining images
            images = ProductImage.objects.filter(product=product).order_by('order')
            for idx, image in enumerate(images):
                image.order = idx
                image.save()
                
            return Response({"message": "Image deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)

# --- CHECKOUT & ORDER VIEWS ---

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        cart = request.data.get('cart', [])
        payment_method = request.data.get('payment_method')
        notes = request.data.get('notes', '')
        
        if not cart:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        if not payment_method:
            return Response({"error": "Payment method is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve store configuration
        store_config, _ = StoreConfig.objects.get_or_create(id=1)
        shipping_cost = 0

        # Calculate shipping cost
        if payment_method == Order.PAYMENT_MEDELLIN:
            shipping_cost = store_config.shipping_cost_medellin
        elif payment_method == Order.PAYMENT_NEQUI:
            shipping_cost = 0 # Shipping quote via whatsapp or paid separately
        else:
            shipping_cost = 0

        total_amount = 0
        order_items_to_create = []
        inventory_to_update = []

        # Validate items and reserve inventory
        for item in cart:
            product_id = item.get('product_id')
            quantity = int(item.get('quantity', 1))

            try:
                # Lock row to prevent concurrency issues
                product = Product.objects.select_for_update().get(id=product_id, is_active=True)
                inventory = Inventory.objects.select_for_update().get(product=product)
            except (Product.DoesNotExist, Inventory.DoesNotExist):
                return Response({"error": f"Product with ID {product_id} is unavailable"}, status=status.HTTP_400_BAD_REQUEST)

            if inventory.stock_actual < quantity:
                return Response({"error": f"Insufficient stock for {product.name}. Available: {inventory.stock_actual}"}, status=status.HTTP_400_BAD_REQUEST)

            price = product.discount_price if product.has_discount else product.price
            total_amount += price * quantity

            # Reserve stock
            inventory.stock_actual -= quantity
            inventory.stock_reserved += quantity
            inventory_to_update.append(inventory)

            order_items_to_create.append({
                'product': product,
                'quantity': quantity,
                'price': price
            })

        # Save all inventory reservation
        for inv in inventory_to_update:
            inv.save()

        # Create Order
        order = Order.objects.create(
            customer=user,
            status=Order.STATUS_PENDING,
            total_amount=total_amount + shipping_cost,
            shipping_cost=shipping_cost,
            payment_method=payment_method,
            notes=notes
        )

        # Create OrderItems
        for o_item in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=o_item['product'],
                quantity=o_item['quantity'],
                price=o_item['price']
            )

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at').prefetch_related('items__product__images')

class OrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().prefetch_related('items__product__images')
        return Order.objects.filter(customer=user).prefetch_related('items__product__images')

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only admin or customer (with restricted changes) can update orders
        user = request.user
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        
        # Custom business rules when status changes
        if new_status and new_status != instance.status:
            if not user.is_staff and new_status != Order.STATUS_CANCELLED:
                return Response({"error": "Only admins can change order status"}, status=status.HTTP_403_FORBIDDEN)
                
            self.handle_status_transition(instance, instance.status, new_status)
            
        return super().update(request, *args, **kwargs)

    def handle_status_transition(self, order, old_status, new_status):
        items = order.items.all()
        for item in items:
            try:
                inventory = Inventory.objects.select_for_update().get(product=item.product)
            except Inventory.DoesNotExist:
                continue

            # State transition business logic
            if old_status == Order.STATUS_PENDING and new_status == Order.STATUS_CONFIRMED:
                # Deduct from reserved, add to sold
                inventory.stock_reserved = max(0, inventory.stock_reserved - item.quantity)
                inventory.stock_sold += item.quantity
                
            elif old_status == Order.STATUS_PENDING and new_status == Order.STATUS_CANCELLED:
                # Release reserved stock back to actual
                inventory.stock_reserved = max(0, inventory.stock_reserved - item.quantity)
                inventory.stock_actual += item.quantity

            elif old_status == Order.STATUS_CONFIRMED and new_status == Order.STATUS_CANCELLED:
                # Refund sold stock back to actual
                inventory.stock_sold = max(0, inventory.stock_sold - item.quantity)
                inventory.stock_actual += item.quantity
                
            elif old_status in [Order.STATUS_PACKED, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED] and new_status == Order.STATUS_CANCELLED:
                # Refund sold stock back to actual
                inventory.stock_sold = max(0, inventory.stock_sold - item.quantity)
                inventory.stock_actual += item.quantity
                
            inventory.save()

class UploadPaymentReceiptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        receipt = request.FILES.get('payment_receipt')
        if not receipt:
            return Response({"error": "Receipt image is required"}, status=status.HTTP_400_BAD_REQUEST)

        order.payment_receipt = receipt
        order.save()
        return Response({"message": "Receipt uploaded successfully", "receipt_url": order.payment_receipt.url})

# --- CONFIG & BLOG VIEWS ---

class StoreConfigView(APIView):
    def get(self, request):
        config, _ = StoreConfig.objects.get_or_create(id=1)
        serializer = StoreConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        if not request.user or not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        config, _ = StoreConfig.objects.get_or_create(id=1)
        serializer = StoreConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

# --- ADMIN PANEL METRICS ---

class AdminDashboardMetricsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)

        # Sales KPIs
        sales_today = Order.objects.filter(
            created_at__date=today, 
            status__in=[Order.STATUS_CONFIRMED, Order.STATUS_PACKED, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED]
        ).aggregate(sum=Sum('total_amount'))['sum'] or 0

        sales_week = Order.objects.filter(
            created_at__date__gte=start_of_week, 
            status__in=[Order.STATUS_CONFIRMED, Order.STATUS_PACKED, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED]
        ).aggregate(sum=Sum('total_amount'))['sum'] or 0

        sales_month = Order.objects.filter(
            created_at__date__gte=start_of_month, 
            status__in=[Order.STATUS_CONFIRMED, Order.STATUS_PACKED, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED]
        ).aggregate(sum=Sum('total_amount'))['sum'] or 0

        # Orders KPIs
        pending_orders = Order.objects.filter(status=Order.STATUS_PENDING).count()
        total_customers = User.objects.filter(is_staff=False).count()
        
        # Inventory KPIs
        low_stock_count = Inventory.objects.filter(stock_actual__lte=F('stock_min')).count()
        total_products_sold = Inventory.objects.aggregate(sum=Sum('stock_sold'))['sum'] or 0

        # Graphics Data 1: Sales per Month (last 6 months)
        sales_per_month = []
        for i in range(5, -1, -1):
            date = today - timedelta(days=i*30)
            month_start = date.replace(day=1)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            
            amount = Order.objects.filter(
                created_at__date__gte=month_start,
                created_at__date__lt=next_month,
                status__in=[Order.STATUS_CONFIRMED, Order.STATUS_PACKED, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED]
            ).aggregate(sum=Sum('total_amount'))['sum'] or 0
            
            sales_per_month.append({
                "month": month_start.strftime("%B"),
                "total": float(amount)
            })

        # Graphics Data 2: Best Selling Products
        best_sellers = Product.objects.filter(inventory__stock_sold__gt=0).order_by('-inventory__stock_sold')[:5]
        best_sellers_data = [{
            "name": p.name,
            "sold": p.inventory.stock_sold,
            "stock": p.inventory.stock_actual
        } for p in best_sellers]

        # Graphics Data 3: Cities with most orders
        cities_orders = Order.objects.values('customer__city').annotate(count=Count('id')).order_by('-count')[:5]
        cities_data = [{
            "city": item['customer__city'] or "No especificada",
            "orders": item['count']
        } for item in cities_orders]

        # Graphics Data 4: New customers (this week)
        new_customers_count = User.objects.filter(date_joined__date__gte=start_of_week, is_staff=False).count()

        return Response({
            "metrics": {
                "sales_today": float(sales_today),
                "sales_week": float(sales_week),
                "sales_month": float(sales_month),
                "pending_orders": pending_orders,
                "total_customers": total_customers,
                "low_stock_count": low_stock_count,
                "total_products_sold": total_products_sold,
                "new_customers_week": new_customers_count
            },
            "charts": {
                "sales_per_month": sales_per_month,
                "best_sellers": best_sellers_data,
                "cities_orders": cities_data
            }
        })

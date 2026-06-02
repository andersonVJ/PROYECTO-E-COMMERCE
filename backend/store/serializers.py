from rest_framework import serializers
from .models import User, Category, Product, ProductImage, Inventory, Order, OrderItem, BlogPost, StoreConfig

# --- USER SERIALIZERS ---

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'address', 'neighborhood', 'city', 'is_staff']
        read_only_fields = ['is_staff']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'address', 'neighborhood', 'city']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# --- STORE SERIALIZERS ---

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'thumbnail', 'order']

class InventorySerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = ['stock_actual', 'stock_reserved', 'stock_sold', 'stock_min', 'is_low_stock']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    has_discount = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'slug', 'category', 'category_id', 'description', 
            'price', 'discount_price', 'discount_percent', 'has_discount',
            'is_active', 'is_featured', 'is_weekly_recommendation', 'images', 'inventory', 'created_at'
        ]

# --- ORDER SERIALIZERS ---

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'product_thumbnail', 'quantity', 'price']

    def get_product_thumbnail(self, obj):
        if obj.product:
            first_image = obj.product.images.first()
            if first_image and first_image.thumbnail:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first_image.thumbnail.url)
                return first_image.thumbnail.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_address = serializers.CharField(source='customer.address', read_only=True)
    customer_neighborhood = serializers.CharField(source='customer.neighborhood', read_only=True)
    customer_city = serializers.CharField(source='customer.city', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_email', 'customer_name', 'customer_phone',
            'customer_address', 'customer_neighborhood', 'customer_city', 'status',
            'total_amount', 'shipping_cost', 'payment_method', 'payment_receipt',
            'tracking_number', 'notes', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['order_number', 'total_amount', 'shipping_cost', 'created_at']

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip()

# --- OTHER SERIALIZERS ---

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'category', 'content', 'banner', 'created_at']

class StoreConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreConfig
        fields = ['nequi_number', 'whatsapp_number', 'shipping_cost_medellin']

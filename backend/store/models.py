import io
from pathlib import Path
from datetime import datetime
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.files.base import ContentFile
from PIL import Image

# --- USER MODELS ---

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    neighborhood = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

# --- E-COMMERCE MODELS ---

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_weekly_recommendation = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price

    @property
    def discount_percent(self):
        if self.has_discount:
            return round(((self.price - self.discount_price) / self.price) * 100)
        return 0

    def __str__(self):
        return f"{self.name} ({self.sku})"

def convert_to_webp(image_field, size=None):
    if not image_field:
        return None
    try:
        img = Image.open(image_field)
        
        # Convert transparent images to white background
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        if size:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
        output = io.BytesIO()
        img.save(output, format='WebP', quality=85)
        output.seek(0)
        
        name = Path(image_field.name).stem
        if size:
            suffix = f"_{size[0]}x{size[1]}"
        else:
            suffix = ""
            
        return ContentFile(output.read(), name=f"{name}{suffix}.webp")
    except Exception as e:
        print(f"Error converting image to WebP: {e}")
        return image_field

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/large/')
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        # Apply WebP conversion and scaling on save
        if self.image and not self.image.name.endswith('.webp'):
            large_webp = convert_to_webp(self.image, (1200, 1200))
            if large_webp:
                self.image = large_webp
                
        if self.image and not self.thumbnail:
            thumb_webp = convert_to_webp(self.image, (300, 300))
            if thumb_webp:
                self.thumbnail = thumb_webp
                
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.product.name} [Pos: {self.order}]"

class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    stock_actual = models.PositiveIntegerField(default=0)
    stock_reserved = models.PositiveIntegerField(default=0)
    stock_sold = models.PositiveIntegerField(default=0)
    stock_min = models.PositiveIntegerField(default=5)

    class Meta:
        verbose_name_plural = "Inventories"

    @property
    def is_low_stock(self):
        return self.stock_actual <= self.stock_min

    def __str__(self):
        return f"Inventory for {self.product.name} (Qty: {self.stock_actual})"

# --- ORDER MODELS ---

class Order(models.Model):
    STATUS_PENDING = 'Pendiente'
    STATUS_CONFIRMED = 'Confirmado'
    STATUS_PACKED = 'Empacado'
    STATUS_SHIPPED = 'Enviado'
    STATUS_DELIVERED = 'Entregado'
    STATUS_CANCELLED = 'Cancelado'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_CONFIRMED, 'Confirmado'),
        (STATUS_PACKED, 'Empacado'),
        (STATUS_SHIPPED, 'Enviado'),
        (STATUS_DELIVERED, 'Entregado'),
        (STATUS_CANCELLED, 'Cancelado'),
    ]

    PAYMENT_MEDELLIN = 'Contra Entrega'
    PAYMENT_NEQUI = 'Nequi'
    PAYMENT_WHATSAPP = 'WhatsApp'

    PAYMENT_CHOICES = [
        (PAYMENT_MEDELLIN, 'Medellín - Contra Entrega'),
        (PAYMENT_NEQUI, 'Nequi - Pago Anticipado'),
        (PAYMENT_WHATSAPP, 'WhatsApp - Confirmar Envío'),
    ]

    order_number = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_CHOICES)
    payment_receipt = models.ImageField(upload_to='receipts/', blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            year = datetime.now().year
            count = Order.objects.filter(created_at__year=year).count() + 1
            self.order_number = f"PED-{year}-{count:06d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer.email} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name if self.product else 'Deleted Product'} on {self.order.order_number}"

# --- CONTENT & CONFIG MODELS ---

class BlogPost(models.Model):
    CAT_MODA = 'Moda urbana'
    CAT_STREETWEAR = 'Streetwear'
    CAT_TENDENCIAS = 'Tendencias de gorras'
    CAT_ESTILO = 'Consejos de estilo'
    CAT_LANZAMIENTOS = 'Nuevos lanzamientos'

    CAT_CHOICES = [
        (CAT_MODA, 'Moda urbana'),
        (CAT_STREETWEAR, 'Streetwear'),
        (CAT_TENDENCIAS, 'Tendencias de gorras'),
        (CAT_ESTILO, 'Consejos de estilo'),
        (CAT_LANZAMIENTOS, 'Nuevos lanzamientos'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.CharField(max_length=50, choices=CAT_CHOICES)
    content = models.TextField()
    banner = models.ImageField(upload_to='blog/')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.banner and not self.banner.name.endswith('.webp'):
            banner_webp = convert_to_webp(self.banner, (1200, 800))
            if banner_webp:
                self.banner = banner_webp
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class StoreConfig(models.Model):
    nequi_number = models.CharField(max_length=20, default="3000000000")
    whatsapp_number = models.CharField(max_length=20, default="+573052043217")
    shipping_cost_medellin = models.DecimalField(max_digits=12, decimal_places=2, default=12000)

    class Meta:
        verbose_name = "Store Configuration"
        verbose_name_plural = "Store Configurations"

    def __str__(self):
        return "Global Store Configuration"

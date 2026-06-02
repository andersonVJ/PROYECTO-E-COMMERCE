from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Product, ProductImage, Inventory, Order, OrderItem, BlogPost, StoreConfig

# --- CUSTOM USER ADMIN ---

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'first_name', 'last_name', 'phone', 'city', 'is_staff', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'phone', 'address', 'neighborhood', 'city')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'phone', 'address', 'neighborhood', 'city'),
        }),
    )

# --- INLINE MODELS ---

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    sortable_field_name = "order"

class InventoryInline(admin.StackedInline):
    model = Inventory
    can_delete = False

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price']

# --- MODEL ADMINS ---

class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'price', 'discount_price', 'is_active', 'is_featured', 'is_weekly_recommendation']
    list_filter = ['category', 'is_active', 'is_featured', 'is_weekly_recommendation']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, InventoryInline]

    # Create inventory row when product is created
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:
            Inventory.objects.get_or_create(product=obj)

class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'status', 'payment_method', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_number', 'customer__email', 'tracking_number']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]

class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}

# --- REGISTER ---

admin.site.register(User, CustomUserAdmin)
admin.site.register(Category, admin.ModelAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(StoreConfig, admin.ModelAdmin)

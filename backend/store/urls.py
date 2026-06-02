from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView, CategoryViewSet,
    ProductViewSet, ProductImageUploadView, ProductImageDeleteView, CheckoutView,
    CustomerOrderListView, OrderDetailView, UploadPaymentReceiptView, StoreConfigView,
    BlogPostViewSet, AdminDashboardMetricsView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'blogs', BlogPostViewSet, basename='blog')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', UserProfileView.as_view(), name='auth_profile'),
    
    # Store endpoints
    path('', include(router.urls)),
    path('checkout/', CheckoutView.as_view(), name='store_checkout'),
    path('orders/', CustomerOrderListView.as_view(), name='customer_orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('orders/<int:order_id>/receipt/', UploadPaymentReceiptView.as_view(), name='upload_payment_receipt'),
    path('config/', StoreConfigView.as_view(), name='store_config'),
    
    # Admin specific endpoints
    path('products/<int:product_id>/images/', ProductImageUploadView.as_view(), name='product_images_upload'),
    path('images/<int:image_id>/', ProductImageDeleteView.as_view(), name='product_image_delete'),
    path('admin/dashboard/', AdminDashboardMetricsView.as_view(), name='admin_dashboard_metrics'),
]

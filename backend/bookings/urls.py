from django.urls import path
from .views import (
    BookingCreateView, 
    CabinAvailabilityView,
    AdminBookingListView, 
    AdminBookingDetailView, 
    AdminBookingResendWelcomeEmailView,
    AdminDashboardStatsView,
    CreateCheckoutSessionView,
    MeView,
    paystack_webhook,
)

urlpatterns = [
    # Public Endpoints
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('cabins/<int:cabin_id>/availability/', CabinAvailabilityView.as_view(), name='cabin-availability'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('me/', MeView.as_view(), name='me'),
    
    # Paystack Webhook
    path('paystack-webhook/', paystack_webhook, name='paystack-webhook'),
    
    # Admin Endpoints
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:pk>/', AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/bookings/<int:pk>/resend-welcome-email/', AdminBookingResendWelcomeEmailView.as_view(), name='admin-booking-resend-welcome-email'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
]
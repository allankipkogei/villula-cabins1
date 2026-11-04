from django.urls import path
from .views import (
    BookingCreateView, 
    CabinAvailabilityView,
    AdminBookingListView, 
    AdminBookingDetailView, 
    AdminDashboardStatsView,
    CreateCheckoutSessionView,
    MeView,
)

urlpatterns = [
    # Public Endpoints
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('cabins/<int:cabin_id>/availability/', CabinAvailabilityView.as_view(), name='cabin-availability'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('me/', MeView.as_view(), name='me'),
    
    # Admin Endpoints
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:pk>/', AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
]
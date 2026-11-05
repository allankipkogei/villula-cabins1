from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Sum, Q
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from datetime import date
import requests
import json
import hashlib

from .models import Booking
from cabins.models import Cabin
from contacts.models import ContactMessage
from .serializers import BookingCreateSerializer, BookingAdminSerializer
from .permissions import IsStaffUser


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Explicitly return the ID and details
        return Response({
            'id': booking.id,
            'check_in': booking.check_in,
            'check_out': booking.check_out,
            'total_price': booking.total_price
        }, status=status.HTTP_201_CREATED)


class CabinAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, cabin_id):
        bookings = Booking.objects.filter(
            cabin_id=cabin_id,
            status__in=['pending', 'confirmed'],
        ).values('check_in', 'check_out')
        return Response(list(bookings))


class CreateCheckoutSessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            booking_id = request.data.get('booking_id')
            booking = Booking.objects.get(id=booking_id)
            
            # Paystack expects the amount in the lowest denomination (cents)
            # KES 30,000 becomes 3,000,000
            amount = int(booking.total_price * 100) 
            
            url = "https://api.paystack.co/transaction/initialize"
            headers = {
                "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "email": booking.guest_email,
                "amount": amount,
                "reference": f"VIL-{booking.id}",
                "callback_url": "https://villulacabinsresort.co.ke/success"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            data = response.json()
            
            if data.get('status'):
                return Response({'url': data['data']['authorization_url']})
            else:
                return Response({'error': data.get('message', 'Failed to initialize payment')}, status=status.HTTP_400_BAD_REQUEST)
                
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def paystack_webhook(request):
    if request.method == 'POST':
        # Verify the request is from Paystack
        paystack_signature = request.headers.get('x-paystack-signature')
        secret = settings.PAYSTACK_SECRET_KEY.encode('utf-8')
        
        hash = hashlib.sha512(request.body + secret).hexdigest()
        
        if hash != paystack_signature:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)
            
        payload = json.loads(request.body)
        
        # Check if the event is a successful charge
        if payload['event'] == 'charge.success':
            reference = payload['data']['reference'] # e.g., "VIL-45"
            try:
                booking_id = reference.split('-')[1]
                booking = Booking.objects.get(id=booking_id)
                booking.status = 'confirmed'
                booking.save()
                print(f"✅ Payment confirmed for Booking #{booking_id}")
            except (IndexError, Booking.DoesNotExist):
                print(f"❌ Booking not found for reference {reference}")
                
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


# ---------- ADMIN ----------

class AdminBookingListView(generics.ListCreateAPIView):
    """List all bookings, filterable by status and cabin, or create a new reservation."""
    serializer_class = BookingAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        qs = Booking.objects.select_related('cabin').all()
        status_filter = self.request.query_params.get('status')
        cabin_filter = self.request.query_params.get('cabin')
        search = self.request.query_params.get('search')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if cabin_filter:
            qs = qs.filter(cabin_id=cabin_filter)
        if search:
            qs = qs.filter(
                Q(guest_name__icontains=search) |
                Q(guest_email__icontains=search) |
                Q(guest_phone__icontains=search) |
                Q(cabin__name__icontains=search)
            )
        return qs


class AdminBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update (e.g. change status) or delete a single booking."""
    queryset = Booking.objects.select_related('cabin').all()
    serializer_class = BookingAdminSerializer
    permission_classes = [IsStaffUser]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']


class AdminDashboardStatsView(APIView):
    """Summary numbers for the admin executive dashboard."""
    permission_classes = [IsStaffUser]

    def get(self, request):
        today = date.today()
        qs = Booking.objects.all()

        confirmed = qs.filter(status='confirmed')
        revenue = confirmed.aggregate(total=Sum('total_price'))['total'] or 0

        total_units = Cabin.objects.count()
        active_units = Cabin.objects.filter(is_active=True).count()
        total_messages = ContactMessage.objects.count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()

        return Response({
            'total_bookings': qs.count(),
            'pending_bookings': qs.filter(status='pending').count(),
            'confirmed_bookings': confirmed.count(),
            'cancelled_bookings': qs.filter(status='cancelled').count(),
            'upcoming_checkins': confirmed.filter(check_in__gte=today).count(),
            'total_revenue': float(revenue),
            'total_units': total_units,
            'active_units': active_units,
            'total_messages': total_messages,
            'unread_messages': unread_messages,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
        })
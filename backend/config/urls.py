from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'Villula Cabins Resort API',
        'timestamp': timezone.now().isoformat(),
        'uptime_monitoring': 'active'
    })


urlpatterns = [
    # Health checks for UptimeRobot monitoring & keeping Render server awake
    path('health/', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),

    path('admin/', admin.site.urls),
    path('api/', include('cabins.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('contacts.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

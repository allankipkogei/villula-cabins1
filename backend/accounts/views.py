from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, EmailVerificationCode
from .serializers import (
    RegisterSerializer,
    VerifyCodeSerializer,
    ResendCodeSerializer,
    LoginSerializer,
    UserSerializer,
)
from .emails import send_verification_email


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. SECURITY CHECK: Verify the Invite Code first
        invite_code = request.data.get('invite_code', '').strip()
        expected_code = getattr(settings, 'STAFF_INVITE_CODE', 'VillulaStaff2026!')
        
        if invite_code != expected_code:
            return Response(
                {"error": "Invalid Invite Code. You are not authorized to register."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Proceed with normal validation
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        full_name = serializer.validated_data.get('full_name', '').strip()
        phone = serializer.validated_data.get('phone', '').strip()

        # Split full name into first and last name
        name_parts = full_name.split(' ', 1) if full_name else ['', '']
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Check if an inactive user exists (from an uncompleted registration)
        user = User.objects.filter(email__iexact=email).first()
        if user:
            if user.is_active:
                return Response(
                    {"error": "An account with this email address already exists. Please log in."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(password)
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        else:
            # Create user inactive until verified, with staff status
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=False,
                is_staff=True
            )

        # Update or create profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone:
            profile.phone = phone
        profile.email_verified = False
        profile.save()

        # Generate and send 6-digit code
        code_record = EmailVerificationCode.generate_code(email=email, purpose='signup', user=user)
        email_sent = send_verification_email(email=email, code=code_record.code, purpose='signup')

        response_data = {
            "message": "Account created! A 6-digit verification code has been sent to your email.",
            "email": email,
            "email_sent": email_sent
        }
        
        if settings.DEBUG and not getattr(settings, 'EMAIL_HOST_USER', None):
            response_data["dev_code"] = code_record.code

        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        code = serializer.validated_data['code'].strip()

        # Query verification record
        record = EmailVerificationCode.objects.filter(
            email__iexact=email,
            code=code,
            is_used=False
        ).order_by('-created_at').first()

        if not record:
            return Response(
                {"error": "Invalid verification code. Please check your code and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if record.is_expired:
            return Response(
                {"error": "This verification code has expired. Please request a new code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark code as used
        record.is_used = True
        record.save()

        # Find user
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"error": "User account not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Activate user and update profile
        user.is_active = True
        user.is_staff = True
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.email_verified = True
        profile.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            "message": "Email verified successfully! Welcome to Villula.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data
        }, status=status.HTTP_200_OK)


class ResendCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        purpose = serializer.validated_data.get('purpose', 'signup')

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"error": "No account found with this email address."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check rate-limiting: don't allow resending more than once every 30 seconds
        recent = EmailVerificationCode.objects.filter(
            email__iexact=email,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(seconds=30)
        ).first()

        if recent:
            return Response(
                {"error": "Please wait a moment before requesting another code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Generate and send code
        code_record = EmailVerificationCode.generate_code(email=email, purpose=purpose, user=user)
        email_sent = send_verification_email(email=email, code=code_record.code, purpose=purpose)

        response_data = {
            "message": "A new 6-digit verification code has been sent to your email.",
            "email": email,
            "email_sent": email_sent
        }
        
        if settings.DEBUG and not getattr(settings, 'EMAIL_HOST_USER', None):
            response_data["dev_code"] = code_record.code

        return Response(response_data, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email'].strip()
        password = serializer.validated_data['password']

        # Find user by email or username
        user = User.objects.filter(email__iexact=email_or_username).first()
        if not user:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # If user is not active, require email verification
        if not user.is_active:
            # Generate and send verification code
            code_record = EmailVerificationCode.generate_code(email=user.email, purpose='signup', user=user)
            send_verification_email(email=user.email, code=code_record.code, purpose='signup')

            return Response({
                "error": "Your email is not yet verified. We have sent a new 6-digit code to your email.",
                "requires_verification": True,
                "email": user.email
            }, status=status.HTTP_403_FORBIDDEN)

        # Issue tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data
        }, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
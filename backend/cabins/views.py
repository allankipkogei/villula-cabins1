from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from bookings.permissions import IsStaffUser
from .models import Cabin, CabinImage, SiteSettings
from .serializers import (
    CabinListSerializer, CabinDetailSerializer,
    CabinAdminSerializer, CabinImageSerializer, SiteSettingsSerializer
)
import traceback
import cloudinary
import cloudinary.uploader


class SiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [IsStaffUser()]
        return [AllowAny()]

    def get_parsers(self):
        return [MultiPartParser(), FormParser(), JSONParser()]

    def get(self, request):
        settings_obj = SiteSettings.get()
        serializer = SiteSettingsSerializer(settings_obj, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        settings_obj = SiteSettings.get()
        
        # Check if a story image was uploaded
        image_file = request.FILES.get('about_image')
        
        if image_file:
            try:
                # Upload directly to Cloudinary
                upload_result = cloudinary.uploader.upload(image_file)
                cloudinary_url = upload_result.get('secure_url')
                
                # Save the secure URL string to the model (ensure your model has a field for this, e.g. about_image_url or similar)
                # If your model uses ImageField, setting it to a string might require you to bypass the field validation.
                # Assuming your model has a field to hold the URL directly:
                settings_obj.about_image_url = cloudinary_url 
                
                # If your model actually has an ImageField, you can save the URL to a separate CharField, or adjust this line based on your model structure.
                # settings_obj.about_image = cloudinary_url 
                
                settings_obj.save()
            except Exception as e:
                traceback.print_exc()
                return Response({'error': f'Cloudinary Upload Failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Process the rest of the text fields
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        return self.patch(request)


class CabinListView(generics.ListAPIView):
    serializer_class = CabinListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Cabin.objects.filter(is_active=True).prefetch_related('images')
        unit_type = self.request.query_params.get('unit_type')
        guests = self.request.query_params.get('guests')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if unit_type:
            qs = qs.filter(unit_type=unit_type)
        if guests:
            try:
                qs = qs.filter(max_guests__gte=int(guests))
            except ValueError:
                pass
        if min_price:
            try:
                qs = qs.filter(price_per_night__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(price_per_night__lte=float(max_price))
            except ValueError:
                pass
        return qs


class CabinDetailView(generics.RetrieveAPIView):
    queryset = Cabin.objects.filter(is_active=True).prefetch_related('images')
    serializer_class = CabinDetailSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


# ---------- ADMIN ----------

class AdminCabinListCreateView(generics.ListCreateAPIView):
    queryset = Cabin.objects.all().prefetch_related('images')
    serializer_class = CabinAdminSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class AdminCabinDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cabin.objects.all().prefetch_related('images')
    serializer_class = CabinAdminSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class AdminCabinImageListCreateView(generics.ListCreateAPIView):
    serializer_class = CabinImageSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        cabin_id = self.request.query_params.get('cabin')
        if cabin_id:
            return CabinImage.objects.filter(cabin_id=cabin_id)
        return CabinImage.objects.all()

    def create(self, request, *args, **kwargs):
        cabin_id = request.data.get('cabin')
        if not cabin_id:
            return Response({'cabin': ['Cabin ID is required.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cabin = Cabin.objects.get(pk=cabin_id)
        except Cabin.DoesNotExist:
            return Response({'cabin': ['Cabin does not exist.']}, status=status.HTTP_404_NOT_FOUND)

        images = request.FILES.getlist('images') or request.FILES.getlist('image')
        alt_text = request.data.get('alt_text', cabin.name) or cabin.name
        force_primary = request.data.get('is_primary') in ['true', 'True', True]

        if images:
            created_instances = []
            has_primary = cabin.images.filter(is_primary=True).exists()

            for idx, img_file in enumerate(images):
                is_primary = False
                if force_primary and idx == 0:
                    is_primary = True
                elif not has_primary and idx == 0:
                    is_primary = True

                if is_primary:
                    cabin.images.filter(is_primary=True).update(is_primary=False)
                    has_primary = True

                try:
                    # THE PERMANENT FIX: Upload directly to Cloudinary
                    upload_result = cloudinary.uploader.upload(img_file)
                    cloudinary_url = upload_result.get('secure_url')

                    # Save ONLY the URL to the external_url field
                    inst = CabinImage.objects.create(
                        cabin=cabin,
                        external_url=cloudinary_url,
                        alt_text=alt_text,
                        is_primary=is_primary
                    )
                    created_instances.append(inst)
                except Exception as e:
                    traceback.print_exc()
                    return Response({'error': f'Cloudinary Upload Failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            serializer = self.get_serializer(created_instances, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        external_url = request.data.get('external_url')
        if external_url and str(external_url).strip():
            has_primary = cabin.images.filter(is_primary=True).exists()
            is_primary = force_primary or (not has_primary)
            if is_primary:
                cabin.images.filter(is_primary=True).update(is_primary=False)

            inst = CabinImage.objects.create(
                cabin=cabin,
                external_url=str(external_url).strip(),
                alt_text=alt_text,
                is_primary=is_primary
            )
            serializer = self.get_serializer(inst, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Please provide an image file or external image URL.'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        cabin_id = self.request.data.get('cabin')
        is_primary = self.request.data.get('is_primary') in ['true', 'True', True]
        if is_primary and cabin_id:
            CabinImage.objects.filter(cabin_id=cabin_id).update(is_primary=False)
        if cabin_id:
            serializer.save(cabin_id=cabin_id, is_primary=is_primary)
        else:
            serializer.save(is_primary=is_primary)


class AdminCabinImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CabinImage.objects.all()
    serializer_class = CabinImageSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_update(self, serializer):
        is_primary = self.request.data.get('is_primary') in ['true', 'True', True]
        instance = self.get_object()
        if is_primary:
            CabinImage.objects.filter(cabin_id=instance.cabin_id).update(is_primary=False)
        serializer.save(is_primary=is_primary)
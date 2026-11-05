from rest_framework import serializers
from .models import Cabin, CabinImage, SiteSettings


def resolve_media_url(img_field, request=None):
    if not img_field:
        return ''
    try:
        url = img_field.url
        if url.startswith('http://') or url.startswith('https://'):
            return url
        if request:
            return request.build_absolute_uri(url)
        return f"http://127.0.0.1:8000{url}"
    except Exception:
        return ''


class CabinImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = CabinImage
        fields = ('id', 'cabin', 'image', 'external_url', 'url', 'alt_text', 'is_primary')
        extra_kwargs = {
            'cabin': {'required': False},
            'image': {'required': False, 'allow_null': True},
            'external_url': {'required': False, 'allow_blank': True},
        }

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return resolve_media_url(obj.image, request)
        return obj.external_url or ''


class CabinListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Cabin
        fields = (
            'id', 'name', 'slug', 'unit_type', 'tagline',
            'price_per_night', 'max_guests', 'bedrooms', 'bathrooms',
            'area_sqft', 'primary_image', 'amenities_list', 'rating', 'review_count'
        )

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            if primary.image:
                url = resolve_media_url(primary.image, request)
                if url:
                    return url
            if primary.external_url:
                return primary.external_url

        for img in obj.images.all():
            if img.image:
                url = resolve_media_url(img.image, request)
                if url:
                    return url
            if img.external_url:
                return img.external_url

        return None

    def get_amenities_list(self, obj):
        if not obj.amenities:
            return []
        return [a.strip() for a in obj.amenities.split(',') if a.strip()]


class CabinDetailSerializer(serializers.ModelSerializer):
    images = CabinImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Cabin
        fields = '__all__'

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            if primary.image:
                url = resolve_media_url(primary.image, request)
                if url:
                    return url
            if primary.external_url:
                return primary.external_url

        for img in obj.images.all():
            if img.image:
                url = resolve_media_url(img.image, request)
                if url:
                    return url
            if img.external_url:
                return img.external_url

        return None

    def get_amenities_list(self, obj):
        if not obj.amenities:
            return []
        return [a.strip() for a in obj.amenities.split(',') if a.strip()]


class CabinAdminSerializer(serializers.ModelSerializer):
    images = CabinImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Cabin
        fields = '__all__'
        read_only_fields = ('slug', 'created_at')

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            if primary.image:
                url = resolve_media_url(primary.image, request)
                if url:
                    return url
            if primary.external_url:
                return primary.external_url

        for img in obj.images.all():
            if img.image:
                url = resolve_media_url(img.image, request)
                if url:
                    return url
            if img.external_url:
                return img.external_url

        return None

    def get_amenities_list(self, obj):
        if not obj.amenities:
            return []
        return [a.strip() for a in obj.amenities.split(',') if a.strip()]


class SiteSettingsSerializer(serializers.ModelSerializer):
    about_image_display = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = '__all__'

    def get_about_image_display(self, obj):
        # 1. Prefer the Cloudinary URL if it exists
        if obj.about_image_url:
            return obj.about_image_url
            
        # 2. Fallback to the local image field if it exists
        if obj.about_image:
            try:
                request = self.context.get('request')
                return request.build_absolute_uri(obj.about_image.url) if request else obj.about_image.url
            except Exception:
                pass
        return ''
from rest_framework import serializers
from django.db import transaction
from .models import Booking


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('cabin', 'guest_name', 'guest_email', 'guest_phone',
                  'check_in', 'check_out', 'guests')

    def validate(self, data):
        if data['check_in'] >= data['check_out']:
            raise serializers.ValidationError("Check-out must be after check-in.")
        if data['guests'] > data['cabin'].max_guests:
            raise serializers.ValidationError(
                f"This cabin fits a maximum of {data['cabin'].max_guests} guests."
            )

        overlapping = Booking.objects.filter(
            cabin=data['cabin'],
            status__in=['pending', 'confirmed'],
            check_in__lt=data['check_out'],
            check_out__gt=data['check_in'],
        ).exists()

        if overlapping:
            raise serializers.ValidationError("These dates are already booked.")
        return data

    def create(self, validated_data):
        with transaction.atomic():
            nights = (validated_data['check_out'] - validated_data['check_in']).days
            
            # The admin price is the FINAL price (tax included)
            # So the grand total is just the price multiplied by the nights
            validated_data['total_price'] = nights * validated_data['cabin'].price_per_night
            return super().create(validated_data)


class BookingAdminSerializer(serializers.ModelSerializer):
    cabin_name = serializers.CharField(source='cabin.name', read_only=True)
    cabin_slug = serializers.SlugField(source='cabin.slug', read_only=True)
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'cabin', 'cabin_name', 'cabin_slug',
            'guest_name', 'guest_email', 'guest_phone',
            'check_in', 'check_out', 'nights', 'guests',
            'total_price', 'status', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_nights(self, obj):
        return (obj.check_out - obj.check_in).days

    def create(self, validated_data):
        if 'total_price' not in validated_data or not validated_data['total_price']:
            nights = (validated_data['check_out'] - validated_data['check_in']).days
            # The admin price is the FINAL price (tax included)
            validated_data['total_price'] = nights * validated_data['cabin'].price_per_night
        return super().create(validated_data)
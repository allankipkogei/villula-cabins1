from django.db import models
from django.utils.text import slugify


class Cabin(models.Model):
    UNIT_TYPE_CHOICES = [
        ('container', 'Container Unit'),
        ('capsule', 'Capsule House'),
    ]

    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True)
    unit_type = models.CharField(
        max_length=20,
        choices=UNIT_TYPE_CHOICES,
        default='capsule',
    )
    tagline = models.CharField(max_length=160, blank=True, default='')
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2)
    max_guests = models.PositiveIntegerField(default=2)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    area_sqft = models.PositiveIntegerField(default=350, help_text="Floor space in square feet")
    amenities = models.TextField(
        blank=True,
        default="Private Hot Tub, Starlink High-Speed Wi-Fi, Panoramic Sun Deck, Kitchenette & Nespresso, Climate Control (Heat & A/C), Outdoor Fire Pit, Luxury Linens",
        help_text="Comma-separated list of amenities"
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Unit'
        verbose_name_plural = 'Units'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_unit_type_display()})"


class CabinImage(models.Model):
    cabin = models.ForeignKey(Cabin, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cabins/', blank=True, null=True)
    external_url = models.URLField(max_length=500, blank=True, null=True, help_text="External image URL fallback")
    alt_text = models.CharField(max_length=150, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'id']

    @property
    def display_url(self):
        if self.image:
            try:
                return self.image.url
            except Exception:
                pass
        return self.external_url or ''

    def __str__(self):
        return f"{self.cabin.name} — image {self.pk}"


class SiteSettings(models.Model):
    resort_name = models.CharField(max_length=120, default="Villula Cabins Resort")
    tagline = models.CharField(max_length=255, default="Modern Architectural Micro-Stays With Panoramic Nature Views")
    about_heading = models.CharField(max_length=200, default="The Villula Story")
    about_text = models.TextField(
        blank=True,
        default="Villula was born from a singular passion: combining award-winning micro-architecture with tranquil scenic surroundings. Our bespoke container suites and futuristic panoramic capsules offer unmatched comfort, private hot tubs, and panoramic nature views in total peace."
    )
    about_image = models.ImageField(upload_to='site/', blank=True, null=True)
    about_image_url = models.URLField(max_length=500, blank=True, null=True)
    contact_phone = models.CharField(max_length=30, blank=True, default="+1 (800) 555-VILLULA")
    contact_email = models.EmailField(blank=True, default="concierge@villulacabins.com")
    contact_address = models.CharField(max_length=300, blank=True, default="VIllula View Villas, Off C646, Eldoret, Uasin Gishu County, Kenya")
    check_in_time = models.CharField(max_length=20, default="1:00 PM")
    check_out_time = models.CharField(max_length=20, default="11:00 AM")
    map_embed_url = models.TextField(
        blank=True,
        default="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.654877395028!2d35.3199392!3d0.5151905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1781030023508837%3A0x75e2b224eac58bcd!2sVIllula%20View%20Villas!5e0!3m2!1sen!2ske!4v1714000000000!5m2!1sen!2ske",
        help_text="Google Maps embed URL or iframe src"
    )
    instagram_url = models.URLField(default='https://www.instagram.com/villulacabinseldoret/')
    # facebook_url = models.URLField(blank=True, null=True)
    

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

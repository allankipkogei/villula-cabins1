import logging
from datetime import datetime
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from cabins.models import SiteSettings

logger = logging.getLogger(__name__)


def send_booking_welcome_email(booking):
    """
    Sends an automated, branded luxury welcome & booking confirmation email
    to the guest when their booking is marked as 'confirmed'.
    """
    if not booking or not booking.guest_email:
        logger.warning(f"Cannot send confirmation email: Missing guest email for booking #{getattr(booking, 'id', None)}")
        return False, "Missing guest email on booking." 

    try:
        # Load site settings for dynamic resort information
        site_settings = SiteSettings.objects.first()
        resort_name = getattr(site_settings, 'resort_name', 'Villula Cabins Resort') or 'Villula Cabins Resort'
        check_in_time = getattr(site_settings, 'check_in_time', '1:00 PM') or '1:00 PM'
        check_out_time = getattr(site_settings, 'check_out_time', '11:00 AM') or '11:00 AM'
        contact_phone = getattr(site_settings, 'contact_phone', '+254 700 000000') or '+254 700 000000'
        contact_email = getattr(site_settings, 'contact_email', 'concierge@villulacabinsresort.co.ke') or 'concierge@villulacabinsresort.co.ke'
        contact_address = getattr(site_settings, 'contact_address', 'VIllula View Villas, Off C646, Eldoret, Uasin Gishu County, Kenya') or 'VIllula View Villas, Off C646, Eldoret, Kenya'
        
        # Calculate stay metrics
        nights = (booking.check_out - booking.check_in).days if (booking.check_out and booking.check_in) else 1
        check_in_str = booking.check_in.strftime('%A, %B %d, %Y') if hasattr(booking.check_in, 'strftime') else str(booking.check_in)
        check_out_str = booking.check_out.strftime('%A, %B %d, %Y') if hasattr(booking.check_out, 'strftime') else str(booking.check_out)
        
        # Format total price
        try:
            formatted_price = f"KSh {float(booking.total_price):,.2f}"
        except Exception:
            formatted_price = f"KSh {booking.total_price}"

        cabin_name = getattr(booking.cabin, 'name', 'Luxury Sanctuary')
        unit_type = booking.cabin.get_unit_type_display() if hasattr(booking.cabin, 'get_unit_type_display') else 'Private Sanctuary'
        
        subject = f"Booking Confirmed: Welcome to {resort_name}! (Ref #VIL-{booking.id})"

        # Plain text fallback
        text_content = f"""
Dear {booking.guest_name},

Warm greetings from {resort_name}!

Your reservation has been officially CONFIRMED. We are honored to host you for an unforgettable architectural escape surrounded by peaceful nature and dark-sky celestial views.

RESERVATION SUMMARY:
--------------------------------------------------
Booking Reference: VIL-{booking.id}
Sanctuary: {cabin_name} ({unit_type})
Check-In: {check_in_str} (From {check_in_time})
Check-Out: {check_out_str} (By {check_out_time})
Duration: {nights} night{'s' if nights > 1 else ''}
Guests: {booking.guests} guest{'s' if booking.guests > 1 else ''}
Total Amount: {formatted_price}
Status: Confirmed

GUEST AMENITIES & ARRIVAL INFORMATION:
--------------------------------------------------
- 24/7 Security: Round-the-clock private security and gated sanctuary entry.
- Complimentary Ample Parking: Secured, spacious on-site parking at no extra charge.
- Starlink Gigabit Wi-Fi: High-speed connectivity throughout the sanctuary.
- Peaceful Nature Views: Panoramic serene landscapes and stargazing skylights.

RESORT LOCATION & DIRECTIONS:
--------------------------------------------------
Address: {contact_address}
Google Maps: https://maps.google.com/?q=Villula+View+Villas+Eldoret

NEED ASSISTANCE OR SPECIAL REQUESTS?
--------------------------------------------------
Our Concierge team is at your service:
Phone / WhatsApp: {contact_phone}
Email: {contact_email}

We look forward to welcoming you soon.

Warmest regards,
The Hospitality Team
{resort_name}
Eldoret, Uasin Gishu County, Kenya
https://villulacabinsresort.co.ke
"""

        # High-aesthetic branded HTML email
        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Reservation is Confirmed</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #F4EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C241E;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E9E2D8;">
    
    <!-- Top Brand Header -->
    <div style="background-color: #0E1B13; padding: 36px 30px; text-align: center; border-bottom: 3px solid #C9A86A;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">V I L L U L A</h1>
      <p style="color: #C9A86A; margin: 8px 0 0; font-size: 13px; letter-spacing: 3px; text-transform: uppercase;">Cabins Resort &bull; Eldoret, Kenya</p>
    </div>

    <!-- Status Banner -->
    <div style="background-color: #E6EFE9; padding: 14px 24px; text-align: center; border-bottom: 1px solid #C4D9C8;">
      <span style="display: inline-block; background-color: #1B3627; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 999px; margin-right: 8px;">
        Confirmed
      </span>
      <span style="color: #1B3627; font-size: 13px; font-weight: 600;">
        Reservation Ref: #VIL-{booking.id}
      </span>
    </div>

    <!-- Content Area -->
    <div style="padding: 36px 30px;">
      <h2 style="margin: 0 0 12px; font-size: 22px; color: #0E1B13; font-weight: 700;">
        Welcome to Stillness, {booking.guest_name}!
      </h2>
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.65; color: #5E6961;">
        We are delighted to confirm your upcoming stay at <strong>{resort_name}</strong>. Your sanctuary is being prepared with thoughtful care so you can rest, unplug, and immerse yourself in panoramic nature views.
      </p>

      <!-- Sanctuary Details Box -->
      <div style="background-color: #FAF8F5; border: 1px solid #E9E2D8; border-radius: 14px; padding: 22px; margin-bottom: 28px;">
        <div style="border-bottom: 1px solid #E9E2D8; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C9A86A; font-weight: 700;">Reserved Sanctuary</div>
            <div style="font-size: 19px; font-weight: 700; color: #0E1B13; margin-top: 2px;">{cabin_name}</div>
          </div>
          <div style="font-size: 12px; color: #5E6961; text-align: right;">
            {unit_type}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #5E6961; width: 40%;">Check-In:</td>
            <td style="padding: 8px 0; color: #1C241E; font-weight: 600;">
              {check_in_str} <span style="color: #1B3627; font-weight: normal;">(from {check_in_time})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5E6961;">Check-Out:</td>
            <td style="padding: 8px 0; color: #1C241E; font-weight: 600;">
              {check_out_str} <span style="color: #1B3627; font-weight: normal;">(by {check_out_time})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5E6961;">Duration:</td>
            <td style="padding: 8px 0; color: #1C241E; font-weight: 600;">
              {nights} Night{'s' if nights > 1 else ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5E6961;">Guests:</td>
            <td style="padding: 8px 0; color: #1C241E; font-weight: 600;">
              {booking.guests} Guest{'s' if booking.guests > 1 else ''}
            </td>
          </tr>
          <tr style="border-top: 1px dashed #DDD5C8;">
            <td style="padding: 12px 0 4px; color: #0E1B13; font-weight: 700; font-size: 15px;">Total Amount:</td>
            <td style="padding: 12px 0 4px; color: #1B3627; font-weight: 700; font-size: 17px;">
              {formatted_price}
            </td>
          </tr>
        </table>
      </div>

      <!-- Key Amenities Highlight -->
      <h3 style="margin: 0 0 14px; font-size: 16px; color: #0E1B13; text-transform: uppercase; letter-spacing: 1px;">
        Included With Your Stay
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13.5px; color: #4A5568;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 50%;">
            <strong style="color: #1B3627;">&#x1F6E1; 24/7 Security</strong><br>
            <span style="font-size: 12px; color: #718096;">Gated premises with 24-hour dedicated guards.</span>
          </td>
          <td style="padding: 8px 0; vertical-align: top; width: 50%;">
            <strong style="color: #1B3627;">&#x1F17F; Ample Parking</strong><br>
            <span style="font-size: 12px; color: #718096;">Complimentary secure parking right by the property.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <strong style="color: #1B3627;">&#x1F4F6; Starlink Gigabit Wi-Fi</strong><br>
            <span style="font-size: 12px; color: #718096;">Ultra-fast satellite internet for work or streaming.</span>
          </td>
          <td style="padding: 8px 0; vertical-align: top;">
            <strong style="color: #1B3627;">&#x1F30C; Celestial Stargazing</strong><br>
            <span style="font-size: 12px; color: #718096;">Curved skylights & dark-sky nocturnal rest.</span>
          </td>
        </tr>
      </table>

      <!-- Location & Direction Section -->
      <div style="background-color: #F2F7F4; border-radius: 14px; padding: 20px; margin-bottom: 28px; border: 1px solid #C4D9C8;">
        <h4 style="margin: 0 0 6px; font-size: 15px; color: #1B3627;">Resort Location & Arrival Directions</h4>
        <p style="margin: 0 0 14px; font-size: 13.5px; color: #4A5568; line-height: 1.5;">
          {contact_address}
        </p>
        <a href="https://maps.google.com/?q=Villula+View+Villas+Eldoret" target="_blank" style="display: inline-block; background-color: #1B3627; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 8px;">
          Open in Google Maps &rarr;
        </a>
      </div>

      <!-- Need Help / Concierge -->
      <p style="margin: 0; font-size: 13.5px; line-height: 1.6; color: #5E6961;">
        Have special requests or need arrival assistance? Contact our concierge at 
        <strong style="color: #1C241E;">{contact_phone}</strong> or reply to this email at 
        <strong style="color: #1C241E;">{contact_email}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #0E1B13; padding: 24px 30px; text-align: center; font-size: 12px; color: #8E9891; border-top: 1px solid rgba(255,255,255,0.08);">
      <p style="margin: 0 0 6px; color: #C9A86A; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
        {resort_name}
      </p>
      <p style="margin: 0; line-height: 1.5;">
        Eldoret, Uasin Gishu County, Kenya &bull; Modern Micro-Architecture & Nature Sanctuary<br>
        <a href="https://villulacabinsresort.co.ke" style="color: #C9A86A; text-decoration: none;">villulacabinsresort.co.ke</a>
      </p>
    </div>

  </div>
</body>
</html>"""

        # HARDCODED SENDER TO MATCH VERIFIED RESEND DOMAIN
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email='Villula Cabins Resort <concierge@villulacabinsresort.co.ke>',
            to=[booking.guest_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Booking welcome email sent to {booking.guest_email} for booking #{booking.id}")
        print(f"[WELCOME EMAIL SENT] Booking #{booking.id} -> {booking.guest_email} (Ref VIL-{booking.id})")
        return True, None

    except Exception as e:
        logger.error(f"Failed to send booking welcome email to {getattr(booking, 'guest_email', 'unknown')}: {e}")
        print(f"[WELCOME EMAIL ERROR] Booking #{getattr(booking, 'id', 'unknown')} -> {e}")
        return False, str(e)
# 🌲 Villula Cabins Resort

A luxury architectural micro-stay booking platform and property management system (PMS) built with a **Django REST Framework** backend, PostgreSQL database, and a modern **React 19 + Vite** frontend.

---

## ✨ Features & Architecture

### 🏡 Public Guest Website
- **Majestic Hero & Search**: Interactive quick-booking search by sanctuary style (Capsule House or Container Unit), guest capacity, and open dates.
- **Curated Sanctuaries Catalog**:
  - Filter by architectural type (`Capsule House` vs. `Container Unit`).
  - Search by amenities (`Hot Tub`, `Sauna`, `Starlink Wi-Fi`, `Fire Pit`, `Skylight`).
  - Sort by price (low to high, high to low) and guest ratings.
- **Detailed Sanctuary Page**:
  - Interactive multi-image gallery with thumbnail switcher and fullscreen zoom.
  - Transparent pricing breakdown: Nightly Rate × Nights + Cleaning Fee + County Lodging Tax.
  - Interactive reservation calendar powered by `react-day-picker` with real-time disabled booked dates.
  - Instant booking confirmation modal with reference ID `#VIL-XXXXXX`.
- **The Villula Story (`/about`)**:
  - Architectural philosophy, sustainability commitments (100% solar offset, zero-footprint foundations).
  - Resort key statistics and interactive FAQ accordion.
- **Concierge & Location (`/contact`)**:
  - Direct concierge contact, check-in instructions, responsive Google Maps embed, and inquiry message form.

### 🛡️ Resort Staff Management Portal (`/admin`)
- **Executive Telemetry Dashboard (`/admin`)**:
  - Real-time KPI cards: Gross Revenue, Total Bookings, Pending Reviews, Upcoming Check-ins, Active Units.
  - Recent Reservations list with one-click **Approve** and **Decline** actions.
  - Recent Guest Inquiries preview.
- **Bookings Management (`/admin/bookings`)**:
  - Search across guest names, emails, phones, and cabin titles.
  - Filter by status tabs: `All`, `Pending`, `Confirmed`, `Cancelled`.
  - Detailed reservation inspector modal and deletion support.
- **Sanctuary Units (`/admin/cabins`)**:
  - Create and edit unit specs: name, architectural type, tagline, description, price/night, bedrooms, bathrooms, area (sqft), and amenities.
  - **Image Manager**: upload image files or provide external URLs, set primary hero photo, or delete photos with instant feedback.
- **Guest Inquiries Inbox (`/admin/messages`)**:
  - Dedicated inbox for contact messages from prospective guests.
  - Mark as read/unread, one-click `Reply via Email` mailto integration, and message deletion.
- **Resort Settings Editor (`/admin/settings`)**:
  - Live editing of Resort Name, Taglines, Story Narrative, Contact Phone, Reservations Email, Physical Address, Check-in/Check-out Times, and Google Map Embed URL.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Django + PostgreSQL)

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Run migrations
python manage.py migrate

# Seed sample sanctuaries, bookings, messages, and default admin
python seed_data.py

# Start Django development server
python manage.py runserver
```
Backend API will be running at `http://127.0.0.1:8000/api/`.

### 2. Frontend Setup (React 19 + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
Frontend will be available at `http://localhost:5173/`.

---



# Payment Integration Guide

## Overview
This guide covers the complete payment integration for the Travel Booking System, including Stripe payment gateway and cash payment options.

## Payment Flow

### 1. Booking Confirmation → Payment
```
/booking/confirm → Check Availability → Create Hold → /booking/payment/[id]
```

### 2. Payment Methods

#### A. Stripe Card Payment
- Full card payment processing via Stripe Checkout
- Automatic booking confirmation on successful payment
- Webhook integration for payment status updates

#### B. Pay at Hotel (Cash/Card)
- Direct confirmation for customers who prefer to pay on arrival
- Booking status: CONFIRMED
- Payment status: PENDING

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Getting Stripe Keys

1. **Sign up at Stripe**
   - Visit: https://dashboard.stripe.com/register
   - Create an account

2. **Get API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key → `STRIPE_SECRET_KEY`

3. **Setup Webhook**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `checkout.session.expired`
   - Copy Signing secret → `STRIPE_WEBHOOK_SECRET`

## File Structure

```
src/
├── app/
│   ├── (customer)/
│   │   └── booking/
│   │       ├── confirm/page.tsx          # Booking confirmation
│   │       ├── payment/[id]/page.tsx     # Payment page
│   │       ├── success/[id]/page.tsx     # Success page
│   │       └── cancel/page.tsx           # Cancel/failure page
│   └── api/
│       ├── booking/
│       │   ├── [id]/route.ts             # Get booking details
│       │   ├── check-availability/route.ts
│       │   └── hold/route.ts
│       └── payment/
│           ├── create-checkout/route.ts  # Create Stripe session
│           ├── confirm/route.ts          # Confirm direct payment
│           └── webhook/route.ts          # Stripe webhook handler
├── components/
│   └── booking/
│       ├── hold-timer.tsx                # 15-min countdown timer
│       └── booking-summary.tsx           # Booking details sidebar
└── lib/
    └── booking-utils.ts                  # Booking utility functions
```

## API Endpoints

### GET /api/booking/[id]
Fetch booking details by ID

**Response:**
```json
{
  "id": "booking-id",
  "roomId": "room-id",
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-05",
  "numberOfGuests": 2,
  "totalPrice": 5000000,
  "status": "ON_HOLD",
  "holdExpiresAt": "2024-01-01T10:15:00Z",
  "room": {
    "roomNumber": "101",
    "roomType": {
      "name": "Deluxe Room",
      "images": ["..."],
      "pricePerNight": 1250000
    }
  }
}
```

### POST /api/payment/create-checkout
Create Stripe checkout session

**Request:**
```json
{
  "bookingId": "booking-id"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/payment/confirm
Confirm direct payment (cash/card at hotel)

**Request:**
```json
{
  "bookingId": "booking-id",
  "paymentMethod": "CASH"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking-id",
    "status": "CONFIRMED",
    "paymentStatus": "PENDING"
  }
}
```

### POST /api/payment/webhook
Stripe webhook handler (called by Stripe)

**Events handled:**
- `checkout.session.completed` → Update booking to CONFIRMED
- `checkout.session.expired` → Update booking to CANCELLED

## Database Schema

### Booking Model
```prisma
model Booking {
  id              String        @id @default(uuid())
  userId          String
  roomId          String
  checkIn         DateTime
  checkOut        DateTime
  numberOfGuests  Int
  totalPrice      Decimal       @db.Decimal(10, 2)
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  stripeSessionId String?
  holdExpiresAt   DateTime?
  guestName       String?
  guestEmail      String?
  guestPhone      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  room Room @relation(fields: [roomId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

enum BookingStatus {
  PENDING
  ON_HOLD
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

## Testing Payment Flow

### Test with Stripe (Development)

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Make a booking**
   - Go to http://localhost:3000
   - Select a room
   - Fill in booking details
   - Proceed to confirmation

3. **Test Card Payment**
   - Click "Pay with Card (Stripe)"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP

4. **Test Direct Payment**
   - Click "Pay at Hotel (Cash/Card)"
   - Booking confirmed immediately

### Test Webhooks Locally

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/payment/webhook
```

Copy the webhook signing secret and update `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Payment Status Flow

```
Initial Booking
    ↓
ON_HOLD (15 minutes)
    ↓
  /---+---\
  |       |
Stripe  Direct
  ↓       ↓
CONFIRMED
  ↓
Payment Status: PAID or PENDING
```

## Security Considerations

1. **API Keys**
   - Never commit `.env` file
   - Use different keys for development and production
   - Rotate keys regularly

2. **Webhook Validation**
   - Always verify webhook signatures
   - Implement idempotency for webhook handlers

3. **Payment Amount**
   - Validate amounts on server-side
   - Never trust client-side data

4. **Booking Hold**
   - Automatically release holds after 15 minutes
   - Run cleanup job to delete expired holds

## Production Deployment

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   STRIPE_SECRET_KEY="sk_live_..."  # Use LIVE keys
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   ```

2. **Setup Webhook in Production**
   - Add webhook endpoint: `https://yourdomain.com/api/payment/webhook`
   - Update `STRIPE_WEBHOOK_SECRET` with production secret

3. **SSL Certificate**
   - Required for Stripe webhooks
   - Use HTTPS in production

4. **Monitoring**
   - Monitor webhook delivery in Stripe Dashboard
   - Set up alerts for failed payments
   - Log all payment transactions

## Troubleshooting

### Payment not confirming
- Check webhook is properly configured
- Verify webhook secret matches
- Check Stripe Dashboard for webhook delivery status

### Hold timer not working
- Ensure `holdExpiresAt` is set correctly
- Check system timezone settings

### Card declined
- Use Stripe test cards in development
- Check card details are correct
- Verify account has sufficient balance (for real cards)

## Next Steps

1. **Add Email Notifications**
   - Send confirmation email after payment
   - Send reminder email before check-in

2. **Add SMS Notifications**
   - SMS confirmation with booking details

3. **Add Refund System**
   - Implement cancellation policy
   - Automatic refund processing

4. **Add Payment History**
   - Customer dashboard with payment history
   - Invoice generation and download

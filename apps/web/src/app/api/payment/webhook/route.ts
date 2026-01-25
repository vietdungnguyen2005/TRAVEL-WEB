import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";
import { sendBookingConfirmationEmail } from "@/lib/email-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Check for idempotency - ensure we don't process the same event twice
    const existingLog = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM webhook_logs WHERE "eventId" = ${event.id} LIMIT 1
    `.catch(() => null);

    if (existingLog && existingLog.length > 0) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Log the webhook event for idempotency
    try {
      await prisma.$executeRaw`
        INSERT INTO webhook_logs ("id", "eventId", "eventType", "processed", "createdAt")
        VALUES (gen_random_uuid(), ${event.id}, ${event.type}, true, NOW())
        ON CONFLICT ("eventId") DO NOTHING
      `;
    } catch (logError) {
      console.error("Failed to log webhook event:", logError);
      // Continue processing even if logging fails
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              paymentStatus: "PAID",
              paymentMethod: "STRIPE",
              holdExpiresAt: null,
            },
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
              room: {
                include: {
                  roomType: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });

          console.log(`Payment confirmed for booking: ${bookingId}`);

          // Send confirmation email (don't await to avoid blocking webhook)
          sendBookingConfirmationEmail(updatedBooking as any).catch((error) => {
            console.error('Failed to send booking confirmation email:', error);
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });

          console.log(`Payment expired for booking: ${bookingId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

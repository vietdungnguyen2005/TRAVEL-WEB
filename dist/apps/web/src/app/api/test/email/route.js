import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { sendBookingConfirmationEmail, sendCheckInReminderEmail, sendCancellationEmail } from "@/lib/email-service";
export async function POST(request) {
    try {
        const session = await auth();
        // Only allow authenticated users (or admins for testing)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { type, email, name } = body;
        // Mock booking data for testing
        const mockBooking = {
            id: "test-booking-" + Date.now(),
            user: {
                email: email || session.user.email || "test@example.com",
                name: name || session.user.name || "Test User",
            },
            room: {
                roomNumber: "101",
                roomType: {
                    name: "Deluxe Room",
                },
            },
            checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
            numberOfGuests: 2,
            totalPrice: 1500000,
            paymentMethod: "STRIPE",
        };
        let result;
        switch (type) {
            case "booking-confirmation":
                result = await sendBookingConfirmationEmail(mockBooking);
                break;
            case "check-in-reminder":
                result = await sendCheckInReminderEmail(mockBooking);
                break;
            case "cancellation":
                result = await sendCancellationEmail(mockBooking, 1500000, "Khách hàng yêu cầu hủy");
                break;
            default:
                return NextResponse.json({ error: "Invalid email type. Use: booking-confirmation, check-in-reminder, or cancellation" }, { status: 400 });
        }
        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `${type} email sent successfully to ${mockBooking.user.email}`,
                data: result.data,
            });
        }
        else {
            return NextResponse.json({
                success: false,
                error: "Failed to send email",
                details: result.error,
            }, { status: 500 });
        }
    }
    catch (error) {
        console.error("Email test error:", error);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
            message: error.message,
        }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map
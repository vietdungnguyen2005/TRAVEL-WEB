import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { resend } from "@/lib/email";
import { sanitizeInput } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 password reset attempts per IP per hour
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await checkRateLimit(`forgot-password:${ip}`, 3);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: user.email,
        subject: "Đặt lại mật khẩu - Travel Booking",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Đặt lại mật khẩu</h1>
                </div>
                <div class="content">
                  <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
                  
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                  
                  <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                  
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
                  </div>
                  
                  <p style="font-size: 12px; color: #666;">
                    Hoặc copy link sau vào trình duyệt:<br>
                    <code>${resetUrl}</code>
                  </p>
                  
                  <div class="warning">
                    <strong>⚠️ Lưu ý:</strong>
                    <ul>
                      <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
                      <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                      <li>Không chia sẻ link này với bất kỳ ai</li>
                    </ul>
                  </div>
                  
                  <p>Trân trọng,<br><strong>Travel Booking Team</strong></p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Travel Booking System. All rights reserved.</p>
                  <p>Email này được gửi tự động, vui lòng không reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      // Don't expose email sending errors to client
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

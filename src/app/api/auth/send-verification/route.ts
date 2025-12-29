import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { resend } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Delete old verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Save new token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: user.email,
        subject: "Xác thực email - Travel Booking",
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
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✉️ Xác thực email</h1>
                </div>
                <div class="content">
                  <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
                  
                  <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Travel Booking</strong>!</p>
                  
                  <p>Vui lòng xác thực email của bạn bằng cách nhấn vào nút bên dưới:</p>
                  
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Xác thực Email</a>
                  </div>
                  
                  <p style="font-size: 12px; color: #666;">
                    Hoặc copy link sau vào trình duyệt:<br>
                    <code>${verificationUrl}</code>
                  </p>
                  
                  <p style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-left: 4px solid #0284c7;">
                    <strong>📌 Lưu ý:</strong> Link này sẽ hết hạn sau <strong>24 giờ</strong>
                  </p>
                  
                  <p>Trân trọng,<br><strong>Travel Booking Team</strong></p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Travel Booking System. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: any) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

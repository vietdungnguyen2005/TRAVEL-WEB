import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary-config";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `avatar_${session.user.id}`,
      rateLimitPresets.upload
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 }
      );
    }

    let imageUrl: string;

    // Check if Cloudinary is configured
    if (isCloudinaryConfigured()) {
      // Convert file to base64 for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Upload to Cloudinary
      const { url } = await uploadToCloudinary(base64, 'travel-booking/avatars');
      imageUrl = url;
    } else {
      // Fallback to UI Avatars if Cloudinary not configured
      console.warn("⚠️ Cloudinary not configured, using fallback avatar");
      const userName = session.user.name || session.user.email || "User";
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=200&background=random`;
    }

    // Update user avatar in database
    if (session.user.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl },
      });
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: "Avatar upload successful",
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

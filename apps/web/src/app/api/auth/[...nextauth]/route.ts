import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.json(
        { error: "NextAuth has been removed" },
        { status: 404 }
    );
}

export function POST() {
    return NextResponse.json(
        { error: "NextAuth has been removed" },
        { status: 404 }
    );
}

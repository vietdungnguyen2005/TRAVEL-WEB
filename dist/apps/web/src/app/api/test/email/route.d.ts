import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    data: import("resend").CreateEmailResponseSuccess | undefined;
}>>;
//# sourceMappingURL=route.d.ts.map
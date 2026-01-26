import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    url: any;
    publicId: any;
    width: any;
    height: any;
}>>;
//# sourceMappingURL=route.d.ts.map
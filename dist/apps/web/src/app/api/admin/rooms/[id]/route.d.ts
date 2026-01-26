import { NextRequest, NextResponse } from "next/server";
export declare function PATCH(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}): Promise<NextResponse<any>>;
export declare function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map
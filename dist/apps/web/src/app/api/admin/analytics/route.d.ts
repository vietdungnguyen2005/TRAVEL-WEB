import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    totalRevenue: any;
    averageBookingValue: number;
    totalBookings: any;
    completionRate: number;
    monthlyData: {
        month: string;
        revenue: any;
        bookings: any;
    }[];
}>>;
//# sourceMappingURL=route.d.ts.map
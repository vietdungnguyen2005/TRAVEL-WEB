"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, DollarSign, Calendar, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
  startOfYear,
} from "date-fns";
import { vi } from "date-fns/locale";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueStats {
  totalRevenue: number;
  averageBookingValue: number;
  totalBookings: number;
  completionRate: number;
  monthlyData: MonthlyRevenue[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6"); // months

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?months=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê doanh thu</h1>
          <p className="text-gray-500 mt-2">
            Phân tích doanh thu và hiệu suất kinh doanh
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 tháng gần đây</SelectItem>
            <SelectItem value="6">6 tháng gần đây</SelectItem>
            <SelectItem value="12">12 tháng gần đây</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng doanh thu
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {period} tháng gần đây
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Giá trị trung bình/đơn
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageBookingValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Trung bình mỗi đặt phòng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng đặt phòng
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đơn đặt hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tỷ lệ hoàn thành
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đơn không bị hủy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelStyle={{ color: '#000' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Số lượng đặt phòng theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#000' }}
                    formatter={(value: any) => [`${value} đơn`, "Số đặt phòng"]}
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="#10b981"
                    name="Đặt phòng"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Revenue Progress Bars (kept for detail) */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết doanh thu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyData.map((data, index) => {
                  const maxRevenue = Math.max(
                    ...stats.monthlyData.map((d) => d.revenue)
                  );
                  const percentage = (data.revenue / maxRevenue) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {data.month}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">
                            {data.bookings} đơn
                          </span>
                          <span className="font-semibold text-gray-900 w-32 text-right">
                            {formatCurrency(data.revenue)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats.monthlyData.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Chưa có dữ liệu doanh thu
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Doanh thu cao nhất</span>
                    <span className="font-semibold">
                      {stats.monthlyData.length > 0
                        ? formatCurrency(
                            Math.max(...stats.monthlyData.map((d) => d.revenue))
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Doanh thu thấp nhất</span>
                    <span className="font-semibold">
                      {stats.monthlyData.length > 0
                        ? formatCurrency(
                            Math.min(...stats.monthlyData.map((d) => d.revenue))
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">
                      Trung bình doanh thu/tháng
                    </span>
                    <span className="font-semibold">
                      {stats.monthlyData.length > 0
                        ? formatCurrency(
                            stats.totalRevenue / stats.monthlyData.length
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">
                      Trung bình đơn/tháng
                    </span>
                    <span className="font-semibold">
                      {stats.monthlyData.length > 0
                        ? Math.round(
                            stats.totalBookings / stats.monthlyData.length
                          )
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xu hướng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyData.length >= 2 && (
                    <>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">
                          Tăng trưởng doanh thu
                        </span>
                        <span
                          className={`font-semibold ${
                            stats.monthlyData[stats.monthlyData.length - 1]
                              .revenue >=
                            stats.monthlyData[stats.monthlyData.length - 2]
                              .revenue
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stats.monthlyData[stats.monthlyData.length - 2]
                            .revenue > 0
                            ? (
                                ((stats.monthlyData[
                                  stats.monthlyData.length - 1
                                ].revenue -
                                  stats.monthlyData[
                                    stats.monthlyData.length - 2
                                  ].revenue) /
                                  stats.monthlyData[
                                    stats.monthlyData.length - 2
                                  ].revenue) *
                                100
                              ).toFixed(1)
                            : "N/A"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">
                          Tăng trưởng đơn hàng
                        </span>
                        <span
                          className={`font-semibold ${
                            stats.monthlyData[stats.monthlyData.length - 1]
                              .bookings >=
                            stats.monthlyData[stats.monthlyData.length - 2]
                              .bookings
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stats.monthlyData[stats.monthlyData.length - 2]
                            .bookings > 0
                            ? (
                                ((stats.monthlyData[
                                  stats.monthlyData.length - 1
                                ].bookings -
                                  stats.monthlyData[
                                    stats.monthlyData.length - 2
                                  ].bookings) /
                                  stats.monthlyData[
                                    stats.monthlyData.length - 2
                                  ].bookings) *
                                100
                              ).toFixed(1)
                            : "N/A"}
                          %
                        </span>
                      </div>
                    </>
                  )}
                  <div className="py-3">
                    <p className="text-sm text-gray-600">
                      {stats.monthlyData.length >= 2 &&
                      stats.monthlyData[stats.monthlyData.length - 1].revenue >=
                        stats.monthlyData[stats.monthlyData.length - 2].revenue
                        ? "📈 Doanh thu đang có xu hướng tăng trưởng tích cực"
                        : "📉 Cần xem xét các chiến lược để cải thiện doanh thu"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Không thể tải dữ liệu thống kê</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

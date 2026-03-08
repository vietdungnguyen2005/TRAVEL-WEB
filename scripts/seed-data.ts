/**
 * Seed script for TRAVEL-WEB using Supabase REST API (PostgREST).
 * Works even when direct PostgreSQL connections are blocked.
 *
 * Usage:
 *   npx tsx scripts/seed-data.ts
 */

const SUPABASE_URL = "https://goeloxcyozsziemrepfe.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZWxveGN5b3pzemllbXJlcGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM1NDI4NSwiZXhwIjoyMDg0OTMwMjg1fQ.YacuX8wzIH3qknlyc8UoyJNpYRSynLittUdNvDWRzTY";

// Supabase PostgREST exposes tables via REST. We need to use the SQL endpoint
// (rpc) or rely on the service role key having access to the correct schemas.

async function supabaseSQL(sql: string) {
  // Use the /rest/v1/rpc endpoint won't work for raw SQL.
  // Use the /pg endpoint (Supabase SQL via HTTP) if available, or use
  // the PostgREST table endpoints.
  // Actually, Supabase exposes tables only in the `public` schema by default.
  // Our tables are in `room`, `app_auth` etc. We need to use Supabase SQL Editor API.

  // Alternative: use supabase-js client to call rpc functions or the management API.
  // The simplest approach is to use the Supabase Management API's SQL endpoint.

  throw new Error("Direct SQL not supported via REST. Using table endpoints instead.");
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function upsertToTable(schema: string, table: string, data: Record<string, unknown>[]) {
  // Supabase PostgREST only exposes `public` schema by default.
  // To access other schemas, we need to set the `Accept-Profile` / `Content-Profile` header.
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Profile": schema,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upsert ${schema}.${table}: ${res.status} ${text}`);
  }

  return res;
}

// ──────────────────── Room Types ────────────────────
const roomTypes = [
  {
    name: "Standard",
    description:
      "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản, phù hợp cho khách du lịch cá nhân hoặc cặp đôi. View thành phố, diện tích 25m².",
    basePrice: 800000,
    maxGuests: 2,
    amenities: ["WiFi", "Điều hòa", "TV", "Minibar", "Két an toàn"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Superior",
    description:
      "Phòng superior rộng rãi với ban công riêng, view biển hoặc núi. Diện tích 35m², nội thất cao cấp.",
    basePrice: 1200000,
    maxGuests: 2,
    amenities: ["WiFi", "Điều hòa", "TV 55 inch", "Minibar", "Két an toàn", "Ban công", "Áo choàng tắm"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Deluxe",
    description:
      "Phòng Deluxe sang trọng với không gian sống rộng 45m², bồn tắm đứng và bồn tắm nằm riêng biệt. View panorama tuyệt đẹp.",
    basePrice: 1800000,
    maxGuests: 3,
    amenities: [
      "WiFi", "Điều hòa", "Smart TV 65 inch", "Minibar", "Két an toàn",
      "Ban công", "Bồn tắm", "Máy pha cà phê", "Dép đi trong phòng",
    ],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Suite",
    description:
      "Suite cao cấp với phòng khách và phòng ngủ riêng biệt, diện tích 65m². Dịch vụ quản gia riêng, minibar miễn phí.",
    basePrice: 3500000,
    maxGuests: 4,
    amenities: [
      "WiFi", "Điều hòa", "Smart TV 75 inch", "Minibar miễn phí", "Két an toàn",
      "Ban công rộng", "Bồn tắm Jacuzzi", "Máy pha cà phê Nespresso",
      "Phòng khách riêng", "Quản gia riêng",
    ],
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Presidential Suite",
    description:
      "Phòng tổng thống diện tích 120m², phòng ăn riêng, phòng khách sang trọng, 2 phòng ngủ và view toàn cảnh thành phố.",
    basePrice: 8000000,
    maxGuests: 6,
    amenities: [
      "WiFi", "Điều hòa", "Smart TV 85 inch", "Minibar miễn phí", "Két an toàn lớn",
      "Sân thượng riêng", "Bồn tắm Jacuzzi", "Phòng xông hơi",
      "Phòng ăn riêng", "Quản gia 24/7", "Đưa đón sân bay",
    ],
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Family Room",
    description:
      "Phòng gia đình lý tưởng cho gia đình có trẻ nhỏ. Diện tích 50m² với 2 giường lớn, khu vui chơi trẻ em.",
    basePrice: 2200000,
    maxGuests: 5,
    amenities: [
      "WiFi", "Điều hòa", "TV", "Minibar", "Két an toàn",
      "2 giường Queen", "Bàn học", "Khu vui chơi trẻ em",
    ],
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Ocean View Deluxe",
    description:
      "Phòng Deluxe hướng biển với ban công rộng, ngắm bình minh và hoàng hôn. Diện tích 50m², phong cách nhiệt đới sang trọng.",
    basePrice: 2500000,
    maxGuests: 3,
    amenities: [
      "WiFi", "Điều hòa", "Smart TV 65 inch", "Minibar", "Két an toàn",
      "Ban công view biển", "Bồn tắm view biển", "Máy pha cà phê", "Ghế tắm nắng",
    ],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
  {
    name: "Mountain View Villa",
    description:
      "Villa riêng biệt view núi rừng tuyệt đẹp, phong cách kiến trúc bản địa kết hợp hiện đại. Sân vườn riêng, hồ bơi nhỏ.",
    basePrice: 4500000,
    maxGuests: 4,
    amenities: [
      "WiFi", "Điều hòa", "Smart TV", "Minibar", "Két an toàn",
      "Sân vườn riêng", "Hồ bơi nhỏ", "Bếp nhỏ", "Lò sưởi", "View núi",
    ],
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop",
    ],
    isActive: true,
  },
];

// ──────────────────── Main ────────────────────
async function main() {
  console.log("Starting seed via Supabase REST API...\n");

  // ─── 1. Insert room types ───
  console.log(`Inserting ${roomTypes.length} room types...`);
  try {
    await upsertToTable("room", "RoomType", roomTypes);
    console.log("  ✓ Room types inserted.");
  } catch (e: any) {
    console.error("  ✗ Room types failed:", e.message);
    // Try one by one
    for (const rt of roomTypes) {
      try {
        await upsertToTable("room", "RoomType", [rt]);
        console.log(`  ✓ ${rt.name}`);
      } catch (e2: any) {
        console.error(`  ✗ ${rt.name}: ${e2.message}`);
      }
    }
  }

  // ─── 2. Get room types back with IDs ───
  console.log("\nFetching room types...");
  const rtRes = await fetch(`${SUPABASE_URL}/rest/v1/RoomType?select=id,name,basePrice`, {
    headers: { ...headers, "Accept-Profile": "room" },
  });
  if (!rtRes.ok) {
    const t = await rtRes.text();
    console.error(`Failed to fetch room types: ${rtRes.status} ${t}`);
    return;
  }
  const existingTypes = (await rtRes.json()) as { id: string; name: string; basePrice: number }[];
  console.log(`  Found ${existingTypes.length} room types.`);

  // ─── 3. Generate rooms ───
  const locationPrefixes = ["HN", "SG", "DN", "NT", "HA", "DL", "PQ", "HL", "HU", "SP", "QN", "VT"];
  const rooms: Record<string, unknown>[] = [];

  for (const rt of existingTypes) {
    const roomsPerType = rt.basePrice >= 3500000 ? 3 : rt.basePrice >= 1800000 ? 5 : 8;
    for (let i = 0; i < roomsPerType; i++) {
      const locPrefix = locationPrefixes[i % locationPrefixes.length];
      const floor = Math.floor(i / 3) + 1;
      const roomNum = `${locPrefix}-${String(floor).padStart(2, "0")}${String((i % 3) + 1).padStart(2, "0")}`;
      rooms.push({
        roomNumber: roomNum,
        roomTypeId: rt.id,
        status: "AVAILABLE",
        floor,
      });
    }
  }

  console.log(`\nInserting ${rooms.length} rooms...`);
  // Insert in batches of 20 to avoid payload limits
  const batchSize = 20;
  for (let i = 0; i < rooms.length; i += batchSize) {
    const batch = rooms.slice(i, i + batchSize);
    try {
      await upsertToTable("room", "Room", batch);
      console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1} (${batch.length} rooms)`);
    } catch (e: any) {
      console.error(`  ✗ Batch ${Math.floor(i / batchSize) + 1}: ${e.message}`);
      // Try individually
      for (const r of batch) {
        try {
          await upsertToTable("room", "Room", [r]);
        } catch (e2: any) {
          console.error(`    ✗ Room ${(r as any).roomNumber}: ${e2.message}`);
        }
      }
    }
  }

  // ─── 4. Create test users ───
  console.log("\nCreating test users...");
  const bcrypt = await import("bcryptjs");

  const testUsers = [
    {
      email: "admin@travelbook.vn",
      password: await bcrypt.hash("Admin@2025", 10),
      name: "Admin TravelBook",
      role: "ADMIN",
      isVerified: true,
    },
    {
      email: "user@travelbook.vn",
      password: await bcrypt.hash("User@2025", 10),
      name: "Nguyễn Văn Khách",
      role: "CUSTOMER",
      isVerified: true,
    },
    {
      email: "user2@travelbook.vn",
      password: await bcrypt.hash("User@2025", 10),
      name: "Trần Thị Hương",
      role: "CUSTOMER",
      isVerified: true,
    },
  ];

  for (const u of testUsers) {
    try {
      // Check if user exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(u.email)}&select=id`,
        { headers: { ...headers, "Accept-Profile": "app_auth" } }
      );
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`  → ${u.email} already exists, skipping.`);
        continue;
      }

      await upsertToTable("app_auth", "User", [u]);
      console.log(`  ✓ ${u.email} (${u.role})`);
    } catch (e: any) {
      console.error(`  ✗ ${u.email}: ${e.message}`);
    }
  }

  // ─── 5. Summary ───
  const rtCountRes = await fetch(`${SUPABASE_URL}/rest/v1/RoomType?select=id`, {
    headers: { ...headers, "Accept-Profile": "room", Prefer: "count=exact" },
  });
  const rCountRes = await fetch(`${SUPABASE_URL}/rest/v1/Room?select=id`, {
    headers: { ...headers, "Accept-Profile": "room", Prefer: "count=exact" },
  });
  const uCountRes = await fetch(`${SUPABASE_URL}/rest/v1/User?select=id`, {
    headers: { ...headers, "Accept-Profile": "app_auth", Prefer: "count=exact" },
  });

  const rtTotal = rtCountRes.headers.get("content-range")?.split("/")[1] ?? "?";
  const rTotal = rCountRes.headers.get("content-range")?.split("/")[1] ?? "?";
  const uTotal = uCountRes.headers.get("content-range")?.split("/")[1] ?? "?";

  console.log("\n═══════════════════════════════════════");
  console.log(`  Room Types: ${rtTotal}`);
  console.log(`  Rooms:      ${rTotal}`);
  console.log(`  Users:      ${uTotal}`);
  console.log("═══════════════════════════════════════");

  console.log("\nTest accounts:");
  console.log("  Admin: admin@travelbook.vn / Admin@2025");
  console.log("  User:  user@travelbook.vn  / User@2025");
  console.log("  User2: user2@travelbook.vn / User@2025");

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

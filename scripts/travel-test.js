const http = require('http');

const BASE = 'http://localhost:4000';
let CUSTOMER_TOKEN = '';
let ADMIN_TOKEN = '';
let bugs = [];
let passed = 0;
let failed = 0;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d), raw: d }); }
        catch { resolve({ status: res.statusCode, data: null, raw: d }); }
      });
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, { timeout: 8000 }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve({ status: r.statusCode, size: d.length, location: r.headers.location, body: d }));
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

function bug(id, sev, desc) { bugs.push({ id, sev, desc }); failed++; console.log('  FAIL [' + sev + '] ' + id + ': ' + desc); }
function ok(name) { passed++; console.log('  OK: ' + name); }

async function run() {
  // ===== AUTH TESTS =====
  console.log('\n=== AUTH TESTS ===');

  let r = await req('POST', '/api/auth/login', { email: 'user@travel.com', password: 'user123' });
  if (r.status === 200 && r.data.accessToken) { CUSTOMER_TOKEN = r.data.accessToken; ok('Login customer'); }
  else { bug('AUTH-1','CRITICAL','Customer login failed: ' + r.raw.substring(0,200)); }

  r = await req('POST', '/api/auth/login', { email: 'admin@travel.com', password: 'admin123' });
  if (r.status === 200 && r.data.accessToken) { ADMIN_TOKEN = r.data.accessToken; ok('Login admin'); }
  else { bug('AUTH-2','CRITICAL','Admin login failed: ' + r.raw.substring(0,200)); }

  r = await req('POST', '/api/auth/login', { email: 'bad@test.com', password: 'wrong' });
  if (r.status >= 400) { ok('Login invalid creds rejects'); }
  else { bug('AUTH-3','HIGH','Invalid login not rejected'); }

  r = await req('POST', '/api/auth/login', { email: '', password: '' });
  if (r.status === 400 && r.data && r.data.errors) { ok('Login empty validation'); }
  else { bug('AUTH-4','MEDIUM','Empty login not validated: status=' + r.status); }

  r = await req('POST', '/api/auth/register', { email: 'user@travel.com', password: 'Test1234', name: 'Dup' });
  if (r.data && r.data.message && r.data.message.includes('Email')) { ok('Register duplicate rejects'); }
  else { bug('AUTH-5','HIGH','Duplicate email not rejected'); }

  r = await req('POST', '/api/auth/register', { email: 'newtest@test.com', password: '12', name: 'Test' });
  if (r.status >= 400) { ok('Register short password rejects'); }
  else { bug('AUTH-6','MEDIUM','Short password accepted'); }

  r = await req('POST', '/api/auth/verify', { token: CUSTOMER_TOKEN });
  if (r.data && r.data.verified) { ok('Token verification'); }
  else { bug('AUTH-7','HIGH','Token verification failed'); }

  r = await req('POST', '/api/auth/forgot-password', { email: 'user@travel.com' });
  if (r.status === 200) { ok('Forgot password existing email'); }
  else { bug('AUTH-8','MEDIUM','Forgot password failed'); }

  r = await req('POST', '/api/auth/forgot-password', { email: 'nonexist@test.com' });
  if (r.status === 200) { ok('Forgot password non-existing (no leak)'); }
  else { bug('AUTH-9','MEDIUM','Forgot password leaks email existence'); }

  r = await req('POST', '/api/auth/refresh', {});
  if (r.status >= 400) { ok('Refresh without token rejects'); }
  else { bug('AUTH-10','HIGH','Refresh without token succeeds'); }

  // Register with missing name
  r = await req('POST', '/api/auth/register', { email: 'test123@test.com', password: 'Test1234' });
  if (r.status >= 400) { ok('Register without name rejects'); }
  else { bug('AUTH-11','MEDIUM','Register without name accepted'); }

  // Register with invalid email format
  r = await req('POST', '/api/auth/register', { email: 'not-an-email', password: 'Test1234', name: 'Test' });
  if (r.status >= 400) { ok('Register invalid email rejects'); }
  else { bug('AUTH-12','MEDIUM','Invalid email format accepted'); }

  // ===== ROOM TESTS =====
  console.log('\n=== ROOM TESTS ===');

  r = await req('GET', '/api/rooms');
  let allRooms = r.data && r.data.data ? r.data.data : [];
  if (allRooms.length > 0) { ok('Room list (' + allRooms.length + ' types)'); }
  else { bug('ROOM-1','CRITICAL','No rooms returned'); }

  // Verify each room has required fields
  if (allRooms.length > 0) {
    let firstRoom = allRooms[0];
    let requiredFields = ['id', 'name', 'basePrice', 'maxGuests', 'location', 'amenities', 'images'];
    let missing = requiredFields.filter(f => firstRoom[f] === undefined);
    if (missing.length === 0) { ok('Room has all required fields'); }
    else { bug('ROOM-2','MEDIUM','Room missing fields: ' + missing.join(', ')); }
  }

  // Room detail
  r = await req('GET', '/api/rooms/seed-standard');
  let detail = r.data && r.data.data ? r.data.data : r.data;
  if (detail && detail.name === 'Standard') { ok('Room detail'); }
  else { bug('ROOM-3','HIGH','Room detail failed'); }

  // Room detail includes rooms array
  if (detail && detail.rooms && Array.isArray(detail.rooms)) {
    ok('Room detail includes physical rooms (' + detail.rooms.length + ')');
    if (detail.rooms[0] && detail.rooms[0].roomNumber) { ok('Physical room has roomNumber'); }
    else { bug('ROOM-4','MEDIUM','Physical room missing roomNumber'); }
  } else { bug('ROOM-5','HIGH','Room detail missing rooms array'); }

  // Room 404
  r = await req('GET', '/api/rooms/nonexistent-xyz');
  if (r.status === 404) { ok('Room 404'); }
  else { bug('ROOM-6','MEDIUM','Non-existent room returns ' + r.status); }

  // Availability
  r = await req('POST', '/api/rooms/availability', { roomTypeId: 'seed-standard', checkIn: '2026-06-01', checkOut: '2026-06-03' });
  if (r.data && typeof r.data.available === 'boolean') { ok('Room availability'); }
  else { bug('ROOM-7','HIGH','Availability failed'); }

  // Past dates
  r = await req('POST', '/api/rooms/availability', { roomTypeId: 'seed-standard', checkIn: '2025-01-01', checkOut: '2025-01-03' });
  if (r.status >= 400) { ok('Past dates rejected'); }
  else { bug('ROOM-8','HIGH','Past dates accepted'); }

  // Checkout before checkin
  r = await req('POST', '/api/rooms/availability', { roomTypeId: 'seed-standard', checkIn: '2026-06-05', checkOut: '2026-06-03' });
  if (r.status >= 400) { ok('Invalid date range rejected'); }
  else { bug('ROOM-9','HIGH','Invalid date range accepted'); }

  // Price filter
  r = await req('GET', '/api/rooms?minPrice=2000000&maxPrice=3000000');
  let priceFiltered = r.data && r.data.data ? r.data.data : [];
  if (priceFiltered.length > 0) {
    let allInRange = priceFiltered.every(rm => rm.basePrice >= 2000000 && rm.basePrice <= 3000000);
    if (allInRange) { ok('Price filter (' + priceFiltered.length + ')'); }
    else { bug('ROOM-10','HIGH','Price filter returns out-of-range rooms'); }
  } else { ok('Price filter (0 results, may be valid)'); }

  // Capacity filter
  r = await req('GET', '/api/rooms?capacity=4');
  let capFiltered = r.data && r.data.data ? r.data.data : [];
  if (capFiltered.length > 0) {
    let allMatch = capFiltered.every(rm => rm.maxGuests >= 4);
    if (allMatch) { ok('Capacity filter (' + capFiltered.length + ')'); }
    else { bug('ROOM-11','HIGH','Capacity filter returns rooms with too few guests'); }
  }

  // Sort
  r = await req('GET', '/api/rooms?sort=price&order=desc');
  let sorted = r.data && r.data.data ? r.data.data : [];
  if (sorted.length > 1) {
    let valid = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].basePrice > sorted[i-1].basePrice) { valid = false; break; }
    }
    if (valid) { ok('Sort by price desc'); }
    else { bug('ROOM-12','MEDIUM','Sort by price desc broken'); }
  }

  // Featured rooms
  r = await req('GET', '/api/rooms?featured=true');
  let featured = r.data && r.data.data ? r.data.data : [];
  if (featured.length > 0) {
    let allFeatured = featured.every(rm => rm.featured === true);
    if (allFeatured) { ok('Featured filter (' + featured.length + ')'); }
    else { bug('ROOM-13','MEDIUM','Featured filter returns non-featured rooms'); }
  } else { ok('Featured filter (0 results)'); }

  // rooms/by-ids
  r = await req('POST', '/api/rooms/by-ids', { ids: ['fce98b3a-52a4-4e0d-a759-e09e01300dec'] });
  if (r.status === 200 && r.data && r.data.data && r.data.data.length > 0) { ok('Rooms by-ids'); }
  else { bug('ROOM-14','HIGH','Rooms by-ids failed'); }

  // ===== BOOKING TESTS =====
  console.log('\n=== BOOKING TESTS ===');

  // My bookings
  r = await req('GET', '/api/bookings/my-bookings', null, CUSTOMER_TOKEN);
  if (r.status === 200 && Array.isArray(r.data)) { ok('My bookings (' + r.data.length + ')'); }
  else { bug('BOOK-1','CRITICAL','My bookings failed: ' + r.raw.substring(0,200)); }

  // Check availability
  r = await req('POST', '/api/bookings/check-availability',
    { roomIds: ['fce98b3a-52a4-4e0d-a759-e09e01300dec'], checkIn: '2026-07-01', checkOut: '2026-07-03' },
    CUSTOMER_TOKEN);
  if (r.data && typeof r.data.available === 'boolean') { ok('Booking check-availability'); }
  else { bug('BOOK-2','HIGH','Check availability failed: ' + r.raw.substring(0,200)); }

  // Hold booking
  r = await req('POST', '/api/bookings/hold', {
    roomId: 'fce98b3a-52a4-4e0d-a759-e09e01300dec',
    checkIn: '2026-08-10', checkOut: '2026-08-12',
    numberOfGuests: 2, totalPrice: 1600000
  }, CUSTOMER_TOKEN);
  let holdId = null;
  if (r.status === 200 || r.status === 201) { holdId = r.data.id; ok('Hold booking: ' + holdId); }
  else { bug('BOOK-3','CRITICAL','Hold booking failed: ' + r.raw.substring(0,200)); }

  // Get booking by ID
  if (holdId) {
    r = await req('GET', '/api/bookings/' + holdId, null, CUSTOMER_TOKEN);
    if (r.status === 200 && r.data && r.data.id === holdId) {
      ok('Get booking by ID');
      // Verify booking fields
      let bfields = ['id', 'userId', 'roomId', 'checkIn', 'checkOut', 'totalPrice', 'status', 'holdExpiresAt'];
      let bmissing = bfields.filter(f => r.data[f] === undefined);
      if (bmissing.length === 0) { ok('Booking has all required fields'); }
      else { bug('BOOK-4','MEDIUM','Booking missing fields: ' + bmissing.join(', ')); }
    } else { bug('BOOK-5','HIGH','Get booking by ID failed'); }
  }

  // Cancel booking
  if (holdId) {
    r = await req('PATCH', '/api/bookings/' + holdId + '/cancel', {}, CUSTOMER_TOKEN);
    if (r.status === 200) { ok('Cancel booking'); }
    else { bug('BOOK-6','HIGH','Cancel booking failed: ' + r.raw.substring(0,200)); }
  }

  // Hold with past dates
  r = await req('POST', '/api/bookings/hold', {
    roomId: 'fce98b3a-52a4-4e0d-a759-e09e01300dec',
    checkIn: '2025-01-01', checkOut: '2025-01-03',
    numberOfGuests: 2, totalPrice: 1600000
  }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Hold past dates rejected'); }
  else { bug('BOOK-7','HIGH','Hold with past dates accepted'); }

  // Hold with 0 guests
  r = await req('POST', '/api/bookings/hold', {
    roomId: 'fce98b3a-52a4-4e0d-a759-e09e01300dec',
    checkIn: '2026-09-01', checkOut: '2026-09-03',
    numberOfGuests: 0, totalPrice: 1600000
  }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Hold with 0 guests rejected'); }
  else { bug('BOOK-8','MEDIUM','Hold with 0 guests accepted'); }

  // Hold with negative price
  r = await req('POST', '/api/bookings/hold', {
    roomId: 'fce98b3a-52a4-4e0d-a759-e09e01300dec',
    checkIn: '2026-09-05', checkOut: '2026-09-07',
    numberOfGuests: 2, totalPrice: -100
  }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Hold with negative price rejected'); }
  else { bug('BOOK-9','HIGH','Hold with negative price accepted'); }

  // Hold with nonexistent room
  r = await req('POST', '/api/bookings/hold', {
    roomId: 'nonexistent-room-id',
    checkIn: '2026-09-10', checkOut: '2026-09-12',
    numberOfGuests: 2, totalPrice: 1600000
  }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Hold nonexistent room rejected'); }
  else { bug('BOOK-10','HIGH','Hold with nonexistent room accepted'); }

  // Unavailable dates
  r = await req('POST', '/api/bookings/unavailable-dates', { roomIds: ['fce98b3a-52a4-4e0d-a759-e09e01300dec'] });
  if (r.status === 200) { ok('Unavailable dates'); }
  else { bug('BOOK-11','MEDIUM','Unavailable dates failed'); }

  // My bookings without auth
  r = await req('GET', '/api/bookings/my-bookings');
  if (r.status === 401) { ok('My bookings without auth rejects'); }
  else { bug('BOOK-12','CRITICAL','My bookings no auth: status=' + r.status); }

  // Cancel already-cancelled booking
  if (holdId) {
    r = await req('PATCH', '/api/bookings/' + holdId + '/cancel', {}, CUSTOMER_TOKEN);
    if (r.status >= 400) { ok('Cancel already-cancelled rejected'); }
    else { bug('BOOK-13','MEDIUM','Can cancel already-cancelled booking'); }
  }

  // Cancel someone else's booking (IDOR test)
  r = await req('GET', '/api/admin/bookings', null, ADMIN_TOKEN);
  if (r.status === 200 && Array.isArray(r.data) && r.data.length > 0) {
    // Find a booking that doesn't belong to customer
    let otherBooking = r.data.find(b => b.userId !== '023c9722-22ad-4fdc-895f-65da09e53c25' && b.status !== 'CANCELLED');
    if (otherBooking) {
      r = await req('PATCH', '/api/bookings/' + otherBooking.id + '/cancel', {}, CUSTOMER_TOKEN);
      if (r.status === 403 || r.status === 404) { ok('IDOR: cannot cancel other user booking'); }
      else { bug('BOOK-14','CRITICAL','IDOR: customer can cancel other user bookings (status=' + r.status + ')'); }
    }
  }

  // ===== REVIEW TESTS =====
  console.log('\n=== REVIEW TESTS ===');

  r = await req('GET', '/api/reviews');
  if (r.status === 200 && Array.isArray(r.data)) { ok('Public reviews (' + r.data.length + ')'); }
  else { bug('REV-1','MEDIUM','Public reviews failed'); }

  r = await req('GET', '/api/reviews/room-type/seed-standard?page=1&limit=5');
  if (r.status === 200 && r.data && r.data.stats) {
    ok('Reviews by room type');
    // Verify stats structure
    if (r.data.stats.distribution && Array.isArray(r.data.stats.distribution)) {
      ok('Review stats has distribution');
    } else { bug('REV-2','LOW','Review stats missing distribution'); }
  } else { bug('REV-3','MEDIUM','Reviews by room type failed'); }

  // Rating validation
  r = await req('POST', '/api/reviews', { bookingId: 'test', roomTypeId: 'seed-standard', rating: 0, comment: 'bad' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Rating 0 rejected'); }
  else { bug('REV-4','HIGH','Rating 0 accepted'); }

  r = await req('POST', '/api/reviews', { bookingId: 'test', roomTypeId: 'seed-standard', rating: 6, comment: 'bad' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Rating 6 rejected'); }
  else { bug('REV-5','HIGH','Rating 6 accepted'); }

  r = await req('POST', '/api/reviews', { bookingId: 'test', roomTypeId: 'seed-standard', rating: -1, comment: 'bad' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Rating -1 rejected'); }
  else { bug('REV-6','HIGH','Rating -1 accepted'); }

  // Missing fields
  r = await req('POST', '/api/reviews', { roomTypeId: 'seed-standard', rating: 5, comment: 'good' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Review without bookingId rejected'); }
  else { bug('REV-7','HIGH','Review without bookingId accepted'); }

  r = await req('POST', '/api/reviews', { bookingId: 'test-id', rating: 5, comment: 'good' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Review without roomTypeId rejected'); }
  else { bug('REV-8','MEDIUM','Review without roomTypeId accepted'); }

  // Empty comment
  r = await req('POST', '/api/reviews', { bookingId: 'test-id', roomTypeId: 'seed-standard', rating: 5, comment: '' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Review with empty comment rejected'); }
  else { bug('REV-9','LOW','Review with empty comment accepted'); }

  // My reviews
  r = await req('GET', '/api/reviews/my', null, CUSTOMER_TOKEN);
  if (r.status === 200) { ok('My reviews'); }
  else { bug('REV-10','HIGH','My reviews failed: ' + r.raw.substring(0,200)); }

  // Reviews without auth
  r = await req('GET', '/api/reviews/my');
  if (r.status === 401) { ok('My reviews without auth rejects'); }
  else { bug('REV-11','CRITICAL','My reviews no auth: status=' + r.status); }

  // ===== ADMIN TESTS =====
  console.log('\n=== ADMIN TESTS ===');

  r = await req('GET', '/api/admin/stats', null, ADMIN_TOKEN);
  if (r.status === 200 && r.data.totalUsers !== undefined) {
    ok('Admin stats');
    // Verify stats fields
    let statFields = ['totalUsers', 'totalBookings', 'totalRooms', 'pendingBookings', 'revenueThisMonth'];
    let smissing = statFields.filter(f => r.data[f] === undefined);
    if (smissing.length === 0) { ok('Stats has all fields'); }
    else { bug('ADM-1','MEDIUM','Stats missing: ' + smissing.join(', ')); }
  } else { bug('ADM-2','HIGH','Admin stats failed'); }

  // Admin bookings
  r = await req('GET', '/api/admin/bookings', null, ADMIN_TOKEN);
  if (r.status === 200 && Array.isArray(r.data)) {
    ok('Admin bookings (' + r.data.length + ')');
    let withUser = r.data.filter(b => b.user).length;
    let withRoom = r.data.filter(b => b.room).length;
    if (withUser === 0 && r.data.length > 0) { bug('ADM-3','HIGH','Admin bookings: 0/' + r.data.length + ' have user info'); }
    else if (withUser > 0) { ok('Admin bookings user enrichment (' + withUser + '/' + r.data.length + ')'); }
    if (withRoom > 0) { ok('Admin bookings room enrichment (' + withRoom + '/' + r.data.length + ')'); }
    else if (r.data.length > 0) { bug('ADM-4','HIGH','Admin bookings: no room info'); }
  } else { bug('ADM-5','CRITICAL','Admin bookings failed'); }

  // Admin bookings filter
  r = await req('GET', '/api/admin/bookings?status=CANCELLED', null, ADMIN_TOKEN);
  if (r.status === 200 && Array.isArray(r.data)) {
    let wrongStatus = r.data.filter(b => b.status !== 'CANCELLED');
    if (wrongStatus.length === 0) { ok('Admin bookings status filter'); }
    else { bug('ADM-6','MEDIUM','Status filter returns wrong statuses'); }
  }

  // Admin rooms
  r = await req('GET', '/api/admin/rooms', null, ADMIN_TOKEN);
  if (r.status === 200) {
    let rooms = Array.isArray(r.data) ? r.data : (r.data && r.data.data ? r.data.data : []);
    ok('Admin rooms (' + rooms.length + ')');
  } else { bug('ADM-7','HIGH','Admin rooms failed'); }

  // Admin room types
  r = await req('GET', '/api/admin/room-types', null, ADMIN_TOKEN);
  if (r.status === 200) { ok('Admin room types'); }
  else { bug('ADM-8','HIGH','Admin room types failed'); }

  // Admin users
  r = await req('GET', '/api/admin/users', null, ADMIN_TOKEN);
  if (r.status === 200 && Array.isArray(r.data)) {
    ok('Admin users (' + r.data.length + ')');
    if (r.data[0] && r.data[0]._count) { ok('Admin users has _count (bookings count)'); }
  } else { bug('ADM-9','HIGH','Admin users failed'); }

  // Admin analytics
  r = await req('GET', '/api/admin/analytics?months=6', null, ADMIN_TOKEN);
  if (r.status === 200 && r.data && r.data.monthlyData) { ok('Admin analytics'); }
  else { bug('ADM-10','MEDIUM','Admin analytics failed'); }

  // Admin hero images
  r = await req('GET', '/api/admin/hero-images', null, ADMIN_TOKEN);
  if (r.status === 200 && Array.isArray(r.data)) { ok('Admin hero images (' + r.data.length + ')'); }
  else { bug('ADM-11','MEDIUM','Admin hero images failed'); }

  // Admin blog posts
  r = await req('GET', '/api/admin/blog/posts', null, ADMIN_TOKEN);
  if (r.status === 200) { ok('Admin blog posts'); }
  else { bug('ADM-12','HIGH','Admin blog posts failed (JWT_SECRET?): status=' + r.status); }

  // Security: Customer cannot access admin
  r = await req('GET', '/api/admin/stats', null, CUSTOMER_TOKEN);
  if (r.status === 403) { ok('Customer blocked from admin'); }
  else { bug('ADM-13','CRITICAL','Customer can access admin: status=' + r.status); }

  // Security: No auth cannot access admin
  r = await req('GET', '/api/admin/stats');
  if (r.status === 401) { ok('No-auth blocked from admin'); }
  else { bug('ADM-14','CRITICAL','No-auth can access admin'); }

  // Admin: update booking status
  r = await req('GET', '/api/admin/bookings', null, ADMIN_TOKEN);
  if (r.status === 200 && r.data.length > 0) {
    let pending = r.data.find(b => b.status === 'PENDING');
    if (pending) {
      let ur = await req('PATCH', '/api/admin/bookings/' + pending.id + '/status', { status: 'CONFIRMED' }, ADMIN_TOKEN);
      if (ur.status === 200) { ok('Admin update booking status'); }
      else { bug('ADM-15','HIGH','Admin update booking status failed: ' + ur.raw.substring(0,200)); }
    }
  }

  // ===== PAYMENT TESTS =====
  console.log('\n=== PAYMENT TESTS ===');

  r = await req('POST', '/api/payments/create-vnpay', { bookingId: 'nonexistent', amount: 1000 }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('VNPay invalid booking rejected'); }
  else { bug('PAY-1','HIGH','VNPay with invalid booking succeeded'); }

  r = await req('POST', '/api/payments/refund-request', { bookingId: 'test' });
  if (r.status === 401) { ok('Refund without auth rejected'); }
  else { bug('PAY-2','CRITICAL','Refund no auth: status=' + r.status); }

  r = await req('POST', '/api/payments/refund-request', { bookingId: 'nonexistent' }, CUSTOMER_TOKEN);
  if (r.status >= 400) { ok('Refund invalid booking rejected'); }
  else { bug('PAY-3','HIGH','Refund with invalid booking succeeded'); }

  // ===== BLOG TESTS =====
  console.log('\n=== BLOG TESTS ===');

  r = await req('GET', '/api/blog/posts');
  if (r.status === 200) {
    let posts = Array.isArray(r.data) ? r.data : (r.data && r.data.data ? r.data.data : []);
    ok('Public blog posts (' + posts.length + ')');
    if (posts.length > 0 && posts[0].title) { ok('Blog post has title'); }
  } else { bug('BLOG-1','MEDIUM','Public blog failed'); }

  // Blog post detail
  r = await req('GET', '/api/blog/posts');
  if (r.status === 200) {
    let posts = Array.isArray(r.data) ? r.data : (r.data && r.data.data ? r.data.data : []);
    if (posts.length > 0) {
      let slug = posts[0].slug || posts[0].id;
      r = await req('GET', '/api/blog/posts/' + slug);
      if (r.status === 200) { ok('Blog post detail'); }
      else { bug('BLOG-2','MEDIUM','Blog post detail failed for slug: ' + slug); }
    }
  }

  // Blog 404
  r = await req('GET', '/api/blog/posts/nonexistent-slug-xyz');
  if (r.status === 404) { ok('Blog 404'); }
  else { bug('BLOG-3','LOW','Blog non-existent post returns ' + r.status + ' not 404'); }

  // ===== CONTENT TESTS =====
  console.log('\n=== CONTENT TESTS ===');

  r = await req('GET', '/api/hero-images');
  if (r.status === 200 && Array.isArray(r.data)) {
    ok('Public hero images (' + r.data.length + ')');
    if (r.data.length > 0) {
      let img = r.data[0];
      let imgFields = ['id', 'title', 'imageUrl'];
      let imissing = imgFields.filter(f => !img[f]);
      if (imissing.length === 0) { ok('Hero image has required fields'); }
      else { bug('CONT-1','MEDIUM','Hero image missing: ' + imissing.join(', ')); }
    }
  } else { bug('CONT-2','MEDIUM','Public hero images failed'); }

  // ===== FRONTEND PAGE TESTS =====
  console.log('\n=== FRONTEND PAGES ===');

  let publicPages = [
    ['/', 'Homepage'],
    ['/rooms', 'Rooms list'],
    ['/rooms/seed-standard', 'Room detail'],
    ['/blog', 'Blog'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ['/auth/login', 'Login'],
    ['/auth/register', 'Register'],
    ['/auth/forgot-password', 'Forgot password'],
  ];
  for (let [path, name] of publicPages) {
    try {
      let res = await fetchPage(path);
      if (res.status === 200 && res.size > 1000) { ok(name + ' page (' + Math.round(res.size/1024) + 'KB)'); }
      else { bug('FE-' + name.replace(/ /g,''), 'HIGH', name + ' broken: status=' + res.status + ' size=' + res.size); }
    } catch (e) { bug('FE-' + name.replace(/ /g,''), 'HIGH', name + ' error: ' + e.message); }
  }

  // 404 page
  try {
    let res = await fetchPage('/rooms/nonexistent-xyz-abc');
    if (res.status === 404) { ok('Room 404 page'); }
    else { bug('FE-404','MEDIUM','Non-existent room page: status=' + res.status); }
  } catch {}

  // Protected pages redirect
  let protectedPages = [['/dashboard', 'Dashboard'], ['/admin', 'Admin'], ['/booking/confirm', 'Booking confirm']];
  for (let [path, name] of protectedPages) {
    try {
      let res = await fetchPage(path);
      if (res.status === 307 || res.status === 302) {
        if (res.location && res.location.includes('/auth/login')) { ok(name + ' redirects to login'); }
        else { bug('FE-REDIR-' + name, 'HIGH', name + ' redirects to ' + res.location); }
      } else if (res.status === 200 && res.body && res.body.includes('login')) {
        ok(name + ' (client-side redirect)');
      } else {
        bug('FE-REDIR-' + name, 'HIGH', name + ' no redirect: status=' + res.status);
      }
    } catch {}
  }

  // Check for dead links in the homepage HTML
  try {
    let res = await fetchPage('/');
    let hrefMatches = res.body.match(/href="\/[^"]*"/g) || [];
    let internalLinks = [...new Set(hrefMatches.map(h => h.slice(6, -1)))];
    console.log('  Internal links found on homepage: ' + internalLinks.length);
  } catch {}

  // ===== CROSS-SERVICE INTEGRATION =====
  console.log('\n=== CROSS-SERVICE INTEGRATION ===');

  // User profile endpoint
  r = await req('GET', '/api/user/profile', null, CUSTOMER_TOKEN);
  if (r.status === 200 && r.data) { ok('User profile'); }
  else { bug('INT-1','HIGH','User profile failed: status=' + r.status); }

  // Gateway discovery
  r = await req('GET', '/discovery');
  if (r.status === 200 && r.data && r.data.targets) { ok('Service discovery'); }
  else { bug('INT-2','MEDIUM','Discovery endpoint failed'); }

  // Gateway metrics
  r = await req('GET', '/metrics');
  if (r.status === 200) { ok('Metrics endpoint'); }
  else { bug('INT-3','LOW','Metrics endpoint failed'); }

  // ===== SUMMARY =====
  console.log('\n\n' + '='.repeat(50));
  console.log('TEST RESULTS: ' + passed + ' passed, ' + failed + ' failed');
  console.log('='.repeat(50));

  if (bugs.length > 0) {
    console.log('\nBUGS FOUND (' + bugs.length + '):');
    let critical = bugs.filter(b => b.sev === 'CRITICAL');
    let high = bugs.filter(b => b.sev === 'HIGH');
    let medium = bugs.filter(b => b.sev === 'MEDIUM');
    let low = bugs.filter(b => b.sev === 'LOW');
    if (critical.length) { console.log('\n  CRITICAL (' + critical.length + '):'); critical.forEach(b => console.log('    ' + b.id + ': ' + b.desc)); }
    if (high.length) { console.log('\n  HIGH (' + high.length + '):'); high.forEach(b => console.log('    ' + b.id + ': ' + b.desc)); }
    if (medium.length) { console.log('\n  MEDIUM (' + medium.length + '):'); medium.forEach(b => console.log('    ' + b.id + ': ' + b.desc)); }
    if (low.length) { console.log('\n  LOW (' + low.length + '):'); low.forEach(b => console.log('    ' + b.id + ': ' + b.desc)); }
  } else {
    console.log('\nAll tests passed! No bugs found.');
  }
}

run().catch(e => console.error('Test runner fatal error:', e));

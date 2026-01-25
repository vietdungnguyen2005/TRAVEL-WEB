export const services = {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    bookingService: process.env.BOOKING_SERVICE_URL || 'http://localhost:3002',
    roomService: process.env.ROOM_SERVICE_URL || 'http://localhost:3003',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://localhost:3005',
};

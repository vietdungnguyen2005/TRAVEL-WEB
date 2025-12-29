-- Clear existing seed data before reseeding
-- Run this before running seed script

-- Delete in order to respect foreign key constraints
DELETE FROM seasonal_prices;
DELETE FROM rooms WHERE "roomNumber" LIKE '10%' OR "roomNumber" LIKE '20%' OR "roomNumber" LIKE '30%';

-- Optional: Reset room types if needed
-- DELETE FROM room_types WHERE slug IN ('standard-room', 'deluxe-room', 'suite-room');

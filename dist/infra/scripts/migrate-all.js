import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
const services = [
    'auth-service',
    'booking-service',
    'room-service',
    'review-service',
    'payment-service'
];
async function migrateAll() {
    console.log('Starting migrations for all services...\n');
    for (const service of services) {
        const servicePath = path.join(__dirname, '../../services', service);
        console.log(`Migrating ${service}...`);
        try {
            await execAsync('npx prisma migrate dev', {
                cwd: servicePath,
                env: { ...process.env }
            });
            console.log(`✓ ${service} migrated successfully\n`);
        }
        catch (error) {
            console.error(`✗ ${service} migration failed:`, error);
        }
    }
    console.log('All migrations completed!');
}
migrateAll();
//# sourceMappingURL=migrate-all.js.map
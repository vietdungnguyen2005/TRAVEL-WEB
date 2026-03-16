import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv, type EnvRule } from '../env/validate-env';

describe('validateEnv', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Clean up env before each test
        process.env = { ...originalEnv };
        // Silence logger output
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should pass when all required vars are present', () => {
        process.env.DATABASE_URL = 'postgres://localhost/test';
        process.env.PORT = '3000';

        const rules: EnvRule[] = [
            { name: 'DATABASE_URL', required: true },
            { name: 'PORT', required: true },
        ];

        const result = validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail when required var is missing', () => {
        delete process.env.DATABASE_URL;

        const rules: EnvRule[] = [
            { name: 'DATABASE_URL', required: true, description: 'Database URL' },
        ];

        const result = validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('DATABASE_URL');
    });

    it('should apply default value when var is missing and not required', () => {
        delete process.env.PORT;

        const rules: EnvRule[] = [
            { name: 'PORT', required: false, default: '3000' },
        ];

        validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(process.env.PORT).toBe('3000');
    });

    it('should not override existing env var with default', () => {
        process.env.PORT = '8080';

        const rules: EnvRule[] = [
            { name: 'PORT', required: false, default: '3000' },
        ];

        validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(process.env.PORT).toBe('8080');
    });

    it('should fail on pattern mismatch', () => {
        process.env.PORT = 'not-a-number';

        const rules: EnvRule[] = [
            { name: 'PORT', required: true, pattern: /^\d+$/, description: 'Must be numeric' },
        ];

        const result = validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('invalid format');
    });

    it('should pass when pattern matches', () => {
        process.env.PORT = '3000';

        const rules: EnvRule[] = [
            { name: 'PORT', required: true, pattern: /^\d+$/ },
        ];

        const result = validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(result.valid).toBe(true);
    });

    it('should collect multiple errors at once', () => {
        delete process.env.DB_URL;
        delete process.env.API_KEY;

        const rules: EnvRule[] = [
            { name: 'DB_URL', required: true },
            { name: 'API_KEY', required: true },
        ];

        const result = validateEnv({
            serviceName: 'test-service',
            rules,
            exitOnError: false,
        });

        expect(result.errors).toHaveLength(2);
    });

    it('should call process.exit(1) when exitOnError is true (default)', () => {
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
        delete process.env.SECRET;

        const rules: EnvRule[] = [
            { name: 'SECRET', required: true },
        ];

        validateEnv({ serviceName: 'test-service', rules });
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});

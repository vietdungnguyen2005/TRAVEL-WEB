import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../logger';

describe('Logger', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create logger with service name', () => {
        const logger = new Logger('test-service');
        expect(logger).toBeDefined();
    });

    it('should log info level messages as JSON via console.log', () => {
        const logger = new Logger('test-service');
        logger.info('test message');

        expect(logSpy).toHaveBeenCalledOnce();
        const logged = JSON.parse(logSpy.mock.calls[0][0]);
        expect(logged.level).toBe('info');
        expect(logged.context).toBe('test-service');
        expect(logged.msg).toBe('test message');
        expect(logged.ts).toBeDefined();
    });

    it('should log warn level messages via console.warn', () => {
        const logger = new Logger('test-service');
        logger.warn('warning message');

        expect(warnSpy).toHaveBeenCalledOnce();
        const logged = JSON.parse(warnSpy.mock.calls[0][0]);
        expect(logged.level).toBe('warn');
        expect(logged.msg).toBe('warning message');
    });

    it('should log error level messages via console.error', () => {
        const logger = new Logger('test-service');
        logger.error('error message');

        expect(errorSpy).toHaveBeenCalledOnce();
        const logged = JSON.parse(errorSpy.mock.calls[0][0]);
        expect(logged.level).toBe('error');
        expect(logged.msg).toBe('error message');
    });

    it('should include meta data when provided', () => {
        const logger = new Logger('test-service');
        logger.info('with meta', { userId: '123', action: 'login' });

        const logged = JSON.parse(logSpy.mock.calls[0][0]);
        expect(logged.meta).toEqual({ userId: '123', action: 'login' });
    });

    it('should include error details when Error instance provided', () => {
        const logger = new Logger('test-service');
        const err = new Error('something broke');
        logger.error('failure', err);

        const logged = JSON.parse(errorSpy.mock.calls[0][0]);
        expect(logged.error).toBeDefined();
        expect(logged.error.name).toBe('Error');
        expect(logged.error.message).toBe('something broke');
        expect(logged.error.stack).toBeDefined();
    });

    it('should include both meta and error when provided together', () => {
        const logger = new Logger('test-service');
        const err = new Error('crash');
        logger.error('operation failed', { op: 'save' }, err);

        const logged = JSON.parse(errorSpy.mock.calls[0][0]);
        expect(logged.meta).toEqual({ op: 'save' });
        expect(logged.error.message).toBe('crash');
    });

    it('should output valid JSON on every call', () => {
        const logger = new Logger('json-test');
        logger.info('hello');
        logger.warn('caution');
        logger.error('bad');

        [logSpy, warnSpy, errorSpy].forEach((spy) => {
            spy.mock.calls.forEach((call) => {
                expect(() => JSON.parse(call[0])).not.toThrow();
            });
        });
    });
});

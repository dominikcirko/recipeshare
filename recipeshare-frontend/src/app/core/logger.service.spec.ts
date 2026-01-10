import { Logger } from './logger.service';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset singleton instance before each test
    // @ts-ignore - accessing private property for testing
    Logger.instance = undefined;

    logger = Logger.getInstance();

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock Date to have consistent timestamps
    const mockDate = new Date('2024-01-15T12:00:00.000Z');
    dateNowSpy = vi.spyOn(globalThis, 'Date').mockImplementation(function(this: any, ...args: any[]) {
      if (args.length === 0) {
        return mockDate;
      }
      return new (Date as any)(...args);
    } as any);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    dateNowSpy.mockRestore();

    // Clean up singleton instance
    // @ts-ignore - accessing private property for testing
    Logger.instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('should create a singleton instance', () => {
      expect(logger).toBeTruthy();
    });

    it('should return the same instance on multiple calls to getInstance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      const instance3 = Logger.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(logger);
    });


    it('should maintain state across multiple getInstance calls', () => {
      const instance1 = Logger.getInstance();
      instance1.log('test message');

      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('log', () => {
    beforeEach(() => {
      dateNowSpy.mockRestore();
    });

    it('should call console.log with formatted message', () => {
      const testMessage = 'Test log message';

      logger.log(testMessage);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOG]')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(testMessage)
      );
    });

    it('should handle empty string message', () => {
      logger.log('');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOG]')
      );
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Test with special chars: @#$%^&*()';

      logger.log(specialMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(specialMessage)
      );
    });

    it('should handle multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      logger.log(multilineMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(multilineMessage)
      );
    });
  });

  describe('error', () => {
    beforeEach(() => {
      dateNowSpy.mockRestore();
    });

    it('should call console.error with formatted message', () => {
      const testMessage = 'Test error message';

      logger.error(testMessage);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(testMessage)
      );
    });

    it('should handle empty string message', () => {
      logger.error('');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error with special chars: @#$%^&*()';

      logger.error(specialMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(specialMessage)
      );
    });

    it('should handle multiline error messages', () => {
      const multilineMessage = 'Error Line 1\nError Line 2\nError Line 3';

      logger.error(multilineMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(multilineMessage)
      );
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      dateNowSpy.mockRestore();
    });

    it('should handle multiple log and error calls', () => {
      logger.log('First log');
      logger.error('First error');
      logger.log('Second log');
      logger.error('Second error');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should work correctly when called from different getInstance results', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      instance1.log('Message from instance1');
      instance2.error('Message from instance2');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);

      logger.log(longMessage);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(longMessage)
      );
    });

    it('should handle messages with unicode characters', () => {
      const unicodeMessage = 'Test 中文 🚀 émojis';

      logger.log(unicodeMessage);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(unicodeMessage)
      );
    });
  });
});

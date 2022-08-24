import pino from 'pino';


export const LOGGER_DEFAULT_TIME_FN: true | (() => string) = pino.stdTimeFunctions.isoTime;


/**
 * The main RuneJS wrapper class for the Pino logger.
 * @see https://www.npmjs.com/package/pino
 * @see https://www.npmjs.com/package/pino-pretty
 */
export class RuneLogger {

    /**
     * The main pino logger instance for the wrapper object.
     */
    pinoLogger: pino.Logger<pino.LoggerOptions>;

    private _options: pino.LoggerOptions = {
        timestamp: LOGGER_DEFAULT_TIME_FN
    };

    constructor(options?: pino.LoggerOptions) {
        if (options) {
            this.setOptions(options, false);
        }

        this.pinoInit();
    }

    setOptions(options: Partial<pino.LoggerOptions>, reInitialize: boolean = true): void {
        if (!options.timestamp) {
            options.timestamp = LOGGER_DEFAULT_TIME_FN;
        }

        this._options = options;

        if (reInitialize) {
            this.pinoInit();
        }
    }

    /**
     * Log at `'log'` level the given messages.
     * @param messages The log messages to write.
     */
    log(...messages: any[]): void {
        this.send('log', ...messages);
    }

    /**
     * Log at `'info'` level the given messages.
     * @param messages The log messages to write.
     */
    info(...messages: any[]): void {
        this.send('info', ...messages);
    }

    /**
     * Log at `'debug'` level the given messages.
     * @param messages The log messages to write.
     */
    debug(...messages: any[]): void {
        this.send('debug', ...messages);
    }

    /**
     * Log at `'warn'` level the given messages.
     * @param messages The log messages to write.
     */
    warn(...messages: any[]): void {
        this.send('warn', ...messages);
    }

    /**
     * Log at `'error'` level the given messages.
     * @param messages The log messages to write.
     */
    error(...messages: any[]): void {
        this.send('error', ...messages);
    }

    /**
     * Log at `'trace'` level the given messages.
     * @param messages The log messages to write.
     */
    trace(...messages: any[]): void {
        this.send('trace', ...messages);
    }

    /**
     * Log at `'fatal'` level the given messages.
     * @param messages The log messages to write.
     */
    fatal(...messages: any[]): void {
        this.send('fatal', ...messages);
    }

    private send(consoleType: string, ...args: any[]): void {
        args.forEach(arg => (this.pinoLogger[consoleType] as any)(arg));
    }

    private pinoInit(): void {
        this.pinoLogger = pino({
            prettyPrint: true,
            ...this._options
        });
    }

    get options(): pino.LoggerOptions {
        return this._options;
    }

}


/**
 * The main logger singleton instance.
 */
export const logger: RuneLogger = new RuneLogger();

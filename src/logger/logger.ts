import pino, { Logger, LoggerOptions, TimeFn } from 'pino';
import SonicBoom from 'sonic-boom';


export const LOGGER_DEFAULT_TIME_FN: true | TimeFn = pino.stdTimeFunctions.isoTime;

/**
 * The main RuneJS wrapper class for the Pino logger.
 * @see https://www.npmjs.com/package/pino
 * @see https://www.npmjs.com/package/sonic-boom
 */
export class RuneLogger {

    /**
     * The logger's active date/time format function for log messages.
     * IE timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
     */
    public loggerTimeFn: true | TimeFn = LOGGER_DEFAULT_TIME_FN;

    /**
     * The main pino logger instance for the wrapper object.
     */
    public pinoLogger: Logger;

    private _options: LoggerOptions = {
        timestamp: this.loggerTimeFn,
        prettyPrint: true
    };

    private _boom: SonicBoom;

    public constructor(options?: LoggerOptions) {
        if(options) {
            this._options = options;
        }

        this.pinoInit();
    }

    /**
     * Log at `'log'` level the given messages.
     * @param messages The log messages to write.
     */
    public log(...messages: any[]): void {
        this.logMessages('log', ...messages);
    }

    /**
     * Log at `'info'` level the given messages.
     * @param messages The log messages to write.
     */
    public info(...messages: any[]): void {
        this.logMessages('info', ...messages);
    }

    /**
     * Log at `'debug'` level the given messages.
     * @param messages The log messages to write.
     */
    public debug(...messages: any[]): void {
        this.logMessages('debug', ...messages);
    }

    /**
     * Log at `'warn'` level the given messages.
     * @param messages The log messages to write.
     */
    public warn(...messages: any[]): void {
        this.logMessages('warn', ...messages);
    }

    /**
     * Log at `'error'` level the given messages.
     * @param messages The log messages to write.
     */
    public error(...messages: any[]): void {
        this.logMessages('error', ...messages);
    }

    /**
     * Log at `'trace'` level the given messages.
     * @param messages The log messages to write.
     */
    public trace(...messages: any[]): void {
        this.logMessages('trace', ...messages);
    }

    /**
     * Log at `'fatal'` level the given messages.
     * @param messages The log messages to write.
     */
    public fatal(...messages: any[]): void {
        this.logMessages('fatal', ...messages);
    }

    /**
     * Sets the logger's output log file destination path.
     * @param dest The path for the log file to be written to.
     * @return A `SonicBoom` object that controls the log output stream.
     * @see https://www.npmjs.com/package/sonic-boom
     */
    public destination(dest: string): SonicBoom {
        this._boom = pino.destination(dest);
        return this._boom;
    }

    /**
     * Sets the logger options to the given options object.
     * @param options The options to supply to the `pino` logger instance.
     */
    public setOptions(options: LoggerOptions): void {
        if(!options.timestamp) {
            options.timestamp = LOGGER_DEFAULT_TIME_FN;
        }

        this.loggerTimeFn = options.timestamp;
        this._options = options;

        this.pinoInit();
    }

    /**
     * Sets the logger prettyPrint value.
     * @param prettyPrint The value to set prettyPrint to.
     */
    public setPrettyPrint(prettyPrint: boolean): void {
        this.setOptions({
            timestamp: this.loggerTimeFn,
            prettyPrint
        });
    }

    /**
     * Sets the logger's date/time function to the given value.
     * @param format The function that will return the partial JSON value of the current time for Pino to ingest.
     * IE timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
     */
    public setTimeFormat(format: TimeFn) {
        this.setOptions({
            timestamp: format
        });
    }

    private logMessages(consoleType: string, ...args: any[]): void {
        args.forEach(arg => (this.pinoLogger[consoleType] as any)(arg));
    }

    private pinoInit(): void {
        this.pinoLogger = pino(this._options);
    }

    public get boom() {
        return this._boom;
    }

    public get options(): LoggerOptions {
        return this._options;
    }

}


/**
 * The main logger singleton instance.
 */
export const logger: RuneLogger = new RuneLogger();

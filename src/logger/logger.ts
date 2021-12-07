import pino, { Logger, LoggerOptions, TimeFn, destination } from 'pino';


export const LOGGER_DEFAULT_TIME_FN: true | TimeFn = pino.stdTimeFunctions.isoTime;

/**
 * The main RuneJS wrapper class for the Pino logger.
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
    public pinoLogger: Logger = pino({
        timestamp: this.loggerTimeFn,
        prettyPrint: true
    });

    public info(...messages: any[]): void {
        this.log('info', ...messages);
    }
    public debug(...messages: any[]): void {
        this.log('debug', ...messages);
    }
    public warn(...messages: any[]): void {
        this.log('warn', ...messages);
    }
    public error(...messages: any[]): void {
        this.log('error', ...messages);
    }
    public trace(...messages: any[]): void {
        this.log('trace', ...messages);
    }
    public fatal(...messages: any[]): void {
        this.log('fatal', ...messages);
    }

    private log(consoleType: string, ...args: any[]): void {
        args.forEach(arg => (this.pinoLogger[consoleType] as any)(arg));
    }

}


/**
 * The main logger singleton instance.
 */
export const logger: RuneLogger = new RuneLogger();


/**
 * Sets the logger options to the given options object.
 * @param options
 */
export const setLoggerOptions = (options: LoggerOptions): void => {
    if(!options.timestamp) {
        options.timestamp = LOGGER_DEFAULT_TIME_FN;
    }

    logger.loggerTimeFn = options.timestamp;
    logger.pinoLogger = pino(options);
};


/**
 * Sets the logger prettyPrint value.
 * @param prettyPrint The value to set prettyPrint to.
 */
export const setLoggerPrettyPrint = (prettyPrint: boolean): void => {
    logger.pinoLogger = pino({
        timestamp: logger.loggerTimeFn,
        prettyPrint
    });
};


/**
 * Sets the logger's date/time function to the given value.
 * @param format The function that will return the partial JSON value of the current time for Pino to ingest.
 * IE timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
 */
export const setLoggerTimeFn = (format: TimeFn): void => {
    logger.loggerTimeFn = format;
};


/**
 * Sets the logger's output log file destination path.
 * @param dest The path for the log file to be written to.
 */
export const setLoggerDest = (dest: string) => destination(dest);

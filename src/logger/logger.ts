import moment from 'moment';
import { gray, red, yellow, cyan } from 'colors';

let runeJsLoggerDateFormat = 'YYYY-MM-DDTHH:mm:ss';

export const setLoggerDateFormat = (format: string) => runeJsLoggerDateFormat = format;

const log = (consoleType: string, ...args: any[]): void => {
    const date = moment().format(runeJsLoggerDateFormat);

    args.forEach(msg => {
        if(consoleType === 'debug') {
            msg = cyan(msg);
        } else if(consoleType === 'warn') {
            msg = yellow(msg);
        } else if(consoleType === 'error') {
            msg = red(msg);
        }

        if(typeof msg === 'string') {
            const str = gray(`[${date}] `) + msg;
            console[consoleType](str);
        } else {
            console[consoleType](gray(`[${date}]`), msg);
        }
    });
};

export const logger = {
    info:  (...messages: any[]) => log('info', ...messages),
    debug: (...messages: any[]) => log('info', ...messages),
    warn:  (...messages: any[]) => log('warn', ...messages),
    error: (...messages: any[]) => log('error', ...messages),
    trace: (...messages: any[]) => log('trace', ...messages),
    fatal: (...messages: any[]) => log('fatal', ...messages)
};

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
        const str = gray(`[${date}]: `) + msg;
        console[consoleType](str);
    });
};

export const logger = {
    info:  (...message: any[]) => log('info', ...message),
    debug: (...message: any[]) => log('info', ...message),
    warn:  (...message: any[]) => log('warn', ...message),
    error: (...message: any[]) => log('error', ...message)
};

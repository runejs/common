import { logger } from '../logger';
import { JSON_SCHEMA, safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';


interface ServerConfigOptions {
    useDefault?: boolean;
    configDir?: string;
    configFileName?: string;
}

export function parseServerConfig<T>(options?: ServerConfigOptions): T {
    if(!options) {
        options = {
            useDefault: false,
            configDir: 'data/config',
            configFileName: 'server-config'
        };
    } else {
        if(!options.configDir) {
            options.configDir = 'data/config';
        }
        if(!options.configFileName) {
            options.configFileName = 'server-config';
        }
    }

    try {
        const config = safeLoad(readFileSync(
            `${options.configDir}/${options.configFileName}${options.useDefault ? '.example' : ''}.yaml`, 'utf8'),
            { schema: JSON_SCHEMA }) as T;

        if(!config) {
            if(!options.useDefault) {
                logger.warn('Server config not provided, using default...');
                return parseServerConfig({ useDefault: true });
            } else {
                throw new Error('Syntax Error');
            }
        }

        return config;
    } catch(error) {
        if(!options.useDefault) {
            logger.warn('Server config not provided, using default...');
            return parseServerConfig({ useDefault: true });
        } else {
            logger.error('Error parsing server config: ' + error);
            return null;
        }
    }
}

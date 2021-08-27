import path from 'path';
import * as fs from 'fs';
import { JSON_SCHEMA, safeLoad } from 'js-yaml';
import { logger } from '../logger';


export type ConfigFileFormat = 'json' | 'yaml';


export interface ServerConfigOptions {
    useDefault?: boolean;
    configDir?: string;
    cacheDir?: string;
    filestoreDir?: string;
    configFileName?: string;
}


export const defaults: ServerConfigOptions = {
    configDir: path.join('.', 'config'),
    cacheDir: path.join('.', 'cache'),
    filestoreDir: path.join('.', 'filestore'),
    configFileName: 'server-config'
};


export const sanitizeConfigOptions = (options?: ServerConfigOptions): ServerConfigOptions => {
    if(!options) {
        options = {
            useDefault: false
        };
    }

    const keys = Object.keys(defaults);
    for(const propName of keys) {
        if(!options[propName]) {
            options[propName] = defaults[propName];
        }
    }

    return options;
};


export function parseServerConfig<T>(options?: ServerConfigOptions): T {
    options = sanitizeConfigOptions(options);

    let filePath = path.join(options.configDir, options.configFileName);
    if(options.useDefault) {
        filePath += '.example';
    }

    let fileType: ConfigFileFormat | undefined;

    if(fs.existsSync(`${filePath}.json`)) {
        fileType = 'json';
    } else if(fs.existsSync(`${filePath}.yaml`)) {
        fileType = 'yaml';
    } else {
        if(!options.useDefault) {
            logger.warn(`Server config not provided, using default...`);
            return parseServerConfig({ useDefault: true });
        } else {
            throw new Error(`Unable to load server configuration: Default (.example) server configuration file not found.`);
        }
    }

    filePath += `.${fileType}`;

    const configFileContent = fs.readFileSync(filePath, 'utf-8');
    if(!configFileContent) {
        throw new Error(`Syntax error encountered while loading server configuration file.`);
    }

    if(fileType === 'json') {
        options = JSON.parse(configFileContent) as T;
    } else if(fileType === 'yaml') {
        options = safeLoad(configFileContent, { schema: JSON_SCHEMA }) as T;
    }

    return sanitizeConfigOptions(options) as T;
}

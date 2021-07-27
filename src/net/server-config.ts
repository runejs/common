import path from 'path';
import * as fs from 'fs';
import { JSON_SCHEMA, safeLoad } from 'js-yaml';
import { logger } from '../logger';


type SupportedFileTypes = 'json' | 'yaml';


interface ServerConfigOptions {
    useDefault?: boolean;
    configDir?: string;
    configFileName?: string;
}


function sanitizeConfigOptions(options?: ServerConfigOptions): ServerConfigOptions {
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

    return options;
}


export function parseServerConfig<T>(options?: ServerConfigOptions): T {
    options = sanitizeConfigOptions(options);

    let filePath = path.join(options.configDir, options.configFileName);
    if(options.useDefault) {
        filePath += '.example';
    }

    let fileType: SupportedFileTypes | undefined;

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
        return JSON.parse(configFileContent) as T;
    } else if(fileType === 'yaml') {
        return safeLoad(configFileContent, { schema: JSON_SCHEMA }) as T;
    }
}

import util from 'util';
import fs, { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../logger';


const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);


/**
 * A whitelist or blacklist filter for file searching.
 */
export interface FileFilter {
    type: 'whitelist' | 'blacklist';
    list: string[];
}


/**
 * Searches for files within the given directory, using a FileFilter to filter the results if provided.
 * Returns an array of paths to the matching files so that they may be imported.
 * @param directory The directory to search for files.
 * @param filter [optional] The whitelist or blacklist filter to apply to the file search.
 */
export async function* getFiles(directory: string, filter?: FileFilter): AsyncGenerator<string> {
    const files = await readdir(directory);

    for (const file of files) {
        const path = join(directory, file);
        const statistics = await stat(path);

        if (statistics.isDirectory()) {
            for await (const child of getFiles(path, filter)) {
                yield child;
            }
        } else {
            if (filter?.type === 'blacklist') {
                // blacklist
                const invalid = filter.list.some(item => file === item);

                if (invalid) {
                    continue;
                }
            } else if (filter?.type === 'whitelist') {
                // whitelist
                const invalid = !filter.list.some(item => file.endsWith(item));

                if (invalid) {
                    continue;
                }
            }

            yield path;
        }
    }
}


/**
 * Searches the given directory for configuration files and converts the results into a
 * JSON array of the type T.
 * @param configurationDir The directory to search for configuration files.
 * @param filter [optional] The file filter to apply to this search.
 */
export async function loadConfigurationFiles<T = any>(configurationDir: string, filter?: FileFilter): Promise<T[]> {
    const files = [];

    for await (const path of getFiles(configurationDir, filter)) {
        try {
            const configContent = JSON.parse(readFileSync(path, 'utf8'));

            if (configContent) {
                files.push(configContent);
            }
        } catch (error) {
            logger.error(`Error loading configuration file at ${path}:`);
            logger.error(error);
        }
    }

    return files;
}

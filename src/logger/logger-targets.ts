import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';


export const defaultTarget = (level: pino.LevelWithSilent = 'info') => ({
    target: 'pino',
    level
} as pino.TransportTargetOptions<Record<string, any>>);


export const prettyPrintTarget = (level: pino.LevelWithSilent = 'info') => ({
    target: 'pino-pretty',
    level
} as pino.TransportTargetOptions<Record<string, any>>);


export const fileTarget = (destination: string, level: pino.LevelWithSilent = 'info') => {
    const normalizedPath = destination.replace(/\\/g, '/');
    
    if (normalizedPath.indexOf('/') !== normalizedPath.lastIndexOf('/')) {
        const lastPathIndex = normalizedPath.lastIndexOf('/');
        const logDir = normalizedPath.substring(0, lastPathIndex);
        if (logDir) {
            if (!existsSync(logDir)) {
                mkdirSync(logDir, { recursive: true });
            }
        }
    }

    return {
        target: 'pino/file',
        level,
        options: { destination }
    } as pino.TransportTargetOptions<Record<string, any>>;
};

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
    return {
        target: 'pino/file',
        level,
        options: { destination }
    } as pino.TransportTargetOptions<Record<string, any>>;
};

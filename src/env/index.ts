import dotenv from 'dotenv';

dotenv.config();

export const env = {
    get: <T = string>(varName: string): T => {
        return process.env[varName] as unknown as T;
    }
};

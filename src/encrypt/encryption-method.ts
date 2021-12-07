export enum FileEncryption {
    none = 0,
    xtea = 1
}

export type EncryptionMethod = 'none' | 'xtea';

export const getEncryptionMethod = (encryption: FileEncryption | number): EncryptionMethod => encryption === 1 ? 'xtea' : 'none';

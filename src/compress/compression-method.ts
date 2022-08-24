export enum FileCompression {
    none = 0,
    bzip2 = 1,
    gzip = 2
}

export type CompressionMethod = 'none' | 'bzip2' | 'gzip';

export const getCompressionMethod = (compression: FileCompression | number): CompressionMethod => {
    if (compression === 0 || compression > 2) {
        return 'none';
    }

    return compression === 1 ? 'bzip2' : 'gzip';
};

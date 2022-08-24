import { ByteBuffer } from '../buffer';
import * as compressjs from '@ledgerhq/compressjs';
import { Buffer } from 'buffer';
const bzip = compressjs.Bzip2;


const charCode = (letter: string) => letter.charCodeAt(0);


export class Bzip2 {

    static compress(rawFileData: ByteBuffer | Buffer): Buffer {
        const compressedFile = Buffer.from(bzip.compressFile(rawFileData, undefined, 1));
        // Do not include the BZip compression level header because the client expects a headerless BZip format
        return compressedFile.slice(4, compressedFile.length);
    }

    static decompress(compressedFileData: ByteBuffer | Buffer): Buffer {
        const buffer = Buffer.alloc(compressedFileData.length + 4);
        compressedFileData.copy(buffer, 4);
        buffer[0] = charCode('B');
        buffer[1] = charCode('Z');
        buffer[2] = charCode('h');
        buffer[3] = charCode('1');

        return bzip.decompressFile(buffer);
    }

}

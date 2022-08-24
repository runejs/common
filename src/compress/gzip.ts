import { gunzipSync, gzipSync } from 'zlib';
import { ByteBuffer } from '../buffer';
import { Buffer } from 'buffer';


export class Gzip {

    static compress(buffer: ByteBuffer | Buffer): Buffer {
        return gzipSync(buffer);
    }

    static decompress(buffer: ByteBuffer | Buffer): Buffer {
        return gunzipSync(buffer);
    }

}

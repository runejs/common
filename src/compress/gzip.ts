import { gunzipSync, gzipSync } from 'zlib';
import { ByteBuffer } from '../buffer';


export class Gzip {

    static compress(buffer: ByteBuffer): ByteBuffer {
        return new ByteBuffer(gzipSync(buffer));
    }

    static decompress(buffer: ByteBuffer): ByteBuffer {
        return new ByteBuffer(gunzipSync(buffer));
    }

}

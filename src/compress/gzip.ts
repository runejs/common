import { gunzipSync, gzipSync } from 'zlib';
import { ByteBuffer } from '../buffer';


export class Gzip {

    public static compress(buffer: ByteBuffer): ByteBuffer {
        return new ByteBuffer(gzipSync(buffer));
    }

    public static decompress(buffer: ByteBuffer): ByteBuffer {
        return new ByteBuffer(gunzipSync(buffer));
    }

}

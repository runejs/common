type DataType = 'BYTE' | 'SHORT' | 'SMART' | 'INT24' | 'INT' | 'LONG';
type Endianness = 'LITTLE_ENDIAN' | 'BIG_ENDIAN' | 'MIDDLE_ENDIAN_1' | 'MIDDLE_ENDIAN_2';
type Signedness = 'SIGNED' | 'UNSIGNED';

const SIZES = {
    'BYTE': 1,
    'SHORT': 2,
    'SMART': -1,
    'INT24': 3,
    'INT': 4,
    'LONG': 8
};

const BYTE_LEN = {
    'BYTE': 8,
    'SHORT': 16,
    'SMART': -1,
    'INT24': 24,
    'INT': 32,
    'LONG': 64
};

const ENDIAN_SUFFIX = {
    'LITTLE_ENDIAN': 'LE',
    'BIG_ENDIAN': 'BE',
    'MIDDLE_ENDIAN_1': 'ME1',
    'MIDDLE_ENDIAN_2': 'ME2'
};

export class ByteBuffer extends Uint8Array {

    private _writerIndex: number = 0;
    private _readerIndex: number = 0;

    get(type: DataType = 'BYTE', signed: Signedness = 'SIGNED', endian: Endianness = 'BIG_ENDIAN'): number {
        const readerIndex = this._readerIndex;

        if(type === 'SMART') {
            return this.readSmart(readerIndex);
        } else {
            let size = SIZES[type];
            let signedChar = signed === 'SIGNED' ? '' : 'U';
            let lenChars = BYTE_LEN[type];
            let suffix = type === 'BYTE' ? '' : ENDIAN_SUFFIX[endian];

            this._readerIndex += size;
            const methodName = `read${signedChar}Int${lenChars}${suffix}`;
            return this[methodName](readerIndex) as number;
        }
    }

    put(value: number | bigint, type: DataType = 'BYTE', signed: Signedness = 'SIGNED', endian: Endianness = 'BIG_ENDIAN'): void {
        const writerIndex = this._writerIndex;

        if(type === 'SMART') {
            this.writeSmart(writerIndex, value as number);
        } else {
            let size = SIZES[type];
            let signedChar = signed === 'SIGNED' ? '' : 'U';
            let lenChars = BYTE_LEN[type];
            let suffix = type === 'BYTE' ? '' : ENDIAN_SUFFIX[endian];

            this._writerIndex += size;
            const methodName = `write${signedChar}Int${lenChars}${suffix}`;
            this[methodName](writerIndex);
        }
    }

    copy: (targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number) => number;

    private writeSmart(offset: number, value: number): void {
        if(value >= 128) {
            this.put(value, 'SHORT');
        } else {
            this.put(value, 'BYTE');
        }
    }

    private readSmart(offset: number): number {
        const peek = this[offset];

        if(peek < 128) {
            return this.get('BYTE', 'UNSIGNED');
        } else {
            return this.get('SHORT', 'UNSIGNED') - 32768;
        }
    }

    private readUInt24BE(offset: number): number {
        return ((this[offset] & 0xff) << 16) + ((this[offset + 1] & 0xff) << 8) + (this[offset + 2] & 0xff);
    }

    private readInt24BE(offset: number): number {
        return ((this[offset]) << 16) + ((this[offset + 1]) << 8) + (this[offset + 2]);
    }

    private readUInt24LE(offset: number): number {
        return ((this[offset + 2] & 0xff) << 16) + ((this[offset + 1] & 0xff) << 8) + (this[offset] & 0xff);
    }

    private readInt24LE(offset: number): number {
        return ((this[offset + 2]) << 16) + ((this[offset + 1]) << 8) + (this[offset]);
    }

    private writeUInt24BE(offset: number, value: number): void {
        this[offset] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset + 2] = (value & 0xff);
    }

    private writeInt24BE(offset: number, value: number): void {
        this[offset] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset + 2] = (value);
    }

    private writeUInt24LE(offset: number, value: number): void {
        this[offset + 2] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset] = (value & 0xff);
    }

    private writeInt24LE(offset: number, value: number): void {
        this[offset + 2] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset] = (value);
    }

    public getString(terminatingChar: number = 0): string {
        const bytes: number[] = [];
        let b: number;

        while((b = this.get('BYTE')) !== terminatingChar) {
            bytes.push(b);
        }

        return Buffer.from(bytes).toString();
    }

    public getSlice(position: number, length: number): ByteBuffer {
        return new ByteBuffer(this.slice(position, position + length));
    }

    public writeBytes(from: ByteBuffer | Buffer): void {
        from.copy(this, this.writerIndex, 0);
        this.writerIndex = (this.writerIndex + from.length);
    }

    public get writerIndex(): number {
        return this._writerIndex;
    }

    public set writerIndex(value: number) {
        this._writerIndex = value;
    }

    public get readerIndex(): number {
        return this._readerIndex;
    }

    public set readerIndex(value: number) {
        this._readerIndex = value;
    }

    public get readable(): number {
        return this.length - this._readerIndex;
    }

}

Object.setPrototypeOf(ByteBuffer.prototype, Buffer.prototype);

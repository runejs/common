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

const BIT_MASKS: number[] = [];

for(let i = 0; i < 32; i++) {
    BIT_MASKS.push((1 << i) - 1);
}

export class ByteBuffer extends Uint8Array {

    private _writerIndex: number = 0;
    private _readerIndex: number = 0;
    private bitIndex: number;

    public get(type: DataType = 'BYTE', signed: Signedness = 'SIGNED', endian: Endianness = 'BIG_ENDIAN'): number {
        const readerIndex = this._readerIndex;

        if(type === 'SMART') {
            return this.getSmart(readerIndex);
        } else {
            let size = SIZES[type];
            let signedChar = signed === 'SIGNED' ? '' : 'U';
            let lenChars = BYTE_LEN[type];
            let suffix = type === 'BYTE' ? '' : ENDIAN_SUFFIX[endian];
            let smol = type === 'LONG' ? 'Big' : '';

            this._readerIndex += size;
            const methodName = `read${signedChar}${smol}Int${lenChars}${suffix}`;
            return this[methodName](readerIndex) as number;
        }
    }

    public getString(terminatingChar: number = 0): string {
        const bytes: number[] = [];
        let b: number;

        while((b = this.get('BYTE')) !== terminatingChar) {
            bytes.push(b);
        }

        return Buffer.from(bytes).toString();
    }

    public put(value: number | bigint, type: DataType = 'BYTE', signed: Signedness = 'SIGNED', endian: Endianness = 'BIG_ENDIAN'): void {
        const writerIndex = this._writerIndex;

        if(type === 'SMART') {
            this.putSmart(value as number);
        } else {
            let size = SIZES[type];
            let signedChar = signed === 'SIGNED' ? '' : 'U';
            let lenChars = BYTE_LEN[type];
            let suffix = type === 'BYTE' ? '' : ENDIAN_SUFFIX[endian];
            let smol = type === 'LONG' ? 'Big' : '';

            this._writerIndex += size;
            const methodName = `write${signedChar}${smol}Int${lenChars}${suffix}`;
            this[methodName](value, writerIndex);
        }
    }

    public putString(value: string): void {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);

        for(const byte of bytes) {
            this.put(byte);
        }

        this.put(0); // end of line
    }

    public putBits(bitCount: number, value: number): ByteBuffer {
        const byteCount: number = Math.ceil(bitCount / 8) + 1;
        const buffer = this.ensureCapacity((this.bitIndex + 7) / 8 + byteCount);

        let byteIndex: number = buffer.bitIndex >> 3;
        let bitOffset: number = 8 - (buffer.bitIndex & 7);

        buffer.bitIndex += bitCount;

        for(; bitCount > bitOffset; bitOffset = 8) {
            buffer.buffer[byteIndex] &= ~BIT_MASKS[bitOffset];
            buffer.buffer[byteIndex++] |= (value >> (bitCount - bitOffset)) & BIT_MASKS[bitOffset];
            bitCount -= bitOffset;
        }

        if(bitCount == bitOffset) {
            buffer.buffer[byteIndex] &= ~BIT_MASKS[bitOffset];
            buffer.buffer[byteIndex] |= value & BIT_MASKS[bitOffset];
        } else {
            buffer.buffer[byteIndex] &= ~(BIT_MASKS[bitCount] << (bitOffset - bitCount));
            buffer.buffer[byteIndex] |= (value & BIT_MASKS[bitCount]) << (bitOffset - bitCount);
        }

        return buffer;
    }

    public openBitBuffer(): void {
        this.bitIndex = this.writerIndex * 8;
    }

    public closeBitBuffer(): void {
        this.writerIndex = Math.floor((this.bitIndex + 7) / 8);
    }

    public at(index: number, signed: Signedness = 'SIGNED'): number {
        if(signed === 'SIGNED') {
            return this.readInt8(index);
        } else {
            return this.readUInt8(index);
        }
    }

    public flipWriter(): ByteBuffer {
        const newBuffer = new ByteBuffer(this.writerIndex);
        this.copy(newBuffer, 0, 0, this.writerIndex);
        return newBuffer;
    }

    public flipReader(): ByteBuffer {
        const newBuffer = new ByteBuffer(this.readerIndex);
        this.copy(newBuffer, 0, 0, this.readerIndex);
        return newBuffer;
    }

    public ensureCapacity(space: number): ByteBuffer {
        if(this.writable < this.writerIndex + space) {
            const newBuffer = new ByteBuffer(this.writerIndex + space);
            this.copy(newBuffer, 0, 0);
            newBuffer.writerIndex = this.writerIndex;
            newBuffer.readerIndex = this.readerIndex;
            newBuffer.bitIndex = this.bitIndex;
            return newBuffer;
        } else {
            return this;
        }
    }

    public getSlice(position: number, length: number): ByteBuffer {
        return new ByteBuffer(this.slice(position, position + length));
    }

    public writeBytes(from: ByteBuffer | Buffer): void {
        from.copy(this, this.writerIndex, 0);
        this.writerIndex = (this.writerIndex + from.length);
    }

    public readInt8: (offset: number) => number;
    public readUInt8: (offset: number) => number;
    public copy: (targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number) => number;

    private putSmart(value: number): void {
        if(value >= 128) {
            this.put(value, 'SHORT');
        } else {
            this.put(value, 'BYTE');
        }
    }

    private getSmart(offset: number): number {
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

    private writeUInt24BE(value: number, offset: number): void {
        this[offset] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset + 2] = (value & 0xff);
    }

    private writeInt24BE(value: number, offset: number): void {
        this[offset] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset + 2] = (value);
    }

    private writeUInt24LE(value: number, offset: number): void {
        this[offset + 2] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset] = (value & 0xff);
    }

    private writeInt24LE(value: number, offset: number): void {
        this[offset + 2] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset] = (value);
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

    public get writable(): number {
        return this.length - this._writerIndex;
    }

}

Object.setPrototypeOf(ByteBuffer.prototype, Buffer.prototype);

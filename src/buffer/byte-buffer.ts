import { Buffer } from 'buffer';
import { logger } from '../logger';

export type DataType =
    'BYTE' | 'SHORT' | 'SMART_SHORT' | 'SMART_INT' | 'INT24' | 'MEDIUM' | 'INT' | 'LONG' | 'STRING' |
    'byte' | 'short' | 'smart_short' | 'smart_int' | 'int24' | 'medium' | 'int' | 'long' | 'string';

export type Endianness =
    'LITTLE_ENDIAN' | 'BIG_ENDIAN' | 'MIDDLE_ENDIAN_1' | 'MIDDLE_ENDIAN_2' |
    'little_endian' | 'big_endian' | 'middle_endian_1' | 'middle_endian_2' |
    'le' | 'LE' | 'be' | 'BE' | 'me1' | 'ME1' | 'me2' | 'ME2';

export type Signedness =
    'SIGNED' | 'UNSIGNED' |
    'signed' | 'unsigned' |
    's' | 'u' | 'S' | 'U';


export const MAX_SIGNED_LENGTHS = {
    'byte': 127,
    'short': 32767,
    'smart_short': -1,
    'smart_int': -1,
    'int24': 8388607,
    'int': 2147483647,
    'long': BigInt('9223372036854775807')
};

export const BYTE_LENGTH = {
    'byte': 1,
    'short': 2,
    'smart': -1,
    'int24': 3,
    'int': 4,
    'long': 8
};

export const BIT_LENGTH = {
    'byte': 8,
    'short': 16,
    'smart': -1,
    'int24': 24,
    'int': 32,
    'long': 64
};

export const ENDIAN_SUFFIX = {
    'little_endian': 'LE',
    'big_endian': 'BE',
    'middle_endian_1': 'ME1',
    'middle_endian_2': 'ME2'
};

const BIT_MASKS: number[] = [];

for (let i = 0; i < 32; i++) {
    BIT_MASKS.push((1 << i) - 1);
}

export class ByteBuffer extends Uint8Array {

    readInt8: (offset: number) => number;
    readUInt8: (offset: number) => number;
    copy: (targetBuffer: Uint8Array | ByteBuffer, targetStart?: number, sourceStart?: number, sourceEnd?: number) => number;

    private _writerIndex: number = 0;
    private _readerIndex: number = 0;
    private _bitIndex: number;

    static getType(type: DataType = 'byte'): DataType {
        let result = type.toLowerCase() as DataType;
        if (result === 'medium') {
            result = 'int24';
        }

        return result;
    }

    static getSignage(signed: Signedness): Signedness {
        return (signed.length === 1 ? signed : signed.charAt(0)).toUpperCase() as Signedness;
    }

    static getEndianness(endian: Endianness): Endianness {
        return (endian.length < 4 ? endian : ENDIAN_SUFFIX[endian.toLowerCase()]).toUpperCase() as Endianness;
    }

    static fromNodeBuffer(buffer: Buffer): ByteBuffer {
        return new ByteBuffer(buffer);
    }

    static toNodeBuffer(byteBuffer: ByteBuffer): Buffer {
        return byteBuffer.toNodeBuffer();
    }

    toNodeBuffer(): Buffer {
        return Buffer.from(this);
    }

    get(): number;
    get(type: Extract<DataType, 'string' | 'STRING'>): string;
    get(type: Extract<DataType, 'long' | 'LONG'>, signed?: Signedness, endian?: Endianness): bigint;
    get(type: Exclude<DataType, 'string' | 'STRING' | 'long' | 'LONG'>, signed?: Signedness, endian?: Endianness): number;
    get(type?: DataType, signed?: Signedness, endian?: Endianness): number | bigint | string;
    get(type: DataType = 'byte', signed: Signedness = 'signed', endian: Endianness = 'be'): number | bigint | string {
        type = ByteBuffer.getType(type);
        signed = ByteBuffer.getSignage(signed);
        endian = ByteBuffer.getEndianness(endian);

        const readerIndex = this._readerIndex;

        if (type === 'smart_short') {
            return this.getSmartShort(readerIndex, signed);
        } else if (type === 'smart_int') {
            return this.getSmartInt(readerIndex, signed);
        } else if (type === 'string') {
            return this.getString();
        } else {
            const size = BYTE_LENGTH[type];
            const signedChar = signed === 'S' ? '' : 'U';
            const bitLength = BIT_LENGTH[type];
            const suffix = type === 'byte' ? '' : endian;
            const smol = type === 'long' ? 'Big' : '';

            this._readerIndex += size;
            const methodName = `read${smol}${signedChar}Int${bitLength}${suffix}`;

            try {
                if (type === 'long') {
                    return this[methodName](readerIndex) as bigint;
                } else {
                    return this[methodName](readerIndex) as number;
                }
            } catch (error) {
                logger.error(`Error reading ${methodName}:`, error);
                return null;
            }
        }
    }

    put(value: number): ByteBuffer;
    put(value: string, type: Extract<DataType, 'string' | 'STRING'>): ByteBuffer;
    put(value: bigint, type: Extract<DataType, 'long' | 'LONG'>): ByteBuffer;
    put(value: number | bigint, type?: DataType, endian?: Endianness): ByteBuffer
    put(value: number | bigint | string, type: DataType = 'byte', endian: Endianness = 'be'): ByteBuffer {
        const writerIndex = this._writerIndex;

        type = ByteBuffer.getType(type);
        endian = ByteBuffer.getEndianness(endian);

        if (type === 'smart_short') {
            return this.putSmartShort(value as number);
        } else if (type === 'smart_int') {
            return this.putSmartInt(value as number);
        } else if (type === 'string' || typeof value === 'string') {
            return this.putString(typeof value !== 'string' ? String(value) : value);
        } else {
            const maxSignedLength = MAX_SIGNED_LENGTHS[type];
            const size = BYTE_LENGTH[type];
            const signedChar = value > maxSignedLength ? 'U' : '';
            const lenChars = BIT_LENGTH[type];
            const suffix = type === 'byte' ? '' : endian;
            const smol = type === 'long' ? 'Big' : '';

            this._writerIndex += size;
            const methodName = `write${signedChar}${smol}Int${lenChars}${suffix}`;

            try {
                return this[methodName](value, writerIndex);
            } catch (error) {
                logger.error(`Error writing ${methodName}:`, error);
                return null;
            }
        }
    }

    at(index: number): number;
    at(index: number, type: Extract<DataType, 'string' | 'STRING'>): string;
    at(index: number, type: Extract<DataType, 'long' | 'LONG'>, signed?: Signedness, endian?: Endianness): bigint;
    at(index: number, type: Exclude<DataType, 'string' | 'STRING' | 'long' | 'LONG'>, signed?: Signedness, endian?: Endianness): number;
    at(index: number, type?: DataType, signed?: Signedness, endian?: Endianness): number | bigint | string;
    at(index: number, type: DataType = 'byte', signed: Signedness = 'signed', endian: Endianness = 'be'): number | bigint | string {
        const readerIndex = this.readerIndex;
        this.readerIndex = index;

        const value = this.get(type, signed, endian);

        // Reset to the original reader index
        this.readerIndex = readerIndex;

        return value;
    }

    getSlice(position: number, length: number): ByteBuffer {
        return new ByteBuffer(this.slice(position, position + length));
    }

    putBytes(from: ByteBuffer | Buffer, fromStart?: number, fromEnd?: number): ByteBuffer {
        from.copy(this, this.writerIndex, fromStart || 0, fromEnd || from.length);
        this.writerIndex = (this.writerIndex + from.length);
        return this;
    }

    getBytes(to: ByteBuffer | Buffer, length?: number): void {
        this.copy(to, 0, this.readerIndex, this.readerIndex + length);
        this.readerIndex += length;
    }

    putBit(value: number): ByteBuffer {
        return this.putBits(1, value);
    }

    putBits(bitCount: number, value: number): ByteBuffer {
        let byteIndex: number = this.bitIndex >> 3;
        let bitOffset: number = 8 - (this.bitIndex & 7);

        this.bitIndex += bitCount;

        for (; bitCount > bitOffset; bitOffset = 8) {
            this[byteIndex] &= ~BIT_MASKS[bitOffset];
            this[byteIndex++] |= (value >> (bitCount - bitOffset)) & BIT_MASKS[bitOffset];
            bitCount -= bitOffset;
        }

        if (bitCount === bitOffset) {
            this[byteIndex] &= ~BIT_MASKS[bitOffset];
            this[byteIndex] |= value & BIT_MASKS[bitOffset];
        } else {
            this[byteIndex] &= ~(BIT_MASKS[bitCount] << (bitOffset - bitCount));
            this[byteIndex] |= (value & BIT_MASKS[bitCount]) << (bitOffset - bitCount);
        }

        return this;
    }

    getBit(): number {
        return this.getBits(1);
    }

    getBits(bitCount: number): number {
        let k = this._bitIndex >> 3;
        let l = 8 - (this._bitIndex & 7);
        let val = 0;
        this._bitIndex += bitCount;
        for (; bitCount > l; l = 8) {
            val += (this.buffer[k++] & BIT_MASKS[l]) << bitCount - l;
            bitCount -= l;
        }

        if (bitCount == l) {
            val += this.buffer[k] & BIT_MASKS[l];
        } else {
            val += this.buffer[k] >> l - bitCount & BIT_MASKS[bitCount];
        }

        return val;
    }

    openBitBuffer(): ByteBuffer {
        this.bitIndex = this.writerIndex * 8;
        return this;
    }

    closeBitBuffer(): void {
        this.writerIndex = Math.floor((this.bitIndex + 7) / 8);
    }

    flipWriter(): ByteBuffer {
        const newBuffer = new ByteBuffer(this.writerIndex);
        this.copy(newBuffer, 0, 0, this.writerIndex);
        return newBuffer;
    }

    flipReader(): ByteBuffer {
        const newBuffer = new ByteBuffer(this.readerIndex);
        this.copy(newBuffer, 0, 0, this.readerIndex);
        return newBuffer;
    }

    flushWriter(): ByteBuffer {
        return this.flipWriter();
    }

    flushReader(): ByteBuffer {
        return this.flipReader();
    }

    getByte(): number {
        return this.get('byte');
    }

    getUByte(): number {
        return this.get('byte', 'unsigned');
    }

    putByte(value: number): ByteBuffer {
        return this.put(value, 'byte');
    }

    getShortBE(): number {
        return this.get('short', 'signed', 'big_endian');
    }

    getUShortBE(): number {
        return this.get('short', 'unsigned', 'big_endian');
    }

    putShortBE(value: number): ByteBuffer {
        return this.put(value, 'short', 'big_endian');
    }

    getShortLE(): number {
        return this.get('short', 'signed', 'little_endian');
    }

    getUShortLE(): number {
        return this.get('short', 'unsigned', 'little_endian');
    }

    putShortLE(value: number): ByteBuffer {
        return this.put(value, 'short', 'little_endian');
    }

    getMediumBE(): number {
        return this.get('medium', 'signed', 'big_endian');
    }

    getUMediumBE(): number {
        return this.get('medium', 'unsigned', 'big_endian');
    }

    putMediumBE(value: number): ByteBuffer {
        return this.put(value, 'medium', 'big_endian');
    }

    getMediumLE(): number {
        return this.get('medium', 'signed', 'little_endian');
    }

    getUMediumLE(): number {
        return this.get('medium', 'unsigned', 'little_endian');
    }

    putMediumLE(value: number): ByteBuffer {
        return this.put(value, 'medium', 'little_endian');
    }

    getIntBE(): number {
        return this.get('int', 'signed', 'big_endian');
    }

    getUIntBE(): number {
        return this.get('int', 'unsigned', 'big_endian');
    }

    putIntBE(value: number): ByteBuffer {
        return this.put(value, 'int', 'big_endian');
    }

    getIntLE(): number {
        return this.get('int', 'signed', 'little_endian');
    }

    getUIntLE(): number {
        return this.get('int', 'unsigned', 'little_endian');
    }

    putIntLE(value: number): ByteBuffer {
        return this.put(value, 'int', 'little_endian');
    }

    getIntME1(): number {
        return this.get('int', 'signed', 'middle_endian_1');
    }

    getUIntME1(): number {
        return this.get('int', 'unsigned', 'middle_endian_1');
    }

    putIntME1(value: number): ByteBuffer {
        return this.put(value, 'int', 'middle_endian_1');
    }

    getIntME2(): number {
        return this.get('int', 'signed', 'middle_endian_2');
    }

    getUIntME2(): number {
        return this.get('int', 'unsigned', 'middle_endian_2');
    }

    putIntME2(value: number): ByteBuffer {
        return this.put(value, 'int', 'middle_endian_2');
    }

    getLongBE(): bigint {
        return this.get('long', 'signed', 'big_endian');
    }

    getULongBE(): bigint {
        return this.get('long', 'unsigned', 'big_endian');
    }

    putLongBE(value: bigint): ByteBuffer {
        return this.put(value, 'long', 'big_endian');
    }

    getLongLE(): bigint {
        return this.get('long', 'signed', 'little_endian');
    }

    getULongLE(): bigint {
        return this.get('long', 'unsigned', 'little_endian');
    }

    putLongLE(value: bigint): ByteBuffer {
        return this.put(value, 'long', 'little_endian');
    }

    getString(terminatingChar: number = 0): string {
        const bytes: number[] = [];
        let b: number;

        while ((b = this.get('byte')) !== terminatingChar) {
            bytes.push(b);
        }

        return Buffer.from(bytes).toString();
    }

    putString(value: string, terminatingChar: number = 0): ByteBuffer {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);

        for (const byte of bytes) {
            this.put(byte);
        }

        this.put(terminatingChar); // end of line
        return this;
    }

    putSmartShort(value: number): ByteBuffer {
        if (value >= 128) {
            this.put(value, 'short');
        } else {
            this.put(value, 'byte');
        }
        return this;
    }

    getSmartShort(offset: number, signed: Signedness = 'signed'): number {
        const peek = this[offset];

        const signedString = ByteBuffer.getSignage(signed);

        if (peek < 128) {
            return this.get('byte', 'u') - (signedString === 'S' ? 0 : 64);
        } else {
            return this.get('short', 'u') - (signedString === 'S' ? 32768 : 49152);
        }
    }

    putSmartInt(value: number): ByteBuffer {
        if (value >= 128) {
            this.put(value, 'int');
        } else {
            this.put(value, 'short');
        }
        return this;
    }

    getSmartInt(offset: number, signed: Signedness = 'signed'): number {
        const peek = this[offset];

        const signedString = ByteBuffer.getSignage(signed);

        if (peek < 128) {
            return this.get('short', 'u') - (signedString === 'S' ? 0 : 64);
        } else {
            return this.get('int', 'u') - (signedString === 'S' ? 32768 : 49152);
        }
    }

    clone(): ByteBuffer {
        const dataCopy = new ByteBuffer(this.length);
        this.copy(dataCopy, 0, 0);
        dataCopy.readerIndex = this.readerIndex;
        return dataCopy;
    }

    readUInt24BE(offset: number): number {
        return ((this[offset] & 0xff) << 16) + ((this[offset + 1] & 0xff) << 8) + (this[offset + 2] & 0xff);
    }

    readInt24BE(offset: number): number {
        return ((this[offset]) << 16) + ((this[offset + 1]) << 8) + (this[offset + 2]);
    }

    readUInt24LE(offset: number): number {
        return ((this[offset + 2] & 0xff) << 16) + ((this[offset + 1] & 0xff) << 8) + (this[offset] & 0xff);
    }

    readInt24LE(offset: number): number {
        return ((this[offset + 2]) << 16) + ((this[offset + 1]) << 8) + (this[offset]);
    }

    readUIntME1(offset: number): number {
        return ((this[offset] & 0xff) << 16) + ((this[offset + 1] & 0xff) << 24) + (this[offset + 2] & 0xff) + ((this[offset + 3] & 0xff) << 8);
    }

    readIntME1(offset: number): number {
        return ((this[offset]) << 16) + ((this[offset + 1]) << 24) + (this[offset + 2]) + ((this[offset + 3]) << 8);
    }

    readUIntME2(offset: number): number {
        return ((this[offset] & 0xff) << 8) + (this[offset + 1] & 0xff) + ((this[offset + 2] & 0xff) << 24) + ((this[offset + 3] & 0xff) << 16);
    }

    readIntME2(offset: number): number {
        return ((this[offset]) << 8) + (this[offset + 1]) + ((this[offset + 2]) << 24) + ((this[offset + 3]) << 16);
    }

    writeUInt24BE(value: number, offset: number): void {
        this[offset] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset + 2] = (value & 0xff);
    }

    writeInt24BE(value: number, offset: number): void {
        this[offset] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset + 2] = (value);
    }

    writeUInt24LE(value: number, offset: number): void {
        this[offset + 2] = ((value & 0xff) >> 16);
        this[offset + 1] = ((value & 0xff) >> 8);
        this[offset] = (value & 0xff);
    }

    writeInt24LE(value: number, offset: number): void {
        this[offset + 2] = (value >> 16);
        this[offset + 1] = (value >> 8);
        this[offset] = (value);
    }

    writeIntME1(value: number, offset: number): void {
        this[offset] = (value >> 16);
        this[offset + 1] = (value >> 24);
        this[offset + 2] = value;
        this[offset + 3] = (value >> 8);
    }

    writeIntME2(value: number, offset: number): void {
        this[offset] = (value >> 8);
        this[offset + 1] = value;
        this[offset + 2] = (value >> 24);
        this[offset + 3] = (value >> 16);
    }

    get writerIndex(): number {
        return this._writerIndex;
    }

    set writerIndex(value: number) {
        this._writerIndex = value;
    }

    get readerIndex(): number {
        return this._readerIndex;
    }

    set readerIndex(value: number) {
        this._readerIndex = value;
    }

    get readable(): number {
        return this.length - this._readerIndex;
    }

    get writable(): number {
        return this.length - this._writerIndex;
    }

    get bitIndex(): number {
        return this._bitIndex;
    }

    set bitIndex(value: number) {
        this._bitIndex = value;
    }
}

Object.setPrototypeOf(ByteBuffer.prototype, Buffer.prototype);

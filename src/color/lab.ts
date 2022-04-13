import { Color } from './color';
import { RGB } from './rgb';
import { fixedFloor, pad } from '../util';


export abstract class LABValues extends Color<LABValues> {

    l: number;
    a: number;
    b: number;

    abstract toString();

}


/**
 * A color within the LAB color space.
 */
export class LAB extends LABValues {

    /**
     * The RGB equivalent of this color, if provided during instantiation.
     */
    rgb: RGB | undefined; // @TODO runtime conversion

    /**
     * Creates a new LAB color instance from the given ARGB integer value.
     * @param argb The ARGB integer to convert to LAB.
     */
    constructor(argb: number);

    /**
     * Creates a new LAB color instance from the given RGB(A) color.
     * @param rgb The RGB color to convert to LAB.
     */
    constructor(rgb: RGB);

    /**
     * Creates a new LAB color instance from the given lightness, a, and b values.
     * @param lightness The color's lightness.
     * @param a The color's A value.
     * @param b The color's B value.
     * @param alpha [optional] The alpha value of the color, from 0-255. Defaults to 255, fully opaque.
     */
    constructor(lightness: number, a: number, b: number, alpha?: number);

    constructor(arg0: number | RGB, a?: number, b?: number, alpha = 255) {
        super('hcl');
        let lightness = arg0;
        if (a === undefined && b === undefined) {
            this.rgb = typeof arg0 === 'number' ? new RGB(arg0) : arg0;
            const { l, a: a2, b: b2 } = LAB.fromRgb(this.rgb);
            lightness = l;
            a = a2;
            b = b2;
            alpha = this.rgb.alpha;
        }

        this.l = lightness as number;
        this.a = a;
        this.b = b;
        this.alpha = alpha ?? 255;
    }

    /**
     * Converts the given RGB(A) color into the LAB format.
     * @param rgb The RGB(A) color to convert into LAB.
     */
    static fromRgb(rgb: RGB): Partial<LABValues> {
        if (rgb.isPureBlack) {
            return { l: 0, a: 0, b: 0 };
        }

        let { r, g, b } = rgb.decimalValues;

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

        x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16 / 116;

        return {
            l: fixedFloor((116 * y) - 16, 1),
            a: fixedFloor(500 * (x - y), 1),
            b: fixedFloor(200 * (y - z), 1)
        };
    }

    /**
     * Checks to see if the given color matches this color.
     * @param other The new color to check against the current color.
     */
    equals(other: LAB): boolean {
        return this.l === other.l && this.a === other.a && this.b === other.b;
    }

    /**
     * Calculates the difference between two colors.
     * @param other The new color to check against the current color.
     */
    difference(other: LAB): number {
        const deltaL = this.l - other.l;
        const deltaA = this.a - other.a;
        const deltaB = this.b - other.b;
        const c1 = Math.sqrt(this.a * this.a + this.b * this.b);
        const c2 = Math.sqrt(other.a * other.a + other.b * other.b);
        const deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;
        const deltaLKlsl = deltaL / (1.0);
        const deltaCkcsc = deltaC / (sc);
        const deltaHkhsh = deltaH / (sh);
        const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }

    toString(): string {
        return `LAB(A) ( ${pad(this.l, 3)}%, ${pad(this.a, 3)}, ` +
            `${pad(this.b, 3)}, ${pad(this.alpha, 3)} )`;
    }

}

import { Color, constants } from './color';
import { RGB } from './rgb';
import { fixedFloor, pad } from '../util';


export abstract class HSVValues extends Color<HSVValues> {

    h: number;
    s: number;
    v: number;

    abstract toString();

}


/**
 * A color within the HSV color space.
 */
export class HSV extends HSVValues {

    /**
     * The RGB equivalent of this color, if provided during instantiation.
     */
    rgb: RGB | undefined; // @TODO runtime conversion

    /**
     * Creates a new Hue-Saturation-Value (HSV/HSB) color instance from the given ARGB integer value.
     * @param argb The ARGB integer to convert to HSV.
     */
    constructor(argb: number);

    /**
     * Creates a new Hue-Saturation-Value (HSV/HSB) color instance from the given RGB(A) color.
     * @param rgb The RGB color to convert to HSV.
     */
    constructor(rgb: RGB);

    /**
     * Creates a new Hue-Saturation-Value (HSV/HSB) color instance from the given hue, saturation, and brightness (v) values.
     * @param hue The hue of the color.
     * @param saturation The color's saturation value.
     * @param value The color's brightness value.
     * @param alpha [optional] The alpha value of the color, from 0-255. Defaults to 255, fully opaque.
     */
    constructor(hue: number, saturation: number, value: number, alpha?: number);

    constructor(arg0: number | RGB, saturation?: number, value?: number, alpha = 255) {
        super('hsv');
        let hue = arg0;
        if (saturation === undefined && value === undefined) {
            this.rgb = typeof arg0 === 'number' ? new RGB(arg0) : arg0;
            const { h, s, v } = HSV.fromRgb(this.rgb);
            hue = h;
            saturation = s;
            value = v;
            alpha = this.rgb.alpha;
        }

        this.h = hue as number;
        this.s = saturation;
        this.v = value;
        this.alpha = alpha ?? 255;
    }

    /**
     * Converts the given RGB(A) color into the Hue-Saturation-Value (HSV/HSB) format.
     * @param rgb The RGB(A) color to convert into HSV.
     */
    static fromRgb(rgb: RGB): Partial<HSVValues> {
        if (rgb.isPureBlack) {
            return { h: constants.black_hue, s: constants.black_saturation, v: 0 };
        }

        let { max } = rgb;

        max /= 255;

        const h = rgb.calculateHue();
        const s = rgb.calculateSaturation();
        const v = fixedFloor(max * 100, 0);

        if (h === 0 && s === 0 && v > 0) {
            // gray/white
            // h = 60; ???
        }

        return Color.values<HSVValues>({ h, s, v });
    }

    /**
     * Checks to see if the given color matches this color.
     * @param other The new color to check against the current color.
     */
    equals(other: HSV): boolean {
        return this.h === other.h && this.s === other.s && this.v === other.v;
    }

    toString(): string {
        return `HSV(A) ( ${pad(this.h, 3)}, ${pad(this.s, 3)}%, ` +
            `${pad(this.v, 3)}%, ${pad(this.alpha, 3)} )`;
    }

}

import { Color, constants } from './color';
import { RGB } from './rgb';
import { pad, fixedFloor } from '../util';


export abstract class HSLValues extends Color<HSLValues> {

    public h: number;
    public s: number;
    public l: number;

    abstract toString();

}


/**
 * A color within the HSL color space.
 */
export class HSL extends HSLValues {

    /**
     * The RGB equivalent of this color, if provided during instantiation.
     */
    public rgb: RGB | undefined; // @TODO runtime conversion

    /**
     * Creates a new Hue-Saturation-Lightness (HSL) color instance from the given ARGB integer value.
     * @param argb The ARGB integer to convert to HSL.
     */
    public constructor(argb: number);

    /**
     * Creates a new Hue-Saturation-Lightness (HSL) color instance from the given RGB(A) color.
     * @param rgb The RGB color to convert to HSL.
     */
    public constructor(rgb: RGB);

    /**
     * Creates a new Hue-Saturation-Lightness (HSL) color instance from the given hue, saturation, and lightness values.
     * @param hue The hue of the color.
     * @param saturation The color's saturation value.
     * @param lightness The color's lightness value.
     * @param alpha [optional] The alpha value of the color, from 0-255. Defaults to 255, fully opaque.
     */
    public constructor(hue: number, saturation: number, lightness: number, alpha?: number);

    public constructor(arg0: number | RGB, saturation?: number, lightness?: number, alpha = 255) {
        super('hsl');
        let hue = arg0;
        if(saturation === undefined && lightness === undefined) {
            this.rgb = typeof arg0 === 'number' ? new RGB(arg0) : arg0;
            const { h, s, l } = HSL.fromRgb(this.rgb);
            hue = h;
            saturation = s;
            lightness = l;
            alpha = this.rgb.alpha;
        }

        this.h = hue as number;
        this.s = saturation;
        this.l = lightness;
        this.alpha = alpha ?? 255;
    }

    /**
     * Converts the given RGB(A) color into the Hue-Saturation-Lightness (HSL) format.
     * @param rgb The RGB(A) color to convert into HSL.
     */
    public static fromRgb(rgb: RGB): Partial<HSLValues> {
        if(rgb.isPureBlack) {
            return { h: constants.black_hue, s: constants.black_saturation, l: 0 };
        }

        let { max, min } = rgb;

        max /= 255;
        min /= 255;

        const h = rgb.calculateHue();
        const s = rgb.calculateSaturation();
        const l = fixedFloor(((max + min) / 2) * 100, 0);

        if(h === 0 && s === 0 && l > 0) {
            // gray/white
            // h = 60; ???
        }

        return Color.values<HSLValues>({ h, s, l });
    }

    /**
     * Checks to see if the given color matches this color.
     * @param other The new color to check against the current color.
     */
    public equals(other: HSL): boolean {
        return this.h === other.h && this.s === other.s && this.l === other.l;
    }

    public toString(): string {
        return `HSL(A) ( ${pad(this.h, 3)}, ${pad(this.s, 3)}%, ` +
            `${pad(this.l, 3)}%, ${pad(this.alpha, 3)} )`;
    }

}

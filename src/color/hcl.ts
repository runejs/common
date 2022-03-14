import { Color, constants } from './color';
import { RGB } from './rgb';
import { fixedFloor, pad } from '../util';


export abstract class HCLValues extends Color<HCLValues> {

    public h: number;
    public c: number;
    public l: number;

    abstract toString();

}


/**
 * A color within the HCL color space.
 */
export class HCL extends HCLValues {

    /**
     * The RGB equivalent of this color, if provided during instantiation.
     */
    public rgb: RGB | undefined; // @TODO runtime conversion

    /**
     * Creates a new Hue-Chroma-Luminance (HCL) color instance from the given ARGB integer value.
     * @param argb The ARGB integer to convert to HCL.
     */
    public constructor(argb: number);

    /**
     * Creates a new Hue-Chroma-Luminance (HCL) color instance from the given RGB(A) color.
     * @param rgb The RGB color to convert to HCL.
     */
    public constructor(rgb: RGB);

    /**
     * Creates a new Hue-Chroma-Luminance (HCL) color instance from the given hue, chroma, and luminance values.
     * @param hue The hue of the color.
     * @param chroma The color's chroma value.
     * @param luminance The color's luminance value.
     * @param alpha [optional] The alpha value of the color, from 0-255. Defaults to 255, fully opaque.
     */
    public constructor(hue: number, chroma: number, luminance: number, alpha?: number);

    public constructor(arg0: number | RGB, chroma?: number, luminance?: number, alpha = 255) {
        super('hcl');
        let hue = arg0;
        if(chroma === undefined && luminance === undefined) {
            this.rgb = typeof arg0 === 'number' ? new RGB(arg0) : arg0;
            const { h, c, l } = HCL.fromRgb(this.rgb);
            hue = h;
            chroma = c;
            luminance = l;
            alpha = this.rgb.alpha;
        }

        this.h = hue as number;
        this.c = chroma;
        this.l = luminance;
        this.alpha = alpha ?? 255;
    }

    /**
     * Converts the given RGB(A) color into the Hue-Chroma-Luminance (HCL) format.
     * @param rgb The RGB(A) color to convert into HCL.
     */
    public static fromRgb(rgb: RGB): Partial<HCLValues> {
        if(rgb.isPureBlack) {
            return { h: constants.black_hue, c: 0, l: 0 };
        }

        const { r, g, b } = rgb.decimalValues;
        let { max, min } = rgb;

        max /= 255;
        min /= 255;

        const h = rgb.calculateHue();

        let c, l: number;

        if(max === 0) {
            c = 0;
            l = 0;
        } else {
            const alpha = (min / max) / 100;
            const q = Math.exp(alpha * 3);
            const rg = r - g;
            const gb = g - b;
            const br = b - r;
            l = ((q * max) + ((1 - q) * min)) / 2;
            c = q * (Math.abs(rg) + Math.abs(gb) + Math.abs(br)) / 3;
        }

        return Color.values<HCLValues>({
            h,
            c: fixedFloor(c * 100, 0),
            l: fixedFloor(l * 100, 0)
        });
    }

    /**
     * Checks to see if the given color matches this color.
     * @param other The new color to check against the current color.
     */
    public equals(other: HCL): boolean {
        return this.h === other.h && this.c === other.c && this.l === other.l;
    }

    public toString(): string {
        return `HCL(A) ( ${pad(this.h, 3)}, ${pad(this.c, 3)}%, ` +
            `${pad(this.l, 3)}%, ${pad(this.alpha, 3)} )`;
    }

}

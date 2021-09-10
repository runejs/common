import { Color } from './color';
import { fixedFloor, pad } from '../util';


export abstract class RGBValues extends Color<RGBValues> {

    public r: number;
    public g: number;
    public b: number;

    abstract toString();

}


/**
 * A color within the RGB color space.
 */
export class RGB extends RGBValues {

    /**
     * Creates a new RGB(A) color instance from the given ARGB integer value.
     * @param argb The ARGB integer to convert to RGB(A).
     */
    public constructor(argb: number);

    /**
     * Creates a new RGB(A) color instance from the given red, green, and blue values.
     * @param red The amount of red in the color, from 0-255.
     * @param green The amount of green in the color, from 0-255.
     * @param blue The amount of blue in the color, from 0-255.
     * @param alpha [optional] The alpha value of the color, from 0-255. Defaults to 255, fully opaque.
     */
    public constructor(red: number, green: number, blue: number, alpha?: number);

    public constructor(arg0: number, green?: number, blue?: number, alpha: number = 255) {
        super('rgb');
        let red = arg0;

        if(green === undefined && blue === undefined) {
            arg0 >>>= 0;
            blue = arg0 & 0xFF;
            green = (arg0 & 0xFF00) >>> 8;
            red = (arg0 & 0xFF0000) >>> 16;
            alpha = (arg0 & 0xFF000000) >>> 24;
        }

        this.r = red ?? 0;
        this.g = green ?? 0;
        this.b = blue ?? 0;
        this.alpha = alpha ?? 255;
    }

    /**
     * Checks to see if the given color matches this color.
     * @param other The new color to check against the current color.
     */
    public equals(other: RGB): boolean {
        if(this.r !== other.r) {
            return false;
        }
        if(this.g !== other.g) {
            return false;
        }
        return this.b === other.b;
    }

    /**
     * Calculates the difference between two colors.
     * @param other The new color to check against the current color.
     */
    public difference(other: RGB): number {
        const { r: r1, g: g1, b: b1 } = this;
        const { r: r2, g: g2, b: b2 } = other;

        const drp2 = Math.pow(r1 - r2, 2),
            dgp2 = Math.pow(g1 - g2, 2),
            dbp2 = Math.pow(b1 - b2, 2),
            t = (r1 + r2) / 2

        return Math.sqrt(2 * drp2 + 4 * dgp2 + 3 * dbp2 + t * (drp2 - dbp2) / 256);
    }

    /**
     * Adds the given color to the current one, creating a new color that is a mixture of the two.
     * R + R, G + G, B + B. If any value exceeds 255, it will wrap back around to 0 and start over.
     * @param other The color to add to the current color.
     */
    public add(other: RGB): void {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;

        if(this.r > 255) {
            this.r -= 255;
        }
        if(this.g > 255) {
            this.g -= 255;
        }
        if(this.b > 255) {
            this.b -= 255;
        }

        if(this.r < 0) {
            this.r += 255;
        }
        if(this.g < 0) {
            this.g += 255;
        }
        if(this.b < 0) {
            this.b += 255;
        }
    }

    /**
     * Calculates the hue value of this RGB(A) color.
     */
    public calculateHue(): number {
        const { decimalValues: { r, g, b }, max, min } = this;

        let h = 0;

        if(max !== min) { // achromatic otherwise
            const delta = max - min;
            switch(max) {
                case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: h = (b - r) / delta + 2; break;
                case b: h = (r - g) / delta + 4; break;
            }

            h /= 6;
        }

        return fixedFloor(h * 360, 0);
    }

    /**
     * Calculates the saturation value of this RGB(A) color.
     */
    public calculateSaturation(): number {
        const { max, min } = this;

        if(max === min) {
            return 0; // achromatic
        }

        const delta = max - min;
        const s = max === 0 ? 0 : delta / max;
        return fixedFloor(s * 100, 0);
    }

    public toString(): string {
        return `RGB(A) ( ${pad(this.r, 3)}, ${pad(this.g, 3)}, ${pad(this.b, 3)}, ` +
            `${pad(this.alpha, 3)})`;
    }

    /**
     * The minimum value found between R, G, and B.
     */
    public get min(): number {
        return Math.min(Math.min(this.r, this.g), this.b);
    }

    /**
     * The maximum value found between R, G, and B.
     */
    public get max(): number {
        return Math.max(Math.max(this.r, this.g), this.b);
    }

    /**
     * The RGBA integer representation of this color.
     * Differing from `get argb()`, this variation places the alpha value at the end of the int instead of the front.<br>
     * `int[red << 24, green << 16, blue << 8, alpha]`
     */
    public get rgba(): number {
        return (this.r << 24) + (this.g << 16) + (this.b << 8) + this.alpha;
    }

    /**
     * The ARGB integer representation of this color.
     * Differing from `get rgba()`, this variation places the alpha value at the front of the int instead of the end.<br>
     * `int[alpha << 24, red << 16, green << 8, blue]`
     */
    public get argb(): number {
        return (this.alpha << 24) + (this.r << 16) + (this.g << 8) + (this.b);
    }

    /**
     * The decimal representations of R, G, and B within this color.<br>
     * `R:G:B / 255`
     */
    public get decimalValues(): RGBValues {
        return this.values({
            r: this.r / 255,
            g: this.g / 255,
            b: this.b / 255
        });
    }

    /**
     * The percentage representations of R, G, and B within this color.<br>
     * `R:G:B / 255 * 100`
     */
    public get percentValues(): RGBValues {
        const r = Math.floor(this.r / 255 * 100);
        const g = Math.floor(this.g / 255 * 100);
        const b = Math.floor(this.b / 255 * 100);
        return this.values({
            r, g, b
        });
    }

    /**
     * Average of the R+G+B values within this color.<br>
     * `(this.r + this.g + this.b) / 3`
     */
    public get value(): number {
        return Math.round((this.r + this.g + this.b) / 3);
    }

    /**
     * Average of the R+G+B percentages within this color.<br>
     * `(percentR + percentG + percentB) / 3`
     */
    public get intensity(): number {
        const { r, g, b } = this.percentValues;
        return Math.round((r + g + b) / 3);
    }

    /**
     * The total value of R+G+B within this color.
     */
    public get total(): number {
        return this.r + this.g + this.b;
    }

    /**
     * The color's luminosity.
     */
    public get luminance(): number {
        return  ((.2126 * this.r) + (.7152 * this.g) + (.0722 * this.b)) / 255;
    }

    /**
     * The color's grayscale rating.
     */
    public get grayscale(): number {
        return Math.abs(Math.max(this.r, this.g) - this.b);
    }

    /**
     * Whether or not the color is pure non-transparent black, hex `#000000`.
     */
    public get isPureBlack(): boolean {
        // RS stores black as RGB 0,0,1 so transparent can be 0,0,0
        return this.r === 0 && this.g === 0 && this.b <= 1;
    }
}

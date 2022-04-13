export type ColorFormat = 'rgb' | 'hsl' | 'hsv' | 'hcl' | 'lab';


export const constants = {
    black_hue: 0,
    white_hue: 0,
    black_saturation: 0,
    white_saturation: 0
};


export abstract class Color<T> {

    readonly format: ColorFormat;
    alpha: number;

    constructor(format: ColorFormat, alpha: number = 255) {
        if (!format) {
            throw new Error(`Invalid color format ${format}.`);
        }
        if (alpha < 0 || alpha > 255) {
            throw new Error(`Alpha value must be between 0-255, received ${alpha}.`);
        }

        this.format = format;
        this.alpha = alpha;
    }

    static values<T>(colorValues: Partial<T>): Partial<T> {
        return { ...colorValues } as unknown as Partial<T>;
    }

    /**
     * Converts the color into a debug string.
     */
    abstract toString(): string;

    values(colorValues: Partial<T>): T {
        if (colorValues['alpha']) {
            return { ...colorValues, format: this.format } as unknown as T;
        }
        return { ...colorValues, format: this.format, alpha: this.alpha } as unknown as T;
    }

}

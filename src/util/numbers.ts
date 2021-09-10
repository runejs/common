export const fixedFloor = (i: number, fractionDigits: number = 0): number => {
    if(isNaN(i) || i < 0) {
        return 0;
    }

    if(fractionDigits === 0) {
        return Math.floor(i);
    } else {
        return Number(i.toFixed(fractionDigits));
    }
};

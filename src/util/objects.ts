export function setObjectProps<T>(object: T,
                                  objectProps: Map<string, unknown> | Partial<T> | undefined,
                                  ignoreFieldNameCase: boolean = false): void {
    if (!objectProps) {
        return;
    }

    const dataKeys = objectProps instanceof Map ? Array.from(objectProps.keys()) :
        Object.keys(objectProps ?? {});
    const objectKeys = Object.keys(object);

    dataKeys.forEach(key => {
        const existingKey = objectKeys.find(k => {
            if (ignoreFieldNameCase) {
                return k.toLowerCase() === key.toLowerCase();
            } else {
                return k === key;
            }
        });

        if (existingKey) {
            const value = objectProps instanceof Map ? objectProps.get(key) : objectProps[key];
            if (typeof object[existingKey] === 'number' || /^\d*$/.test(value)) {
                object[existingKey] = Number(value);
            } else {
                object[existingKey] = value;
            }
        }
    });
}

export const isNumber = (value: any) => {
    return typeof value === 'number' && !isNaN(value);
};

export const isString = (value: any) => {
    return typeof value === 'string';
};

export const isBoolean = (value: any) => {
    return typeof value === 'boolean';
};

export const isArray = (value: any) => {
    return Array.isArray(value);
};

export const isObject = (value: any) => {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
};

export const isFunction = (value: any) => {
    return typeof value === 'function';
};

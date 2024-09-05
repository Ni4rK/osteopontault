"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUndefined = isUndefined;
exports.isNull = isNull;
exports.isString = isString;
exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isDate = isDate;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.isArrayOf = isArrayOf;
function isUndefined(value) {
    return value === undefined;
}
function isNull(value) {
    return value === null;
}
function isString(value) {
    return typeof value === 'string';
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isNumber(value) {
    return typeof value === 'number';
}
function isObject(value) {
    return typeof value === 'object';
}
function isDate(value) {
    return value instanceof Date;
}
function isFunction(value) {
    return (value instanceof Function ||
        typeof value === 'function');
}
function isArray(value) {
    return Array.isArray(value);
}
function isArrayOf(value, guard) {
    if (!isArray(value)) {
        return false;
    }
    for (const element of value) {
        if (!guard(element)) {
            return false;
        }
    }
    return true;
}

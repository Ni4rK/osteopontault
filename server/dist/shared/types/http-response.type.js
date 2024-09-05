"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHttpResponseWithStatusAndCode = isHttpResponseWithStatusAndCode;
const common_types_guards_1 = require("../helpers/common-types.guards");
function isHttpResponseWithStatusAndCode(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'statusCode' in value &&
        (0, common_types_guards_1.isNumber)(value['statusCode']) &&
        'data' in value &&
        (0, common_types_guards_1.isObject)(value['data']));
}

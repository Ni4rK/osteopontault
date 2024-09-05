"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthCredentials = isAuthCredentials;
const common_types_guards_1 = require("../helpers/common-types.guards");
function isAuthCredentials(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'username' in value &&
        (0, common_types_guards_1.isString)(value['username']) &&
        'password' in value &&
        (0, common_types_guards_1.isString)(value['password']));
}

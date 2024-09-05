"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenPayloadGuest = isTokenPayloadGuest;
exports.isTokenPayloadPractitioner = isTokenPayloadPractitioner;
exports.isTokenPayload = isTokenPayload;
const role_enum_1 = require("./role.enum");
const practitioner_enum_1 = require("./practitioner.enum");
const common_types_guards_1 = require("../helpers/common-types.guards");
function isTokenPayloadGuest(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'role' in value &&
        value['role'] === role_enum_1.Role.GUEST);
}
function isTokenPayloadPractitioner(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'role' in value &&
        value['role'] === role_enum_1.Role.PRACTITIONER &&
        'practitioner' in value &&
        (0, practitioner_enum_1.isPractitioner)(value['practitioner']));
}
function isTokenPayload(value) {
    return isTokenPayloadGuest(value) || isTokenPayloadPractitioner(value);
}

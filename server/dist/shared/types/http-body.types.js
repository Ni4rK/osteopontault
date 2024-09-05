"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthTokenHttpBody = isAuthTokenHttpBody;
exports.isAvailabilityInsertHttpBody = isAvailabilityInsertHttpBody;
exports.isAvailabilityUpdateHttpBody = isAvailabilityUpdateHttpBody;
exports.isAvailabilityBookHttpBody = isAvailabilityBookHttpBody;
exports.isMemberPwaSubscriptionHttpBody = isMemberPwaSubscriptionHttpBody;
const role_enum_1 = require("./role.enum");
const auth_credentials_type_1 = require("./auth-credentials.type");
const common_types_guards_1 = require("../helpers/common-types.guards");
const slot_interface_1 = require("./slot.interface");
const patient_interface_1 = require("./patient.interface");
const member_interface_1 = require("./member.interface");
function isAuthTokenHttpBody(value) {
    if (!(0, common_types_guards_1.isObject)(value) || !('role' in value) || !(0, role_enum_1.isRole)(value['role'])) {
        return false;
    }
    if (value['role'] === role_enum_1.Role.GUEST) {
        return true;
    }
    // role === Role.PRACTITIONER
    return 'credentials' in value && (0, auth_credentials_type_1.isAuthCredentials)(value['credentials']);
}
function isAvailabilityInsertHttpBody(value) {
    return (0, common_types_guards_1.isArrayOf)(value, slot_interface_1.isSlot);
}
function isAvailabilityUpdateHttpBody(value) {
    return (0, common_types_guards_1.isArrayOf)(value, slot_interface_1.isSlotPersisted);
}
function isAvailabilityBookHttpBody(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'uid' in value &&
        (0, common_types_guards_1.isString)(value['uid']) &&
        'patient' in value &&
        (0, patient_interface_1.isPatient)(value['patient']));
}
function isMemberPwaSubscriptionHttpBody(value) {
    return (0, member_interface_1.isMemberPwaSubscription)(value);
}

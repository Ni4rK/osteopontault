"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMemberPwaSubscription = isMemberPwaSubscription;
exports.isMember = isMember;
const common_types_guards_1 = require("../helpers/common-types.guards");
function isMemberPwaSubscription(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'endpoint' in value &&
        (0, common_types_guards_1.isString)(value['endpoint']) &&
        'expirationTime' in value &&
        ((0, common_types_guards_1.isNull)(value['expirationTime']) ||
            (0, common_types_guards_1.isNumber)(value['expirationTime'])) &&
        'p256dh' in value &&
        (0, common_types_guards_1.isString)(value['p256dh']) &&
        'authToken' in value &&
        (0, common_types_guards_1.isString)(value['authToken']));
}
function isMember(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'username' in value &&
        (0, common_types_guards_1.isString)(value['username']) &&
        'passwordHashed' in value &&
        (0, common_types_guards_1.isString)(value['passwordHashed']) &&
        'pwaSubscriptions' in value &&
        (0, common_types_guards_1.isArrayOf)(value['pwaSubscriptions'], isMemberPwaSubscription));
}

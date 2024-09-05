"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSlot = isSlot;
exports.isSlotPersisted = isSlotPersisted;
exports.mapDatabaseItemToSlotPersisted = mapDatabaseItemToSlotPersisted;
const patient_interface_1 = require("./patient.interface");
const practitioner_enum_1 = require("./practitioner.enum");
const common_types_guards_1 = require("../helpers/common-types.guards");
function isSlot(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'from' in value &&
        (0, common_types_guards_1.isString)(value['from']) &&
        'to' in value &&
        (0, common_types_guards_1.isString)(value['to']) &&
        'practitioner' in value &&
        (0, practitioner_enum_1.isPractitioner)(value['practitioner']) &&
        'patient' in value) &&
        ((0, common_types_guards_1.isNull)(value['patient']) ||
            (0, patient_interface_1.isPatient)(value['patient']));
}
function isSlotPersisted(value) {
    return (isSlot(value) &&
        'uid' in value &&
        (0, common_types_guards_1.isString)(value['uid']) &&
        (!('bookedAt' in value) ||
            (0, common_types_guards_1.isUndefined)(value['bookedAt']) ||
            (0, common_types_guards_1.isString)(value['bookedAt'])));
}
function mapDatabaseItemToSlotPersisted(item) {
    const from = new Date(item["fromDate"]);
    const to = new Date(item["toDate"]);
    const bookedAt = item["bookedAt"] ? new Date(item["bookedAt"]) : undefined;
    const patient = !item["hasPatient"] ? null : {
        firstname: item["patientFirstname"],
        lastname: item["patientLastname"],
        phone: item["patientPhone"],
        type: item["patientType"]
    };
    return {
        uid: item["uid"],
        from: from.toISOString(),
        to: to.toISOString(),
        practitioner: item["practitioner"],
        bookedAt: bookedAt ? bookedAt.toISOString() : undefined,
        hasPatient: item["hasPatient"],
        patient: patient
    };
}

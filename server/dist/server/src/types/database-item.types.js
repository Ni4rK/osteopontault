"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAvailabilitySlotBaseDatabaseItem = isAvailabilitySlotBaseDatabaseItem;
exports.isAvailabilitySlotWithoutPatientDatabaseItem = isAvailabilitySlotWithoutPatientDatabaseItem;
exports.isAvailabilitySlotWithPatientDatabaseItem = isAvailabilitySlotWithPatientDatabaseItem;
exports.isAvailabilitySlotDatabaseItem = isAvailabilitySlotDatabaseItem;
const practitioner_enum_1 = require("../../../shared/types/practitioner.enum");
const patient_interface_1 = require("../../../shared/types/patient.interface");
const common_types_guards_1 = require("../../../shared/helpers/common-types.guards");
function isAvailabilitySlotBaseDatabaseItem(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'fromDate' in value &&
        (0, common_types_guards_1.isString)(value['fromDate']) &&
        'toDate' in value &&
        (0, common_types_guards_1.isString)(value['toDate']) &&
        'practitioner' in value &&
        (0, practitioner_enum_1.isPractitioner)(value['fromDate']));
}
function isAvailabilitySlotWithoutPatientDatabaseItem(value) {
    return (isAvailabilitySlotBaseDatabaseItem(value) &&
        'hasPatient' in value &&
        value['hasPatient'] === false &&
        'patientFirstname' in value &&
        (0, common_types_guards_1.isNull)(value['patientFirstname']) &&
        'patientLastname' in value &&
        (0, common_types_guards_1.isNull)(value['patientLastname']) &&
        'patientPhone' in value &&
        (0, common_types_guards_1.isNull)(value['patientPhone']) &&
        'patientType' in value &&
        (0, common_types_guards_1.isNull)(value['patientType']));
}
function isAvailabilitySlotWithPatientDatabaseItem(value) {
    return (isAvailabilitySlotBaseDatabaseItem(value) &&
        'hasPatient' in value &&
        value['hasPatient'] === true &&
        'patientFirstname' in value &&
        (0, common_types_guards_1.isString)(value['patientFirstname']) &&
        'patientLastname' in value &&
        (0, common_types_guards_1.isString)(value['patientLastname']) &&
        'patientPhone' in value &&
        (0, common_types_guards_1.isString)(value['patientPhone']) &&
        'patientType' in value &&
        (0, patient_interface_1.isPatientType)(value['patientType']));
}
function isAvailabilitySlotDatabaseItem(value) {
    return (isAvailabilitySlotWithoutPatientDatabaseItem(value) ||
        isAvailabilitySlotWithPatientDatabaseItem(value));
}

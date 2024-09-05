"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientType = void 0;
exports.isPatientType = isPatientType;
exports.isPatient = isPatient;
const common_types_guards_1 = require("../helpers/common-types.guards");
var PatientType;
(function (PatientType) {
    PatientType["ADULT"] = "Adulte";
    PatientType["BABY"] = "B\u00E9b\u00E9";
    PatientType["PREGNANT_WOMAN"] = "Femme enceinte";
    PatientType["SPORTSMAN"] = "Sportif";
    PatientType["CHILD"] = "Enfant";
})(PatientType || (exports.PatientType = PatientType = {}));
function isPatientType(value) {
    return (0, common_types_guards_1.isString)(value) && Object.values(PatientType).includes(value);
}
function isPatient(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'firstname' in value &&
        (0, common_types_guards_1.isString)(value['firstname']) &&
        'lastname' in value &&
        (0, common_types_guards_1.isString)(value['lastname']) &&
        'phone' in value &&
        (0, common_types_guards_1.isString)(value['phone']) &&
        'type' in value &&
        isPatientType(value['type']));
}

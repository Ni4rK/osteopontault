"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Practitioner = void 0;
exports.isPractitioner = isPractitioner;
const common_types_guards_1 = require("../helpers/common-types.guards");
var Practitioner;
(function (Practitioner) {
    Practitioner["ROSE"] = "Rose";
    Practitioner["ANAIS"] = "Anais";
})(Practitioner || (exports.Practitioner = Practitioner = {}));
function isPractitioner(value) {
    return (0, common_types_guards_1.isString)(value) && Object.values(Practitioner).includes(value);
}

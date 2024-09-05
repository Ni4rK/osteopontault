"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
exports.isRole = isRole;
const common_types_guards_1 = require("../helpers/common-types.guards");
var Role;
(function (Role) {
    Role["GUEST"] = "guest";
    Role["PRACTITIONER"] = "practitioner";
})(Role || (exports.Role = Role = {}));
function isRole(value) {
    return (0, common_types_guards_1.isString)(value) && Object.values(Role).includes(value);
}

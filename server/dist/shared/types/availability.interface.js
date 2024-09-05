"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAvailability = isAvailability;
const slot_interface_1 = require("./slot.interface");
const common_types_guards_1 = require("../helpers/common-types.guards");
function isAvailability(value) {
    return ((0, common_types_guards_1.isObject)(value) &&
        'date' in value &&
        (0, common_types_guards_1.isString)(value['date']) &&
        'slots' in value &&
        (0, common_types_guards_1.isArrayOf)(value['slots'], slot_interface_1.isSlot));
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_guards_1 = require("../../../shared/helpers/common-types.guards");
const db_table_enum_1 = __importDefault(require("../../../shared/types/db-table.enum"));
class EnvironmentHelper {
    static getAuthenticationMemberTableName() {
        if ((0, common_types_guards_1.isString)(process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME) && process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME.length) {
            return process.env.DB_AUTHENTICATION_MEMBER_TABLE_NAME;
        }
        return db_table_enum_1.default.AUTHENTICATION_MEMBER;
    }
    static getAvailabilitySlotTableName() {
        if ((0, common_types_guards_1.isString)(process.env.DB_AVAILABILITY_SLOT_TABLE_NAME) && process.env.DB_AVAILABILITY_SLOT_TABLE_NAME.length) {
            return process.env.DB_AVAILABILITY_SLOT_TABLE_NAME;
        }
        return db_table_enum_1.default.AVAILABILITY_SLOT;
    }
    static getDbEndpoint() {
        if ((0, common_types_guards_1.isString)(process.env.DB_ENDPOINT) && process.env.DB_ENDPOINT.length) {
            return process.env.DB_ENDPOINT;
        }
        return null;
    }
    static getMode() {
        if (process.env.MODE === 'prod') {
            return 'prod';
        }
        return 'dev';
    }
    static getAuthKey() {
        if ((0, common_types_guards_1.isString)(process.env.AUTH_KEY) && process.env.AUTH_KEY.length) {
            return process.env.AUTH_KEY;
        }
        return 'fake_auth_key';
    }
    static getAuthExpGuest() {
        if ((0, common_types_guards_1.isString)(process.env.AUTH_EXP_GUEST) && process.env.AUTH_EXP_GUEST.length && (0, common_types_guards_1.isNumber)(+process.env.AUTH_EXP_GUEST)) {
            return +process.env.AUTH_EXP_GUEST;
        }
        return 30 * 60;
    }
    static getAuthExpPractitioner() {
        if ((0, common_types_guards_1.isString)(process.env.AUTH_EXP_PRACTITIONER) && process.env.AUTH_EXP_PRACTITIONER.length && (0, common_types_guards_1.isNumber)(+process.env.AUTH_EXP_PRACTITIONER)) {
            return +process.env.AUTH_EXP_PRACTITIONER;
        }
        return 30 * 60;
    }
    static getVapidPrivateKey() {
        if ((0, common_types_guards_1.isString)(process.env.VAPID_PRIVATE_KEY) && process.env.VAPID_PRIVATE_KEY.length) {
            return process.env.VAPID_PRIVATE_KEY;
        }
        return 'fake_vapid_key';
    }
}
exports.default = EnvironmentHelper;

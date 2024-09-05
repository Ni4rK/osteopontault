"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_enum_1 = require("../../../shared/types/role.enum");
const unauthorized_exception_1 = __importDefault(require("../exceptions/unauthorized.exception"));
const guest_type_1 = require("../../../shared/types/guest.type");
const practitioner_enum_1 = require("../../../shared/types/practitioner.enum");
const auth_token_payload_type_1 = require("../../../shared/types/auth-token-payload.type");
const password_service_1 = __importDefault(require("./password.service"));
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
const member_service_1 = __importDefault(require("./member.service"));
class AuthenticationService {
    static getToken(role, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === role_enum_1.Role.GUEST) {
                return jsonwebtoken_1.default.sign({ role: role_enum_1.Role.GUEST }, environment_helper_1.default.getAuthKey(), { expiresIn: environment_helper_1.default.getAuthExpGuest() });
            }
            // role === Role.PRACTITIONER
            const username = credentials.username;
            const password = credentials.password;
            if (!(0, practitioner_enum_1.isPractitioner)(username)) {
                throw new unauthorized_exception_1.default();
            }
            const member = yield member_service_1.default.find(username);
            if (!(yield password_service_1.default.verify(password, member.passwordHashed))) {
                throw new unauthorized_exception_1.default();
            }
            return jsonwebtoken_1.default.sign({ role: role_enum_1.Role.PRACTITIONER, practitioner: member.username }, environment_helper_1.default.getAuthKey(), { expiresIn: environment_helper_1.default.getAuthExpPractitioner() });
        });
    }
    static authenticate(token) {
        try {
            const decodedPayload = jsonwebtoken_1.default.verify(token, environment_helper_1.default.getAuthKey());
            if ((0, auth_token_payload_type_1.isTokenPayloadGuest)(decodedPayload)) {
                return guest_type_1.Guest;
            }
            if ((0, auth_token_payload_type_1.isTokenPayloadPractitioner)(decodedPayload)) {
                return decodedPayload.practitioner;
            }
        }
        catch (error) {
            throw new unauthorized_exception_1.default();
        }
        throw new unauthorized_exception_1.default();
    }
}
exports.default = AuthenticationService;

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
exports.authenticationHandler = void 0;
const handler_wrapper_1 = __importDefault(require("./handler.wrapper"));
const bad_request_exception_1 = __importDefault(require("../exceptions/bad-request.exception"));
const http_method_enum_1 = __importDefault(require("../../../shared/types/http-method.enum"));
const http_path_enum_1 = __importDefault(require("../../../shared/types/http-path.enum"));
const authentication_service_1 = __importDefault(require("../services/authentication.service"));
const http_body_types_1 = require("../../../shared/types/http-body.types");
const member_service_1 = __importDefault(require("../services/member.service"));
const practitioner_enum_1 = require("../../../shared/types/practitioner.enum");
const forbidden_exception_1 = __importDefault(require("../exceptions/forbidden.exception"));
const common_http_responses_1 = require("../../../shared/helpers/common.http-responses");
exports.authenticationHandler = (0, handler_wrapper_1.default)((request) => __awaiter(void 0, void 0, void 0, function* () {
    // GET TOKEN
    if (request.path === http_path_enum_1.default.AUTH_TOKEN && request.method === http_method_enum_1.default.POST) {
        const body = request.body;
        if (!(0, http_body_types_1.isAuthTokenHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        return authentication_service_1.default.getToken(body.role, body.credentials);
    }
    // ADD PWA SUBSCRIPTION
    if (request.path === http_path_enum_1.default.MEMBER_PWA_SUBSCRIPTION && request.method === http_method_enum_1.default.PATCH) {
        const user = request.user;
        const body = request.body;
        if (!(0, practitioner_enum_1.isPractitioner)(user)) {
            throw new forbidden_exception_1.default();
        }
        if (!(0, http_body_types_1.isMemberPwaSubscriptionHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        yield member_service_1.default.addPwaSubscription(user, body);
        return Promise.resolve(common_http_responses_1.http200EmptyResponse);
    }
    throw new bad_request_exception_1.default();
}), true);

"use strict";
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
exports.authenticationHandler = (0, handler_wrapper_1.default)((request) => {
    if (request.method !== http_method_enum_1.default.POST) {
        throw new bad_request_exception_1.default();
    }
    if (request.path === http_path_enum_1.default.AUTH_TOKEN) {
        const body = request.body;
        if (!(0, http_body_types_1.isAuthTokenHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        return authentication_service_1.default.getToken(body.role, body.credentials);
    }
    throw new bad_request_exception_1.default();
});

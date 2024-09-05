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
exports.default = handlerWrapper;
const http_exception_1 = __importDefault(require("../exceptions/http.exception"));
const http_response_type_1 = require("../../../shared/types/http-response.type");
const token_header_type_1 = require("../../../shared/types/token-header.type");
const common_types_guards_1 = require("../../../shared/helpers/common-types.guards");
const authentication_service_1 = __importDefault(require("../services/authentication.service"));
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
function createHeadersForResponse() {
    if (environment_helper_1.default.getMode() === 'dev') {
        return {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE"
        };
    }
    return {
        "Access-Control-Allow-Origin": "https://osteopontault.fr", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE"
    };
}
function createRequestFromEvent(event) {
    var _a, _b;
    return {
        method: event.httpMethod.toUpperCase(),
        path: event.path,
        headers: event.headers,
        query: (_a = event.queryStringParameters) !== null && _a !== void 0 ? _a : {},
        body: JSON.parse((_b = event.body) !== null && _b !== void 0 ? _b : '{}'),
        user: null
    };
}
function createAPIGatewayProxyResultFromResponse(response) {
    if ((0, http_response_type_1.isHttpResponseWithStatusAndCode)(response)) {
        return {
            statusCode: response.statusCode,
            headers: createHeadersForResponse(),
            body: JSON.stringify(response.data)
        };
    }
    return {
        statusCode: 200,
        headers: createHeadersForResponse(),
        body: JSON.stringify(response)
    };
}
function createAPIGatewayProxyResultFromError(error) {
    // TODO: add some logs in console
    console.error("Exception: ", error);
    if (error instanceof http_exception_1.default) {
        return {
            statusCode: error.statusCode,
            headers: createHeadersForResponse(),
            body: JSON.stringify(error.message)
        };
    }
    return {
        statusCode: 500,
        headers: createHeadersForResponse(),
        body: JSON.stringify('Server error')
    };
}
function handleAuthentication(request) {
    const header = request.headers[token_header_type_1.TokenHeader];
    if (!(0, common_types_guards_1.isString)(header)) {
        request.user = null;
        return;
    }
    const bearer = header.split(' ');
    if (!(0, common_types_guards_1.isArrayOf)(bearer, common_types_guards_1.isString) || bearer.length < 2 || bearer[0].trim() !== token_header_type_1.TokenBearer) {
        request.user = null;
        return;
    }
    const token = bearer[1].trim();
    request.user = authentication_service_1.default.authenticate(token);
}
function handlerWrapper(handler, withAuthentication = false) {
    return function (event, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = createRequestFromEvent(event);
                if (withAuthentication) {
                    handleAuthentication(request);
                }
                const response = yield handler(request);
                return Promise.resolve(createAPIGatewayProxyResultFromResponse(response));
            }
            catch (error) {
                return Promise.resolve(createAPIGatewayProxyResultFromError(error));
            }
        });
    };
}

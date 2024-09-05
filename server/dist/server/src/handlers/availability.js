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
exports.availabilityHandler = void 0;
const handler_wrapper_1 = __importDefault(require("./handler.wrapper"));
const bad_request_exception_1 = __importDefault(require("../exceptions/bad-request.exception"));
const http_method_enum_1 = __importDefault(require("../../../shared/types/http-method.enum"));
const http_path_enum_1 = __importDefault(require("../../../shared/types/http-path.enum"));
const availability_service_1 = __importDefault(require("../services/availability.service"));
const http_body_types_1 = require("../../../shared/types/http-body.types");
const common_http_responses_1 = require("../../../shared/helpers/common.http-responses");
const unauthorized_exception_1 = __importDefault(require("../exceptions/unauthorized.exception"));
const practitioner_enum_1 = require("../../../shared/types/practitioner.enum");
const common_types_guards_1 = require("../../../shared/helpers/common-types.guards");
exports.availabilityHandler = (0, handler_wrapper_1.default)((request) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    if (!request.user) {
        throw new unauthorized_exception_1.default();
    }
    // LIST SLOTS
    if (request.path === http_path_enum_1.default.AVAILABILITY_GET && request.method === http_method_enum_1.default.GET) {
        const from = request.query.from;
        const to = request.query.to;
        const fromDate = (0, common_types_guards_1.isString)(from) ? new Date(from) : undefined;
        const toDate = (0, common_types_guards_1.isString)(to) ? new Date(to) : undefined;
        return availability_service_1.default.getAvailabilities(fromDate, toDate);
    }
    // BOOK SLOT
    if (request.path === http_path_enum_1.default.AVAILABILITY_BOOK && request.method === http_method_enum_1.default.PATCH) {
        if (!(0, http_body_types_1.isAvailabilityBookHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        yield availability_service_1.default.bookAvailabilitySlots(body.uid, body.patient);
        return common_http_responses_1.http200EmptyResponse;
    }
    if (request.path === http_path_enum_1.default.AVAILABILITY_DELETE && request.method === http_method_enum_1.default.DELETE) {
        if (!(0, practitioner_enum_1.isPractitioner)(request.user)) {
            throw new unauthorized_exception_1.default();
        }
        const uid = request.query.uid;
        yield availability_service_1.default.removeAvailabilitySlots((0, common_types_guards_1.isString)(uid) ? [uid] : []);
        return common_http_responses_1.http200EmptyResponse;
    }
    // CREATE SLOTS
    if (request.path === http_path_enum_1.default.AVAILABILITY_INSERT && request.method === http_method_enum_1.default.POST) {
        if (!(0, practitioner_enum_1.isPractitioner)(request.user)) {
            throw new unauthorized_exception_1.default();
        }
        if (!(0, http_body_types_1.isAvailabilityInsertHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        const slots = body.map(slot => ({
            from: slot.from,
            to: slot.to,
            practitioner: slot.practitioner,
            hasPatient: slot.hasPatient,
            patient: slot.patient
        }));
        yield availability_service_1.default.insertAvailabilitySlots(slots);
        return common_http_responses_1.http200EmptyResponse;
    }
    // EDIT SLOT
    if (request.path === http_path_enum_1.default.AVAILABILITY_UPDATE && request.method === http_method_enum_1.default.PATCH) {
        if (!(0, practitioner_enum_1.isPractitioner)(request.user)) {
            throw new unauthorized_exception_1.default();
        }
        if (!(0, http_body_types_1.isAvailabilityUpdateHttpBody)(body)) {
            throw new bad_request_exception_1.default();
        }
        const slots = body.map(slot => ({
            uid: slot.uid,
            from: new Date(slot.from).toISOString(),
            to: new Date(slot.to).toISOString(),
            practitioner: slot.practitioner,
            hasPatient: slot.hasPatient,
            patient: slot.patient
        }));
        yield availability_service_1.default.updateAvailabilitySlots(slots);
        return common_http_responses_1.http200EmptyResponse;
    }
    throw new bad_request_exception_1.default();
}), true);

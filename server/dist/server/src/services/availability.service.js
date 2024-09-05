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
const client_database_1 = __importDefault(require("../database/client.database"));
const slot_interface_1 = require("../../../shared/types/slot.interface");
const date_helper_1 = __importDefault(require("../../../shared/helpers/date.helper"));
const date_format_enum_1 = __importDefault(require("../../../shared/types/date-format.enum"));
const bad_request_exception_1 = __importDefault(require("../exceptions/bad-request.exception"));
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
const notification_push_service_1 = __importDefault(require("./notification-push.service"));
class AvailabilityService {
    static find(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield client_database_1.default.find({
                TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                FilterExpression: "uid = :uid",
                ExpressionAttributeValues: { ":uid": uid }
            });
            if (!slots.Count) {
                throw new bad_request_exception_1.default(`No slot found with uid ${uid}`);
            }
            if (slots.Count !== 1) {
                throw new bad_request_exception_1.default(`Too many slots found with uid ${uid}`);
            }
            const slotRaw = slots.Items[0];
            const slot = (0, slot_interface_1.mapDatabaseItemToSlotPersisted)(slotRaw);
            if (!(0, slot_interface_1.isSlotPersisted)(slot)) {
                throw new bad_request_exception_1.default(`Slot with uid ${uid} does not look like a slot`);
            }
            return slot;
        });
    }
    static getAvailabilities(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const slotsByDate = {};
            const filterExpressions = [];
            const expressionAttributeValues = {};
            if (from) {
                filterExpressions.push('fromDate >= :fromDate');
                expressionAttributeValues[':fromDate'] = from.toISOString();
            }
            if (to) {
                filterExpressions.push('toDate <= :toDate');
                expressionAttributeValues[':toDate'] = to.toISOString();
            }
            const result = yield client_database_1.default.find({
                TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                FilterExpression: filterExpressions.length ? filterExpressions.join(' AND ') : undefined,
                ExpressionAttributeValues: filterExpressions.length ? expressionAttributeValues : undefined
            });
            ((_a = result === null || result === void 0 ? void 0 : result.Items) !== null && _a !== void 0 ? _a : []).forEach(item => {
                const slot = (0, slot_interface_1.mapDatabaseItemToSlotPersisted)(item);
                const date = date_helper_1.default.format(slot.from, date_format_enum_1.default.SHORT_DATE_API);
                if (slotsByDate[date] === undefined) {
                    slotsByDate[date] = [];
                }
                slotsByDate[date].push(slot);
            });
            return Promise.resolve(Object.keys(slotsByDate).map(date => ({
                date: slotsByDate[date][0].from,
                slots: slotsByDate[date]
            })));
        });
    }
    static insertAvailabilitySlots(slots) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slots.forEach((slot) => __awaiter(this, void 0, void 0, function* () {
                const hasPatient = !!slot.patient && !!slot.patient.firstname && !!slot.patient.lastname && !!slot.patient.phone && !!slot.patient.type;
                yield client_database_1.default.insert({
                    TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                    Item: {
                        uid: `${Math.floor(Math.random() * 1000)}-${Date.now()}`,
                        fromDate: slot.from,
                        toDate: slot.to,
                        practitioner: slot.practitioner,
                        hasPatient: hasPatient,
                        patientFirstname: hasPatient ? slot.patient.firstname : null,
                        patientLastname: hasPatient ? slot.patient.lastname : null,
                        patientPhone: hasPatient ? slot.patient.phone : null,
                        patientType: hasPatient ? slot.patient.type : null
                    }
                });
            }));
        });
    }
    static updateAvailabilitySlots(slots) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slots.forEach((slot) => __awaiter(this, void 0, void 0, function* () {
                const bookedAt = slot.bookedAt ? slot.bookedAt : new Date().toISOString();
                yield client_database_1.default.update({
                    TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                    Key: {
                        uid: slot.uid
                    },
                    UpdateExpression: "SET" +
                        " fromDate = :fromDate," +
                        " toDate = :toDate," +
                        " practitioner = :practitioner," +
                        " bookedAt = :bookedAt," +
                        " hasPatient = :hasPatient," +
                        " patientFirstname = :patientFirstname," +
                        " patientLastname = :patientLastname," +
                        " patientPhone = :patientPhone," +
                        " patientType = :patientType",
                    ExpressionAttributeValues: {
                        ":fromDate": slot.from,
                        ":toDate": slot.to,
                        ":practitioner": slot.practitioner,
                        ":bookedAt": bookedAt,
                        ":hasPatient": slot.hasPatient,
                        ":patientFirstname": slot.hasPatient ? slot.patient.firstname : null,
                        ":patientLastname": slot.hasPatient ? slot.patient.lastname : null,
                        ":patientPhone": slot.hasPatient ? slot.patient.phone : null,
                        ":patientType": slot.hasPatient ? slot.patient.type : null
                    }
                });
            }));
        });
    }
    static bookAvailabilitySlots(slotUid, patient) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.find(slotUid);
            if (slot.hasPatient) {
                throw new bad_request_exception_1.default("Créneau déjà réservé");
            }
            const bookedAt = new Date().toISOString();
            yield client_database_1.default.update({
                TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                Key: {
                    uid: slot.uid
                },
                UpdateExpression: "SET" +
                    " bookedAt = :bookedAt," +
                    " hasPatient = :hasPatient," +
                    " patientFirstname = :patientFirstname," +
                    " patientLastname = :patientLastname," +
                    " patientPhone = :patientPhone," +
                    " patientType = :patientType",
                ExpressionAttributeValues: {
                    ":bookedAt": bookedAt,
                    ":hasPatient": true,
                    ":patientFirstname": patient.firstname,
                    ":patientLastname": patient.lastname,
                    ":patientPhone": patient.phone,
                    ":patientType": patient.type
                }
            });
            const slotShortDateTime = `${date_helper_1.default.format(slot.from, date_format_enum_1.default.SHORT_DATE)} à ${date_helper_1.default.format(slot.from, date_format_enum_1.default.TIME)}`;
            const slotLongDateTime = date_helper_1.default.format(slot.from, date_format_enum_1.default.DATE_TIME);
            yield notification_push_service_1.default.notify(slot.practitioner, {
                title: `Créneau reservé (${slotShortDateTime})`,
                body: `${patient.lastname} ${patient.firstname} a pris le créneau du ${slotLongDateTime}`
            });
        });
    }
    static removeAvailabilitySlots(slotsUid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slotsUid.forEach((uid) => __awaiter(this, void 0, void 0, function* () {
                yield client_database_1.default.remove({
                    TableName: environment_helper_1.default.getAvailabilitySlotTableName(),
                    Key: {
                        uid: uid
                    }
                });
            }));
        });
    }
}
exports.default = AvailabilityService;

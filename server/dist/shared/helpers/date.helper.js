"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_format_enum_1 = __importDefault(require("../types/date-format.enum"));
const common_types_guards_1 = require("./common-types.guards");
class DateHelper {
    static format(date, format) {
        if (!date) {
            return '';
        }
        const dateToFormat = (0, common_types_guards_1.isDate)(date) ? date : new Date(date);
        let formatter = new Intl.DateTimeFormat('fr-FR');
        switch (format) {
            case date_format_enum_1.default.FULL_DATE:
                formatter = new Intl.DateTimeFormat('fr-FR', {
                    month: "long",
                    day: "2-digit",
                    weekday: "long"
                });
                break;
            case date_format_enum_1.default.MEDIUM_DATE:
                formatter = new Intl.DateTimeFormat('fr-FR', {
                    month: "short",
                    day: "2-digit",
                    weekday: "short"
                });
                break;
            case date_format_enum_1.default.DATE_TIME:
                formatter = new Intl.DateTimeFormat('fr-FR', {
                    month: "long",
                    day: "2-digit",
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit"
                });
                break;
            case date_format_enum_1.default.SHORT_DATE:
                formatter = new Intl.DateTimeFormat('fr-FR', {
                    day: "numeric",
                    weekday: "short"
                });
                break;
            case date_format_enum_1.default.TIME:
                formatter = new Intl.DateTimeFormat('fr-FR', {
                    hour: "2-digit",
                    minute: "2-digit"
                });
                break;
            case date_format_enum_1.default.DATE_PRIME:
            case date_format_enum_1.default.SHORT_DATE_API:
            default:
        }
        return formatter.format(dateToFormat);
    }
    static getDifferenceOfTime(date1, date2) {
        const d1 = (0, common_types_guards_1.isDate)(date1) ? date1 : new Date(date1);
        const d2 = (0, common_types_guards_1.isDate)(date2) ? date2 : new Date(date2);
        d1.setSeconds(0);
        d1.setMilliseconds(0);
        d2.setSeconds(0);
        d2.setMilliseconds(0);
        return (d2.getTime() - d1.getTime()) / (60 * 1000);
    }
    static getWeekFromDate(date) {
        const startOfWeek = this.getStartOfWeekFromDate(date);
        startOfWeek.setHours(0);
        startOfWeek.setMinutes(0);
        return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
            const dayOfWeek = new Date(startOfWeek);
            dayOfWeek.setDate(startOfWeek.getDate() + offset);
            return dayOfWeek;
        });
    }
    static getStartOfWeekFromDate(date) {
        const day = date.getDay();
        const offsetForStartOfWeek = day - 1;
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - offsetForStartOfWeek);
        startOfWeek.setSeconds(0);
        startOfWeek.setMilliseconds(0);
        return startOfWeek;
    }
    static parseMinutes(minutes) {
        const parts = [];
        const parsedHours = Math.floor(minutes / 60);
        const parsedMinutes = Math.floor(minutes % 60);
        if (parsedHours) {
            parts.push(`${parsedHours}h`);
        }
        if (parsedMinutes) {
            parts.push(`${parsedMinutes}min`);
        }
        return parts.join('');
    }
}
exports.default = DateHelper;

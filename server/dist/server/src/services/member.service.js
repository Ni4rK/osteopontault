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
const member_interface_1 = require("../../../shared/types/member.interface");
const client_database_1 = __importDefault(require("../database/client.database"));
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
const unauthorized_exception_1 = __importDefault(require("../exceptions/unauthorized.exception"));
class MemberService {
    static find(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield client_database_1.default.find({
                TableName: environment_helper_1.default.getAuthenticationMemberTableName(),
                FilterExpression: "username = :username",
                ExpressionAttributeValues: { ":username": username },
                ConsistentRead: true
            });
            if (!results.Count) {
                throw new unauthorized_exception_1.default();
            }
            if (results.Count !== 1) {
                throw new unauthorized_exception_1.default();
            }
            const member = results.Items[0];
            if (!(0, member_interface_1.isMember)(member)) {
                throw new unauthorized_exception_1.default();
            }
            return member;
        });
    }
    static addPwaSubscription(username, pwaSubscription) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.find(username);
            member.pwaSubscriptions.push(pwaSubscription);
            yield client_database_1.default.update({
                TableName: environment_helper_1.default.getAuthenticationMemberTableName(),
                Key: {
                    username: member.username
                },
                UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
                ExpressionAttributeValues: {
                    ":pwaSubscriptions": member.pwaSubscriptions
                }
            });
        });
    }
}
exports.default = MemberService;

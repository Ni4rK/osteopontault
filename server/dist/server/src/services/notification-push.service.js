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
const web_push_1 = require("web-push");
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
const configuration_1 = require("../../../shared/helpers/configuration");
const member_service_1 = __importDefault(require("./member.service"));
const client_database_1 = __importDefault(require("../database/client.database"));
class NotificationPushService {
    static notify(username, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield member_service_1.default.find(username);
            const mode = environment_helper_1.default.getMode();
            (0, web_push_1.setVapidDetails)('https://osteopontault.fr', mode === 'prod' ? configuration_1.PWA_VAPID_PUBLIC_KEY_PROD : configuration_1.PWA_VAPID_PUBLIC_KEY_DEV, environment_helper_1.default.getVapidPrivateKey());
            const pwaSubscriptionsToKeep = [];
            for (const subscription of member.pwaSubscriptions.slice(0, this.MAX_NOTIFICATION)) {
                try {
                    yield (0, web_push_1.sendNotification)({
                        endpoint: subscription.endpoint,
                        keys: {
                            auth: subscription.authToken,
                            p256dh: subscription.p256dh
                        }
                    }, JSON.stringify(message));
                    pwaSubscriptionsToKeep.push(subscription);
                }
                catch (error) {
                    console.error("WebPush Exception: ", error);
                    if (!(error instanceof web_push_1.WebPushError) || error.statusCode !== 410) {
                        pwaSubscriptionsToKeep.push(subscription);
                    }
                }
            }
            if (pwaSubscriptionsToKeep.length !== member.pwaSubscriptions.length) {
                yield client_database_1.default.update({
                    TableName: environment_helper_1.default.getAuthenticationMemberTableName(),
                    Key: {
                        username: member.username
                    },
                    UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
                    ExpressionAttributeValues: {
                        ":pwaSubscriptions": pwaSubscriptionsToKeep
                    }
                });
            }
        });
    }
}
NotificationPushService.MAX_NOTIFICATION = 3;
exports.default = NotificationPushService;

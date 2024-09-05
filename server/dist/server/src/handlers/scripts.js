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
exports.scriptsHandler = void 0;
const handler_wrapper_1 = __importDefault(require("../handlers/handler.wrapper"));
const http_method_enum_1 = __importDefault(require("../../../shared/types/http-method.enum"));
const bad_request_exception_1 = __importDefault(require("../exceptions/bad-request.exception"));
const http_path_enum_1 = __importDefault(require("../../../shared/types/http-path.enum"));
const client_database_1 = __importDefault(require("../database/client.database"));
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const common_http_responses_1 = require("../../../shared/helpers/common.http-responses");
const db_table_enum_1 = __importDefault(require("../../../shared/types/db-table.enum"));
const common_types_guards_1 = require("../../../shared/helpers/common-types.guards");
const password_service_1 = __importDefault(require("../services/password.service"));
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
exports.scriptsHandler = (0, handler_wrapper_1.default)((request) => __awaiter(void 0, void 0, void 0, function* () {
    //////////////////////////////
    // BOTH PROD & DEV
    // DATABASE MIGRATION
    if (request.path === http_path_enum_1.default.SCRIPT_DATABASE_MIGRATION && request.method === http_method_enum_1.default.GET) {
        yield migrationFeaturePwaSubscriptions();
        return common_http_responses_1.http200EmptyResponse;
    }
    //////////////////////////////
    // ONLY DEV
    if (environment_helper_1.default.getMode() !== "dev") {
        throw new bad_request_exception_1.default();
    }
    if (request.method !== http_method_enum_1.default.GET) {
        throw new bad_request_exception_1.default("Only GET requests");
    }
    // CREATE USER
    if (request.path === http_path_enum_1.default.SCRIPT_CREATE_USER) {
        const username = request.query['username'];
        const password = request.query['password'];
        if (!(0, common_types_guards_1.isString)(password) || !(0, common_types_guards_1.isString)(username)) {
            throw new bad_request_exception_1.default("Missing username or password");
        }
        const member = {
            username: username,
            passwordHashed: yield password_service_1.default.hash(password),
            pwaSubscriptions: []
        };
        yield client_database_1.default.insert({
            TableName: db_table_enum_1.default.AUTHENTICATION_MEMBER,
            Item: Object.assign(Object.assign({}, member), { pwaSubscriptions: member.pwaSubscriptions })
        });
        return common_http_responses_1.http200EmptyResponse;
    }
    // INIT DATABASE
    if (request.path === http_path_enum_1.default.SCRIPT_INIT_DATABASE) {
        const authenticationTableInput = {
            TableName: db_table_enum_1.default.AUTHENTICATION_MEMBER,
            "AttributeDefinitions": [
                {
                    "AttributeName": "username",
                    "AttributeType": "S"
                }
            ],
            "KeySchema": [
                {
                    "AttributeName": "username",
                    "KeyType": "HASH"
                }
            ],
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 2,
                "WriteCapacityUnits": 2
            },
        };
        const availabilityTableInput = {
            TableName: db_table_enum_1.default.AVAILABILITY_SLOT,
            "AttributeDefinitions": [
                {
                    "AttributeName": "uid",
                    "AttributeType": "S"
                }
            ],
            "KeySchema": [
                {
                    "AttributeName": "uid",
                    "KeyType": "HASH"
                }
            ],
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 2,
                "WriteCapacityUnits": 2
            },
        };
        yield client_database_1.default.client.send(new client_dynamodb_1.CreateTableCommand(authenticationTableInput));
        yield client_database_1.default.client.send(new client_dynamodb_1.CreateTableCommand(availabilityTableInput));
        return common_http_responses_1.http200EmptyResponse;
    }
    throw new bad_request_exception_1.default();
}));
function migrationFeaturePwaSubscriptions() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const authenticationMemberTable = environment_helper_1.default.getAuthenticationMemberTableName();
        const result = yield client_database_1.default.find({
            TableName: authenticationMemberTable
        });
        const members = ((_a = result === null || result === void 0 ? void 0 : result.Items) !== null && _a !== void 0 ? _a : []);
        for (const member of members) {
            if (member["pwaSubscriptions"]) {
                continue;
            }
            yield client_database_1.default.update({
                TableName: authenticationMemberTable,
                Key: {
                    username: member["username"]
                },
                UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
                ExpressionAttributeValues: {
                    ":pwaSubscriptions": []
                }
            });
        }
    });
}

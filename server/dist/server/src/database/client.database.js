"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const environment_helper_1 = __importDefault(require("../utils/environment.helper"));
class ClientDatabase {
    constructor() {
        const endpoint = environment_helper_1.default.getDbEndpoint();
        if (endpoint) {
            this.client = new client_dynamodb_1.DynamoDBClient({ endpoint: endpoint });
        }
        else {
            this.client = new client_dynamodb_1.DynamoDBClient();
        }
        this.dDBClient = lib_dynamodb_1.DynamoDBDocumentClient.from(this.client);
    }
    find(parameters) {
        return this.dDBClient.send(new lib_dynamodb_1.ScanCommand(parameters), {});
    }
    insert(parameters) {
        return this.dDBClient.send(new lib_dynamodb_1.PutCommand(parameters));
    }
    update(parameters) {
        return this.dDBClient.send(new lib_dynamodb_1.UpdateCommand(parameters));
    }
    remove(parameters) {
        return this.dDBClient.send(new lib_dynamodb_1.DeleteCommand(parameters));
    }
}
const clientDatabase = new ClientDatabase();
exports.default = clientDatabase;

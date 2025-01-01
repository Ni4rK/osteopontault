import handlerWrapper from "../handlers/handler.wrapper";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse} from "@shared/types/http-response.type";
import HttpMethod from "@shared/types/http-method.enum";
import BadRequestException from "../exceptions/bad-request.exception";
import HttpPath from "@shared/types/http-path.enum";
import databaseClient from "../clients/database.client";
import {CreateTableCommand, CreateTableInput} from "@aws-sdk/client-dynamodb";
import {http200EmptyResponse} from "@shared/helpers/common.http-responses";
import DbTable from "@shared/types/db-table.enum";
import {Member} from "@shared/types/member.interface";
import {isString} from "@shared/helpers/common-types.guards";
import PasswordService from "../services/password.service";
import EnvironmentHelper from "../utils/environment.helper";

export const scriptsHandler = handlerWrapper(async (request: HttpRequest): Promise<HttpResponse> => {
  //////////////////////////////
  // BOTH PROD & DEV

  // DATABASE MIGRATION
  if (request.path === HttpPath.SCRIPT_DATABASE_MIGRATION && request.method === HttpMethod.GET) {
    await migrationFeaturePwaSubscriptions()
    return http200EmptyResponse
  }

  //////////////////////////////
  // ONLY DEV
  if (EnvironmentHelper.getMode() !== "dev") {
    throw new BadRequestException()
  }
  if (request.method !== HttpMethod.GET) {
    throw new BadRequestException("Only GET requests")
  }

  // CREATE USER
  if (request.path === HttpPath.SCRIPT_CREATE_USER) {
    const username = request.query['username']
    const password = request.query['password']
    if (!isString(password) || !isString(username)) {
      throw new BadRequestException("Missing username or password")
    }
    const member: Member = {
      username: username,
      passwordHashed: await PasswordService.hash(password),
      pwaSubscriptions: []
    }
    await databaseClient.insert({
      TableName: DbTable.AUTHENTICATION_MEMBER,
      Item: {
        ...member,
        pwaSubscriptions: member.pwaSubscriptions
      }
    })
    return http200EmptyResponse
  }

  // INIT DATABASE
  if (request.path === HttpPath.SCRIPT_INIT_DATABASE) {
    if (!request.query["database"] || request.query["database"] === DbTable.AUTHENTICATION_MEMBER) {
      const authenticationTableInput: CreateTableInput = {
        TableName: DbTable.AUTHENTICATION_MEMBER,
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
      }
      await databaseClient.client.send(new CreateTableCommand(authenticationTableInput))
    }
    if (!request.query["database"] || request.query["database"] === DbTable.AVAILABILITY_SLOT) {
      const availabilityTableInput: CreateTableInput = {
        TableName: DbTable.AVAILABILITY_SLOT,
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
      }
      await databaseClient.client.send(new CreateTableCommand(availabilityTableInput))
    }
    if (!request.query["database"] || request.query["database"] === DbTable.ANALYTICS) {
      const analyticsTableInput: CreateTableInput = {
        TableName: DbTable.ANALYTICS,
        "AttributeDefinitions": [
          {
            "AttributeName": "sessionId",
            "AttributeType": "S"
          }
        ],
        "KeySchema": [
          {
            "AttributeName": "sessionId",
            "KeyType": "HASH"
          }
        ],
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 2,
          "WriteCapacityUnits": 2
        },
      }
      await databaseClient.client.send(new CreateTableCommand(analyticsTableInput))
    }
    return http200EmptyResponse
  }

  throw new BadRequestException()
}, {
  withAuthentication: false,
  noCacheForBrowsers: false
})

async function migrationFeaturePwaSubscriptions() {
  const authenticationMemberTable = EnvironmentHelper.getAuthenticationMemberTableName()
  const result = await databaseClient.find({
    TableName: authenticationMemberTable
  })
  const members = (result?.Items ?? [])
  for (const member of members) {
    if (member["pwaSubscriptions"]) {
      continue
    }
    await databaseClient.update({
      TableName: authenticationMemberTable,
      Key: {
        username: member["username"]
      },
      UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
      ExpressionAttributeValues: {
        ":pwaSubscriptions": []
      }
    })
  }
}
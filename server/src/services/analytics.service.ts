import {AnalyticsActionsForSession, mapDatabaseItemToAnalyticsActionsForSession,} from "@shared/types/analytics.types";
import databaseClient from "../clients/database.client";
import EnvironmentHelper from "../utils/environment.helper";
import type {NativeAttributeValue} from "@aws-sdk/util-dynamodb";

export default class AnalyticsService {
  static async list(from: Date, to?: Date): Promise<AnalyticsActionsForSession[]> {
    const filterExpressions: string[] = []
    const expressionAttributeValues: Record<string, NativeAttributeValue> = {}
    filterExpressions.push('sessionStartDate >= :fromDate')
    expressionAttributeValues[':fromDate'] = from.toISOString()
    if (to) {
      filterExpressions.push('sessionEndDate <= :toDate')
      expressionAttributeValues[':toDate'] = to.toISOString()
    }
    const results = await databaseClient.find({
      TableName: EnvironmentHelper.getAnalyticsTableName(),
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues: expressionAttributeValues
    })

    return (results?.Items ?? []).map(mapDatabaseItemToAnalyticsActionsForSession)
  }

  static async put(lastActionsForSession: AnalyticsActionsForSession): Promise<void> {
    if (!lastActionsForSession.actions.length) {
      return;
    }

    const results = await databaseClient.find({
      TableName: EnvironmentHelper.getAnalyticsTableName(),
      FilterExpression: "sessionId = :sessionId",
      ExpressionAttributeValues: {":sessionId": lastActionsForSession.sessionId},
      ConsistentRead: true
    })

    if (!results.Count) {
      await databaseClient.insert({
        TableName: EnvironmentHelper.getAnalyticsTableName(),
        Item: {
          userId: lastActionsForSession.userId,
          sessionId: lastActionsForSession.sessionId,
          sessionStartDate: lastActionsForSession.sessionStartDate,
          sessionEndDate: lastActionsForSession.sessionEndDate,
          actions: lastActionsForSession.actions
        }
      })
    } else if (results.Count === 1) {
      const currentActionsForSession = mapDatabaseItemToAnalyticsActionsForSession(results.Items!.at(0)!)
      currentActionsForSession.actions.push(...lastActionsForSession.actions)
      await databaseClient.update({
        TableName: EnvironmentHelper.getAnalyticsTableName(),
        Key: {
          sessionId: lastActionsForSession.sessionId,
        },
        UpdateExpression: "SET" +
          " sessionEndDate = :endDate," +
          " actions = :actions",
        ExpressionAttributeValues: {
          ":endDate": lastActionsForSession.sessionEndDate,
          ":actions": currentActionsForSession.actions
        }
      })
    }
  }
}
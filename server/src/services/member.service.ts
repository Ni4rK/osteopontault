import {isMember, Member, MemberPwaSubscription} from "@shared/types/member.interface";
import databaseClient from "../clients/database.client";
import EnvironmentHelper from "../utils/environment.helper";
import UnauthorizedException from "../exceptions/unauthorized.exception";

export default class MemberService {
  static async find(username: string): Promise<Member> {
    const results = await databaseClient.find({
      TableName: EnvironmentHelper.getAuthenticationMemberTableName(),
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {":username": username},
      ConsistentRead: true
    })
    if (!results.Count) {
      throw new UnauthorizedException();
    }
    if (results.Count !== 1) {
      throw new UnauthorizedException();
    }
    const member = results.Items![0]
    if (!isMember(member)) {
      throw new UnauthorizedException();
    }
    return member
  }

  static async addPwaSubscription(username: string, pwaSubscription: MemberPwaSubscription) {
    const member = await this.find(username)
    member.pwaSubscriptions.push(pwaSubscription)
    await databaseClient.update({
      TableName: EnvironmentHelper.getAuthenticationMemberTableName(),
      Key: {
        username: member.username
      },
      UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
      ExpressionAttributeValues: {
        ":pwaSubscriptions": member.pwaSubscriptions
      }
    })
  }
}
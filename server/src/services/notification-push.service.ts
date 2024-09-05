import {NotificationMessage} from "@shared/types/notification.type";
import {sendNotification, setVapidDetails, WebPushError} from "web-push";
import EnvironmentHelper from "../utils/environment.helper";
import {PWA_VAPID_PUBLIC_KEY_DEV, PWA_VAPID_PUBLIC_KEY_PROD} from "@shared/helpers/configuration";
import MemberService from "./member.service";
import {MemberPwaSubscription} from "@shared/types/member.interface";
import clientDatabase from "../database/client.database";

export default class NotificationPushService {
  static MAX_NOTIFICATION = 3

  static async notify(username: string, message: NotificationMessage) {
    const member = await MemberService.find(username)
    const mode = EnvironmentHelper.getMode()

    setVapidDetails(
      'https://osteopontault.fr',
      mode === 'prod' ? PWA_VAPID_PUBLIC_KEY_PROD : PWA_VAPID_PUBLIC_KEY_DEV,
      EnvironmentHelper.getVapidPrivateKey()
    );

    const pwaSubscriptionsToKeep: MemberPwaSubscription[] = []
    for (const subscription of member.pwaSubscriptions.slice(0, this.MAX_NOTIFICATION)) {
      try {
        await sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.authToken,
            p256dh: subscription.p256dh
          }
        }, JSON.stringify(message))
        pwaSubscriptionsToKeep.push(subscription)
      } catch (error) {
        console.error("WebPush Exception: ", error)
        if (!(error instanceof WebPushError) || error.statusCode !== 410) {
          pwaSubscriptionsToKeep.push(subscription)
        }
      }
    }

    if (pwaSubscriptionsToKeep.length !== member.pwaSubscriptions.length) {
      await clientDatabase.update({
        TableName: EnvironmentHelper.getAuthenticationMemberTableName(),
        Key: {
          username: member.username
        },
        UpdateExpression: "SET pwaSubscriptions = :pwaSubscriptions",
        ExpressionAttributeValues: {
          ":pwaSubscriptions": pwaSubscriptionsToKeep
        }
      })
    }
  }
}
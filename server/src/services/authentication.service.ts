import jwt from 'jsonwebtoken';
import {Role} from "@shared/types/role.enum";
import {isNumber, isObject} from "@shared/helpers/common-types.guards";
import databaseClient from "../database/client.database";
import UnauthorizedException from "../exceptions/unauthorized.exception";
import {Guest} from "@shared/types/guest.type";
import {Practitioner, isPractitioner} from "@shared/types/practitioner.enum";
import {AuthCredentials} from "@shared/types/auth-credentials.type";
import {isTokenPayloadGuest, isTokenPayloadPractitioner} from "@shared/types/auth-token-payload.type";
import {isMember} from "@shared/types/member.interface";
import DbTable from "@shared/types/db-table.enum";
import PasswordService from "./password.service";
import EnvironmentHelper from "../utils/environment.helper";
import BadRequestException from "../exceptions/bad-request.exception";
import MemberService from "./member.service";

export default class AuthenticationService {
  static async getToken(role: Role, credentials?: AuthCredentials): Promise<string> {
    if (role === Role.GUEST) {
      return jwt.sign(
        {role: Role.GUEST},
        EnvironmentHelper.getAuthKey(),
        {expiresIn: EnvironmentHelper.getAuthExpGuest()}
      );
    }

    // role === Role.PRACTITIONER
    const username = credentials!.username
    const password = credentials!.password
    if (!isPractitioner(username)) {
      throw new UnauthorizedException();
    }
    const member = await MemberService.find(username)
    if (!await PasswordService.verify(password, member.passwordHashed)) {
      throw new UnauthorizedException();
    }
    return jwt.sign(
      {role: Role.PRACTITIONER, practitioner: member.username},
      EnvironmentHelper.getAuthKey(),
      {expiresIn: EnvironmentHelper.getAuthExpPractitioner()}
    );
  }

  static authenticate(token: string): Practitioner | typeof Guest {
    try {
      const decodedPayload = jwt.verify(token, EnvironmentHelper.getAuthKey())
      if (isTokenPayloadGuest(decodedPayload)) {
        return Guest
      }
      if (isTokenPayloadPractitioner(decodedPayload)) {
        return decodedPayload.practitioner
      }
    } catch (error) {
      throw new UnauthorizedException()
    }
    throw new UnauthorizedException()
  }
}

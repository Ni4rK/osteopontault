import handlerWrapper from "./handler.wrapper";
import BadRequestException from "../exceptions/bad-request.exception";
import HttpRequest from "@shared/types/http-request.interface";
import {HttpResponse} from "@shared/types/http-response.type";
import HttpMethod from "@shared/types/http-method.enum";
import HttpPath from "@shared/types/http-path.enum";
import AvailabilityService from "../services/availability.service";
import {
  isAvailabilityBookHttpBody,
  isAvailabilityInsertHttpBody,
  isAvailabilityUpdateHttpBody
} from "@shared/types/http-body.types";
import {Slot, SlotPersisted} from "@shared/types/slot.interface";
import {http200EmptyResponse} from "@shared/helpers/common.http-responses";
import UnauthorizedException from "../exceptions/unauthorized.exception";
import {isPractitioner} from "@shared/types/practitioner.enum";
import {isString} from "@shared/helpers/common-types.guards";

export const availabilityHandler = handlerWrapper(async (request: HttpRequest): Promise<HttpResponse> => {
  const body = request.body

  if (!request.user) {
    throw new UnauthorizedException()
  }

  // LIST SLOTS
  if (request.path === HttpPath.AVAILABILITY_GET && request.method === HttpMethod.GET) {
    const from = request.query.from
    const to = request.query.to
    const fromDate = isString(from) ? new Date(from) : undefined
    const toDate = isString(to) ? new Date(to) : undefined
    return AvailabilityService.getAvailabilities(fromDate, toDate)
  }

  // BOOK SLOT
  if (request.path === HttpPath.AVAILABILITY_BOOK && request.method === HttpMethod.PATCH) {
    if (!isAvailabilityBookHttpBody(body)) {
      throw new BadRequestException()
    }
    return AvailabilityService.bookAvailabilitySlots(body.uid, body.patient)
  }

  // DELETE SLOT
  if (request.path === HttpPath.AVAILABILITY_DELETE && request.method === HttpMethod.DELETE) {
    if (!isPractitioner(request.user)) {
      throw new UnauthorizedException()
    }
    const uid = request.query.uid
    await AvailabilityService.removeAvailabilitySlots(isString(uid) ? [uid] : [])
    return http200EmptyResponse
  }

  // CREATE SLOTS
  if (request.path === HttpPath.AVAILABILITY_INSERT && request.method === HttpMethod.POST) {
    if (!isPractitioner(request.user)) {
      throw new UnauthorizedException()
    }
    if (!isAvailabilityInsertHttpBody(body)) {
      throw new BadRequestException()
    }
    const slots: Slot[] = body.map(slot => ({
      from: slot.from,
      to: slot.to,
      practitioner: slot.practitioner,
      hasPatient: slot.hasPatient,
      patient: slot.patient
    }))
    await AvailabilityService.insertAvailabilitySlots(slots)
    return http200EmptyResponse
  }

  // EDIT SLOT
  if (request.path === HttpPath.AVAILABILITY_UPDATE && request.method === HttpMethod.PATCH) {
    if (!isPractitioner(request.user)) {
      throw new UnauthorizedException()
    }
    if (!isAvailabilityUpdateHttpBody(body)) {
      throw new BadRequestException()
    }
    const slots: SlotPersisted[] = body.slots.map(slot => ({
      uid: slot.uid,
      from: new Date(slot.from).toISOString(),
      to: new Date(slot.to).toISOString(),
      practitioner: slot.practitioner,
      hasPatient: slot.hasPatient,
      patient: slot.patient
    }))
    await AvailabilityService.updateAvailabilitySlots(slots, body.sendNotification, request.user)
    return http200EmptyResponse
  }

  throw new BadRequestException()
}, {
  withAuthentication: true,
  noCacheForBrowsers: true
})
import {Practitioner} from "@shared/types/practitioner.enum";
import {createPatientForm, type PatientForm} from "./patient.form";

export type SlotForm = {
  from: Date
  to: Date
  practitioner: Practitioner
  bookedAt: Date | null | undefined
  hasPatient: boolean
  patient: PatientForm | null | undefined
}

export const createSlotForm = (): SlotForm => ({
  from: new Date(),
  to: new Date(),
  practitioner: Practitioner.ROSE,
  bookedAt: undefined,
  hasPatient: false,
  patient: createPatientForm(),
})

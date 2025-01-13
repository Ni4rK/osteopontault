import {PatientType} from "@shared/types/patient.interface";

export type PatientForm = {
  firstname: string | null | undefined
  lastname: string | null | undefined
  phone: string | null | undefined
  type: PatientType
}

export const createPatientForm = (): PatientForm => ({
  firstname: '',
  lastname: '',
  phone: '',
  type: PatientType.ADULT
})

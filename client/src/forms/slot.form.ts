import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Practitioner} from "@shared/types/practitioner.enum";
import {createPatientForm} from "./patient.form";

export const createSlotForm = () => new FormGroup({
  from: new FormControl<Date>(new Date(), Validators.required),
  to: new FormControl<Date>(new Date(), Validators.required),
  practitioner: new FormControl<Practitioner>(Practitioner.ROSE, Validators.required),
  bookedAt: new FormControl<Date|undefined>(undefined, Validators.required),
  hasPatient: new FormControl<boolean>(false, Validators.required),
  patient: createPatientForm(),
})

export type SlotForm = ReturnType<typeof createSlotForm>

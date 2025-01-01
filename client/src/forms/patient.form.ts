import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PatientType} from "@shared/types/patient.interface";

export const createPatientForm = () => new FormGroup({
  firstname: new FormControl<string>('', Validators.required),
  lastname: new FormControl<string>('', Validators.required),
  phone: new FormControl<string>('', Validators.required),
  type: new FormControl<PatientType>(PatientType.ADULT, Validators.required)
})

export type PatientForm = ReturnType<typeof createPatientForm>

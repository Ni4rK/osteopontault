import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {PatientType} from "@shared/types/patient.interface";

export const isValidPhone = (phone: string): boolean => {
  return (
    phone.startsWith('0') &&
    /^[0-9]{10}$/.test(phone)
  )
}

export const createPatientForm = () => new FormGroup({
  firstname: new FormControl<string>('', Validators.required),
  lastname: new FormControl<string>('', Validators.required),
  phone: new FormControl<string>('', (control: AbstractControl) => {
    const value: string = control.value
    if (!isValidPhone(value)) {
      return {
        required: true
      }
    }
    return null
  }),
  type: new FormControl<PatientType>(PatientType.ADULT, Validators.required)
})

export type PatientForm = ReturnType<typeof createPatientForm>

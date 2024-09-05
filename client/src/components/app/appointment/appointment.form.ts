import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {isString} from "@shared/helpers/common-types.guards";
import {PatientType} from "@shared/types/patient.interface";

export const createAppointmentForm = () => new FormGroup({
  firstname: new FormControl<string>('', Validators.required),
  lastname: new FormControl<string>('', Validators.required),
  phone: new FormControl<string>('0', (control: AbstractControl) => {
    const value: string = control.value
    if (!isString(value)) {
      return {
        phone: 'Le téléphone est nécessaire pour le praticien'
      }
    }
    if (value.length !== 10) {
      return {
        phone: 'Le téléphone doit contenir 10 chiffres'
      }
    }
    if (!value.startsWith('0')) {
      return {
        phone: 'Le téléphone doit commencer par 0'
      }
    }
    return null
  }),
  type: new FormControl<PatientType>(PatientType.ADULT, Validators.required)
})

export type AppointmentForm = ReturnType<typeof createAppointmentForm>

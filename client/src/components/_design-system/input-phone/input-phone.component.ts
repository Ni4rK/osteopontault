import {AfterContentInit, ChangeDetectorRef, Component, DoCheck, Input, OnInit, ViewChild} from '@angular/core';
import {HexagonComponent} from "../hexagon/hexagon.component";
import {NgClass, NgIf} from "@angular/common";
import {ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {InputMask, InputMaskModule} from "primeng/inputmask";
import {isValidPhone} from "../../../forms/patient.form";

@Component({
  selector: 'op-input-phone',
  standalone: true,
  imports: [
    HexagonComponent,
    NgIf,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    InputMaskModule,
    NgClass
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputPhoneComponent,
      multi: true,
    },
  ],
  templateUrl: './input-phone.component.html',
  styleUrl: './input-phone.component.scss'
})
export class InputPhoneComponent implements ControlValueAccessor {
  phone = ""
  valid = true
  disabled = false;

  onChange = (p: string) => {};
  onTouched = () => {};

  @ViewChild('inputMaskComponent') set inputMaskComponent(mask: InputMask) {
    mask.inputViewChild!.nativeElement.inputMode = 'numeric'
  }

  writeValue(phone: string) {
    this.phone = phone
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled
  }

  onFocus() {
    const sanitizedPhone = this.sanitizePhone()
    this.valid = isValidPhone(sanitizedPhone)
    this.onTouched()
  }

  onPhoneCompleted() {
    const sanitizedPhone = this.phone.replaceAll(/[ •]/g, '')
    this.valid = isValidPhone(sanitizedPhone)
    this.onChange(sanitizedPhone)
  }

  onPhoneChanged() {
    const sanitizedPhone = this.sanitizePhone()
    this.valid = isValidPhone(sanitizedPhone)
  }

  sanitizePhone(): string {
    return this.phone.replaceAll(/[ •]/g, '')
  }
}

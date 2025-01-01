import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {HexagonComponent} from "../hexagon/hexagon.component";
import {NgClass, NgIf} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {InputMaskModule} from "primeng/inputmask";
import PhoneHelper from "@shared/helpers/phone.helper";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'op-input-phone',
  standalone: true,
  imports: [
    HexagonComponent,
    NgIf,
    InputTextModule,
    NgClass,
    InputMaskModule,
    FormsModule
  ],
  templateUrl: './input-phone.component.html',
  styleUrl: './input-phone.component.scss'
})
export class InputPhoneComponent implements OnChanges {
  @Input() initialValue?: string
  @Output() update: EventEmitter<string> = new EventEmitter<string>()
  phone = ""
  valid = true

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialValue?.length) {
      this.phone = PhoneHelper.toReadableNumber(this.initialValue)
    }
  }

  onChange() {
    const sanitizedNumber = PhoneHelper.sanitizeNumber(this.phone)
    this.phone = PhoneHelper.toReadableNumber(sanitizedNumber)
    this.valid = PhoneHelper.isValidNumber(sanitizedNumber)
    this.update.emit(sanitizedNumber)
  }
}

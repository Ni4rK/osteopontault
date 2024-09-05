import {Component, Input} from '@angular/core';
import {Practitioner} from "@shared/types/practitioner.enum";
import {HexagonComponent} from "../hexagon/hexagon.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'op-practitioner-icon',
  standalone: true,
  imports: [
    HexagonComponent,
    NgIf
  ],
  templateUrl: './practitioner-icon.component.html',
  styleUrl: './practitioner-icon.component.scss'
})
export class PractitionerIconComponent {
  @Input({ required: true }) practitioner!: Practitioner
  @Input() width = 20

  protected readonly Practitioner = Practitioner;

  get image(): string {
    switch (this.practitioner) {
      case Practitioner.ANAIS:
        return "images/anais.jpg"
      default:
        return "images/rose.jpg"
    }
  }
}

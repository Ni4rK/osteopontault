import {Component, EventEmitter, HostListener, Output} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {ROSE_PHONE} from "../../../utils/constants";

@Component({
  selector: 'op-infos',
  standalone: true,
  imports: [
    DialogModule,
    Button
  ],
  templateUrl: './infos.component.html',
  styleUrl: './infos.component.scss'
})
export class InfosComponent {
  @Output() closeIt = new EventEmitter<void>()
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.closeIt.emit()
  }

  protected readonly ROSE_PHONE = ROSE_PHONE

  get phone(): string {
    return `tel://+33${ROSE_PHONE.slice(1)}`
  }
}

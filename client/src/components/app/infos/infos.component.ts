import {Component, EventEmitter, HostListener, Output} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";

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
  @Output() closeIt = new EventEmitter<void>();
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.closeIt.emit()
  }
}

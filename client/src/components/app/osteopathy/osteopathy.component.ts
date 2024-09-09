import {Component, EventEmitter, HostListener, Output} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {TabViewModule} from "primeng/tabview";

@Component({
  selector: 'op-osteopathy',
  standalone: true,
  imports: [
    Button,
    DialogModule,
    TabViewModule
  ],
  templateUrl: './osteopathy.component.html',
  styleUrl: './osteopathy.component.scss'
})
export class OsteopathyComponent {
  @Output() closeIt = new EventEmitter<void>();
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.closeIt.emit()
  }
}

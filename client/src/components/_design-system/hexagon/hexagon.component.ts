import {Component, Input, OnInit} from '@angular/core';
import {NgIf, NgStyle} from "@angular/common";

@Component({
  selector: 'op-hexagon',
  standalone: true,
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './hexagon.component.html',
  styleUrl: './hexagon.component.scss'
})
export class HexagonComponent implements OnInit {
  static lastId = 0

  @Input() width = 200
  @Input() image?: string
  @Input() color?: string
  @Input() raised = false

  id: number

  constructor() {
    this.id = ++HexagonComponent.lastId
  }

  get height(): number {
    return this.width * 1.1547
  }

  get borderRadius(): number {
    return this.width * 0.05
  }

  get hexagonId(): string {
    return `hexagon-${this.id}`
  }

  get filterId(): string {
    return `hexagon-filter-${this.id}`
  }

  ngOnInit() {
    const hexagonStyle = document.head.appendChild(document.createElement("style"))
    if (this.image) {
      hexagonStyle.innerHTML = `#${this.hexagonId}::before {background-image: url(${this.image})}`
    } else if (this.color) {
      hexagonStyle.innerHTML = `#${this.hexagonId}::before {background-color: ${this.color}`
    }
  }
}

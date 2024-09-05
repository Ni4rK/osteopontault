import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'op-main',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  ngOnInit() {
    window.addEventListener("resize", () => {
      console.log(`window resized: innerHeight=${window.innerHeight}, outerHeight=${window.outerHeight}`)
    })
    const resizeObserver = new ResizeObserver(entries =>
      console.log(`body resized: clientHeight=${entries[0].target.clientHeight}`)
    )
    resizeObserver.observe(document.body)
  }
}

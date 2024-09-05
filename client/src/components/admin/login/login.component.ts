import {Component, EventEmitter, Output} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {catchError, take, throwError} from "rxjs";
import {Role} from "@shared/types/role.enum";
import AuthenticationService from "../../../services/authentication.service";
import ToasterService from "../../../services/toaster.service";

@Component({
  selector: 'op-login',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    InputTextModule,
    FormsModule,
    InputTextModule,
    Button
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Output() loggedIn = new EventEmitter<void>()

  username: string | null = null
  password: string | null = null
  isAuthenticatingAsPractitioner = false

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly toastService: ToasterService
  ) {
  }

  onLogin() {
    if (this.username && this.password) {
      this.isAuthenticatingAsPractitioner = true
      this.authenticationService.authenticate(Role.PRACTITIONER, {
        username: this.username,
        password: this.password
      }).pipe(
        take(1),
        catchError((error) => {
          this.isAuthenticatingAsPractitioner = false
          return throwError(error)
        })
      ).subscribe(() => {
        this.toastService.sendToast({
          severity: "success",
          summary: `Connecté en tant que ${this.username}`
        })
        this.isAuthenticatingAsPractitioner = false
        this.loggedIn.emit()
      })
    }
  }
}

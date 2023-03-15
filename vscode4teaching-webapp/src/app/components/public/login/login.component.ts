import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, LoginCredentials } from "../../../services/rest-api/auth.service";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { CurrentUserService } from "../../../services/auth/current-user/current-user.service";


// TODO ENCAPSULAR DE ALGUNA OTRA FORMA
function usernameRequiredPattern(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!/^(?:(?!(template)|(solution)|(student)).)+$/.test(control.value)) {
            return { usernameRequiredPattern: { value: control.value } };
        }
        return null;
    }
}

enum LoginFormSubmissionStatus {
    NOT_SUBMITTED,
    SUBMITTED,
    RESPONSE_SUCCESSFUL,
    RESPONSE_ERROR
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    public LoginFormSubmissionStatus = LoginFormSubmissionStatus;

    public loginForm: FormGroup = this.fb.group({
        username: ['', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(50),
            usernameRequiredPattern
        ]],
        password: ['', [
            Validators.required,
            Validators.minLength(8)
        ]]
    });

    public loginFormSubmissionStatus: LoginFormSubmissionStatus;

    constructor(private authService: AuthService, private currentUserService: CurrentUserService, private fb: FormBuilder, private router: Router) {
        this.loginFormSubmissionStatus = LoginFormSubmissionStatus.NOT_SUBMITTED;
    }

    ngOnInit(): void {
        this.currentUserService.currentUser
            .then(currentUser => { if (currentUser !== undefined) this.router.navigate(["/dashboard"]) });
    }

    get formValue(): LoginCredentials {
        return this.loginForm.getRawValue() as LoginCredentials;
    }

    async submitLoginForm(event: SubmitEvent) {
        event.preventDefault();

        if (this.loginForm.valid) {
            this.loginFormSubmissionStatus = LoginFormSubmissionStatus.SUBMITTED;
            this.authService.login(this.formValue)
                .then(() => this.router.navigate(["/dashboard"]))
                .catch(() => this.loginFormSubmissionStatus = LoginFormSubmissionStatus.RESPONSE_ERROR);
        }
    }
}

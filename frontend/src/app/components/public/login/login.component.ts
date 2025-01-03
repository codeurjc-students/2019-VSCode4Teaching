import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CurrentUserService } from "@app-services/auth/current-user/current-user.service";
import { AuthService, LoginCredentials } from "@app-services/rest-api/auth/auth.service";


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
    imports: [
        ReactiveFormsModule
    ],
    styleUrls: ['./login.component.scss']
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

    get formValue(): LoginCredentials {
        return this.loginForm.getRawValue() as LoginCredentials;
    }

    ngOnInit(): void {
        this.currentUserService.currentUser
            .then(currentUser => {
                if (currentUser !== undefined) this.router.navigate(["/dashboard"])
            });
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

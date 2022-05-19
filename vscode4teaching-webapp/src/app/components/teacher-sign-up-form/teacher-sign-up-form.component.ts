import { Component } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { User } from "src/app/model/user.model";
import { AuthTokenService } from "src/app/services/auth/auth-token.service";
import { CommonService } from "src/app/services/common.service";
import { TeacherSignUpService } from "src/app/services/teacher-sign-up.service";

@Component({
    selector: "app-teacher-sign-up-form",
    templateUrl: "./teacher-sign-up-form.component.html",
    styleUrls: ["./teacher-sign-up-form.component.css"],
})
export class TeacherSignUpFormComponent {
    /*
     * VARIABLES
     */
    tempPassword: string = ""; // Password (URL path variable)
    requestSent: boolean = false; // True only if a request has been sent and response has not been received
    step: number = 1; // Process' current step (may be 1, 2 or 3)
    private user: User = {}; // User's information (filled after step 1 was successfully completed)
    public error: string | undefined = undefined; // Error information

    /*
     * CONSTRUCTOR
     */
    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private common: CommonService, // It includes XSRF and login requests
        private teacherSignUpService: TeacherSignUpService, // Includes the password change request
        private auth: AuthTokenService // It saves login credentials
    ) {
        // Temporary password is saved from URL's path variable
        this.tempPassword = route.snapshot.params["tempPassword"];
    }

    /*
     * FORMS (FormGroup created using FormBuilder)
     */
    // Step 1 form -> asks for username
    stepOneForm = this.fb.group({
        username: [
            "",
            [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(50),
                Validators.pattern("^(?:(?!template).)+$"),
            ],
        ],
    });

    // Step 2 form -> asks for a new password (two times)
    stepTwoForm = this.fb.group(
        {
            password: ["", [Validators.required, Validators.minLength(8)]],
            confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
        },
        {
            // Custom validator -> checks if both fields' values are the same
            validators: (control: AbstractControl): ValidationErrors | null => {
                const password = control.get("password");
                const confirmPassword = control.get("confirmPassword");

                const error = password && confirmPassword && password.value !== confirmPassword.value ? { passwordConfirmed: true } : control.get("confirmPassword")?.getError("required");
                control.get("confirmPassword")?.setErrors(error);
                return error;
            },
        }
    );

    /*
     * COMPONENT'S LOGIC
     */
    // Executed when step 1 is submitted
    submitUsername() {
        // GUI form's validation
        this.stepOneForm.markAllAsTouched();
        // Login is performed catching username from input and password from path variable
        if (this.stepOneForm.valid) {
            const username = this.stepOneForm.get("username")?.value;
            const password = this.tempPassword;
            // Requests are starting to be sent
            this.requestSent = true;
            this.common.getXSRFToken().subscribe({
                next: (_) => {
                    this.common.login({ username, password }).subscribe({
                        next: (resLogin) => {
                            this.auth.jwtToken = resLogin.jwtToken;
                            // Email validation
                            this.common.getCurrentUserInfo().subscribe({
                                next: (usuario) => {
                                    if (usuario === undefined) {
                                        // User's info was not found (but login was successful)
                                        this.error = "There happened a problem while trying to check your user information. Please try again later.";
                                    } else {
                                        // User was properly found and information has been saved => Step 2
                                        this.error = undefined;
                                        this.user = usuario;
                                        this.step = 2;
                                        this.requestSent = false;
                                    }
                                },
                                // Server's response to current user info's request was not successful
                                error: (_) => (this.error = "Unexpected error. Please try again later."),
                            });
                        },
                        // Login was not successful (username is wrong)
                        error: (_) => (this.error = "The username you entered is not registered. Please try again."),
                    });
                },
                // XSRF Token could not be saved (server is unavailable)
                error: (_) => (this.error = "Unexpected error (server is not available). Please try again later."),
            });
        }
    }

    // Executed when step 2 is submitted
    submitNewPassword() {
        // GUI form's validation
        this.stepTwoForm.markAllAsTouched();
        // Requests are starting to be sent
        this.requestSent = true;
        // Password is changed
        this.teacherSignUpService.changePassword(this.user.id ?? 0, this.stepTwoForm.get("password")?.value).subscribe({
            next: (_) => (this.step = 3),
            error: (_) => (this.error = "Unexpected error while saving your password. Please try again."),
        });
    }

    // True if a input is valid, false otherwise (used in template)
    getValidationStatusOfField(formGroup: FormGroup, fieldName: string, error?: string): boolean {
        return error
            ? !!(formGroup.get(fieldName)?.touched && formGroup.get(fieldName)?.hasError(error))
            : !!(formGroup.get(fieldName)?.touched && formGroup.get(fieldName)?.errors);
    }
}

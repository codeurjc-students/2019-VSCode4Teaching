import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DialogComponent } from "@app-components/helpers/dialog/dialog.component";
import { FormInputComponent } from "@app-components/helpers/form-input/form-input.component";
import { UserService } from "@app-services/rest-api/model-entities/user/user.service";

@Component({
    selector: 'app-signup',
    imports: [
        ReactiveFormsModule,
        FormInputComponent,
        DialogComponent
    ],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent {
    public signupForm: FormGroup = this.fb.group({
        name: ['', [
            Validators.required
        ]],
        surname: ['', [
            Validators.required
        ]],
        username: ['', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(50),
            Validators.pattern(/^(?!template$|solution$|student$)[a-zA-Z0-9_]*$/)
        ]],
        email: ['', [
            Validators.required,
            Validators.email
        ]],
        password: ['', [
            Validators.required,
            Validators.minLength(8)
        ]],
        passwordConfirmation: ['', [
            Validators.required,
            Validators.minLength(8),
            (control: FormControl) => control.value === this.signupForm?.get("password")?.value ? null : { confirmPassword: true }
        ]]
    });

    public isLoading: boolean = false;
    @ViewChild("dialog") private dialog!: DialogComponent;

    constructor(private fb: FormBuilder,
                private router: Router,
                private userService: UserService) {
    }

    public async signUp(): Promise<void> {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
        } else {
            this.isLoading = true;
            try {
                await this.userService.signUp({
                    name: this.signupForm.get("name")?.value,
                    lastName: this.signupForm.get("surname")?.value,
                    username: this.signupForm.get("username")?.value,
                    email: this.signupForm.get("email")?.value,
                    password: this.signupForm.get("password")?.value
                });
                this.dialog.open({
                    title: "Success",
                    message: "You have successfully signed up. You can now log in.",
                    icon: { class: "color-finished", icon: "fa-circle-check" },
                    buttons: [{
                        class: "btn btn-sm btn-outline-v4t",
                        icon: "fa-square-up-right",
                        text: "Go to login",
                        callback: async () => {
                            this.dialog.close();
                            await this.router.navigate(["/login"]);
                        }
                    }]
                })
            } catch (error: any) {
                this.dialog.open({
                    title: "Error",
                    message: `An error occurred while trying to sign up: ${error.error.message}. Please try again.`,
                    buttons: [{
                        class: "btn btn-sm btn-outline-v4t",
                        icon: "fa-check",
                        text: "Accept",
                        callback: () => this.dialog.close()
                    }]
                });
            } finally {
                this.isLoading = false;
            }
        }
    }
}

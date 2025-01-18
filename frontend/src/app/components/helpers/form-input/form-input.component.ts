import { CommonModule } from "@angular/common";
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { DefaultValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-helper-form-input',
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FormInputComponent),
        multi: true
    }],
    templateUrl: './form-input.component.html'
})
export class FormInputComponent extends DefaultValueAccessor implements OnInit {
    @Input("formControl") public formControl!: FormControl;
    @Input("validationMessages") public validationMessages!: { [key: string]: string };
    @Input("name") public name!: string;
    @Input({ alias: "id", required: false }) public id!: string;
    @Input({ alias: "type", required: false }) public type!: string;

    ngOnInit() {
        this.id = this.id || this.name.toLowerCase().replaceAll(" ", "-");
        this.type = this.type || "text";
    }

    public get validationMessage(): string {
        if (this.formControl.errors) {
            const errorKey = Object.keys(this.formControl.errors)[0];
            return this.validationMessages[errorKey];
        }
        return "";
    }
}

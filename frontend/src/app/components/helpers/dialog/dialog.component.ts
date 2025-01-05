import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal } from "bootstrap";

@Component({
    selector: 'app-helper-dialog',
    imports: [],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
    public title: string = "";
    public message: string = "";
    public buttons: { class: string, icon: string, text: string, callback: () => void }[] = [];
    public parentModal: Modal | undefined;

    @ViewChild("modalElement") private modalElement!: ElementRef;
    private modalHandler: Modal | undefined;


    public open(settings: {
        title: string,
        message: string,
        buttons: { class: string, icon: string, text: string, callback: () => void }[],
        parentModal?: Modal
    }): void {
        this.title = settings.title;
        this.message = settings.message;
        this.buttons = settings.buttons;
        this.parentModal = settings.parentModal;

        this.parentModal?.hide();
        this.modalHandler = new Modal(this.modalElement?.nativeElement, { backdrop: "static", keyboard: false });
        this.modalHandler.show();
    }

    public close(): void {
        this.modalHandler?.hide();
        this.parentModal?.show();
    }
}

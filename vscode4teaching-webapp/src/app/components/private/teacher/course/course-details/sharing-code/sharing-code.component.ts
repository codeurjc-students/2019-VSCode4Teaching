import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Modal } from "bootstrap";
import { Course } from "../../../../../../model/course.model";
import { CourseService } from "../../../../../../services/rest-api/model-entities/course/course.service";
import { UrlService } from "../../../../../../services/url/url.service";

type SharingCode = { value?: string, copied: boolean };

@Component({
  selector: 'app-teacher-course-details-sharing-code',
  templateUrl: './sharing-code.component.html',
  styleUrls: ['./sharing-code.component.scss']
})
export class SharingCodeComponent implements AfterViewInit {
    @Input("course") course?: Course;

    public sharingCode: SharingCode;
    public sharingUrl: SharingCode;

    private sharingCodeModal!: Modal;
    @ViewChild("sharingCodeModal") private sharingCodeModalElementRef!: ElementRef;

    constructor(private courseService: CourseService, private urlService: UrlService) {
        this.sharingCode = { value: undefined, copied: false };
        this.sharingUrl = { value: undefined, copied: false };
    }

    ngAfterViewInit(): void {
        this.sharingCodeModal = new Modal(this.sharingCodeModalElementRef.nativeElement);
    }

    public async getSharingCode(): Promise<void> {
        if (this.course) {
            this.courseService.getSharingCodeByCourse(this.course)
                .then(sharingCode => {
                    this.sharingCode.value = sharingCode
                    this.sharingUrl.value = encodeURI(this.urlService.webBaseURL + "/?code=" + this.sharingCode.value);
                });
            this.sharingCodeModal.show();
        }
    }

    public async copySharingCode(sharingCode: SharingCode): Promise<void> {
        if (sharingCode.value) {
            await navigator.clipboard.writeText(sharingCode.value);
            sharingCode.copied = true;
            setTimeout(() => sharingCode.copied = false, 2000);
        }
    }
}

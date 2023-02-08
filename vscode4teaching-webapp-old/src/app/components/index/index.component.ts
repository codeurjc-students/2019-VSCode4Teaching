import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Course } from "src/app/model/course.model";
import { CoursesService } from "src/app/services/courses.service";

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.css"],
})
export class IndexComponent implements OnInit {
    /*
     * VARIABLES
     */
    code: string | undefined = undefined; // Invitation code (caught from URL)
    course: Course | undefined = undefined; // Course associated to introduced code (if code is given and course is found)
    loading: boolean = true; // True if waiting for server's response, false otherwise
    error: boolean = false;
    @ViewChild("codeCopyBtn") button!: ElementRef;
    @ViewChild("codeCopyInput") input!: ElementRef;

    constructor(private route: ActivatedRoute, private coursesService: CoursesService) {
        this.button;
    }

    ngOnInit(): void {
        if (this.route.snapshot.queryParamMap.has("code")) {
            this.code = this.route.snapshot.queryParamMap.get("code") ?? "";
            this.coursesService.getCourseByCode(this.code).subscribe({
                next: (course) => {
                    this.course = course;
                    this.loading = false;
                },
                error: (_) => (this.error = true),
            });
        } else {
            this.loading = false;
        }
    }

    // copyValue()
    // Focuses into given input, selects its value and copies it to OS clipboard.
    copyCode = () => {
        this.input.nativeElement.focus();
        this.input.nativeElement.setSelectionRange(0, this.input.nativeElement.value.length);
        if (!navigator.clipboard) {
            document.execCommand("copy");
        } else {
            navigator.clipboard.writeText(this.input.nativeElement.value).then(() => {
                this.button.nativeElement.innerHTML = "Copied!";
            });
        }
    };

    // restoreStatus()
    // Returns the Copy button and input to its "disabled" state.
    restoreStatus = () => {
        this.input.nativeElement.blur();
        this.input.nativeElement.innerHTML = "Copy";
    };
}

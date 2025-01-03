import { NgOptimizedImage } from "@angular/common";
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { Course } from "@app-model/course.model";
import { CourseService } from "@app-services/rest-api/model-entities/course/course.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    imports: [
        NgOptimizedImage
    ],
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

    public course?: Course | null;
    public sharingCode?: string;
    public sharingCodeCopied: boolean;

    public paramsSubscription!: Subscription;

    constructor(private courseService: CourseService,
                private activatedRoute: ActivatedRoute,
    ) {
        this.sharingCodeCopied = false;
    }


    public ngOnInit() {
        this.paramsSubscription = this.activatedRoute.queryParams.subscribe(async (params: Params) => {
            this.sharingCode = params['code'];
            if (this.sharingCode) {
                try {
                    this.course = await this.courseService.getCourseBySharingCode(this.sharingCode);
                } catch (e) {
                    this.course = null;
                }
            } else {
                this.course = undefined;
            }
        });
    }

    public async copySharingCode(): Promise<void> {
        if (this.sharingCode) {
            await navigator.clipboard.writeText(this.sharingCode);
            this.sharingCodeCopied = true;
            setTimeout(() => this.sharingCodeCopied = false, 1500);
        }
    }

    public ngOnDestroy(): void {
        this.paramsSubscription.unsubscribe();
    }
}

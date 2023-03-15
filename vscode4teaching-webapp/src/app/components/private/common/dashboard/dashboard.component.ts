import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from "../../../../services/auth/current-user/current-user.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    constructor (private curUserService: CurrentUserService) { }

    async ngOnInit() {
        await this.curUserService.currentUser;
    }
}

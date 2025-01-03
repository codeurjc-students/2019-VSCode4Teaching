import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { UserDTO } from "@app-model/rest-api/user.dto";
import { User } from "@app-model/user.model";
import { lastValueFrom, map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) {
    }

    public getAllUsers = (): Promise<User[]> => {
        return lastValueFrom(this.http.get<UserDTO[]>("/users")
            .pipe(map((userDTOList: UserDTO[]) => userDTOList?.map((userDTO: UserDTO) => new User(userDTO)) ?? [])));
    }
}

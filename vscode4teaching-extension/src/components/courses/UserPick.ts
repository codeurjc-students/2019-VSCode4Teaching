import { QuickPickItem } from "vscode";
import { User } from "../../model/serverModel/user/User";

export class UserPick implements QuickPickItem {
    constructor(
        readonly label: string,
        readonly user: User,
    ) { }
}

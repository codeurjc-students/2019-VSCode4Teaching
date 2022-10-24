import { QuickPickItem } from "vscode";
import { User } from "../../model/serverModel/user/User";

/**
 * Extended version of vscode.QuickPickItem with user info
 */
export class UserPick implements QuickPickItem {
    constructor(
        readonly label: string,
        readonly user: User,
    ) {
    }
}

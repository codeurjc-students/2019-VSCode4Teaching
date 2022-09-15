/**
 * Validators for input boxes.
 */
export class Validators {

    // Validators can only have 1 argument so this is needed to be set for the validateEqualPasswords function
    public static valueToCompare: string;

    public static validateUrl(value: string): string | undefined {
        const empty = Validators.validateNotEmpty(value, "Please enter the URL of the server that you want to connect to");
        if (empty) {
            return empty;
        }
        // Regular expresion for urls
        const regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        const pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return "Invalid URL";
        }
    }

    public static validateEmail(value: string): string | undefined {
        const empty = Validators.validateNotEmpty(value, "Please enter your email");
        if (empty) {
            return empty;
        }
        // Regular expresion for emails
        const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return "Invalid email";
        }
    }

    public static validateUsername(value: string): string | undefined {
        const empty = Validators.validateNotEmpty(value, "Please enter your username");
        if (empty) {
            return empty;
        }
        if (value.length < 4 || value.length > 50) {
            return "Username must have between 4 and 50 characters";
        }
        const regexp = /^(?:(?!(template)|(solution)|(student)).)+$/;
        const pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return `Username is not valid (cannot contain the words "template", "solution" or "student")`;
        }
    }

    public static validatePasswordSignup(value: string): string | undefined {
        if (value.length < 8) {
            return "Password is too short";
        }
    }

    public static validatePasswordLogin(value: string): string | undefined {
        return Validators.validateNotEmpty(value, "Please enter your password");
    }

    public static validateName(value: string): string | undefined {
        return Validators.validateNotEmpty(value, "Please enter your name");
    }

    public static validateLastName(value: string): string | undefined {
        return Validators.validateNotEmpty(value, "Please enter your last name");
    }

    private static validateStringWithLength(value: string, minLength: number, maxLength: number): string | undefined {
        const empty = Validators.validateNotEmpty(value, "Please enter a name");
        if (empty) {
            return empty;
        }
        if (value.length < minLength || value.length > maxLength) {
            return "Name must contain between " + minLength + " and " + maxLength + " characters";
        }
    }

    public static validateCourseName(value: string): string | undefined {
        return Validators.validateStringWithLength(value, 10, 100);
    }

    public static validateExerciseName(value: string): string | undefined {
        return Validators.validateStringWithLength(value, 3, 100);
    }

    public static validateSharingCode(value: string): string | undefined {
        return Validators.validateNotEmpty(value, "Please introduce the sharing code");
    }

    public static validateEqualPassword(value: string): string | undefined {
        if (value !== Validators.valueToCompare) {
            return "Passwords don't match";
        }
    }

    private static validateNotEmpty(value: string, errorMessage: string): string | undefined {
        if (value.length <= 0) {
            return errorMessage;
        }
    }
}

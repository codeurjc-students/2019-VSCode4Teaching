export class Validators {

    private constructor() { }

    static validateUrl (value: string): string | undefined {
        let empty = Validators.validateNotEmpty(value, 'Please enter the URL of the server that you want to connect to');
        if (empty) {
            return empty;
        }
        // Regular expresion for urls
        let regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
        let pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return 'Invalid URL';
        }
    }

    static validateEmail (value: string): string | undefined {
        let empty = Validators.validateNotEmpty(value, 'Please enter your email');
        if (empty) {
            return empty;
        }
        // Regular expresion for emails
        let regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return 'Invalid email';
        }
    }

    static validateUsername (value: string): string | undefined {
        if (value.length < 4 || value.length > 50) {
            return 'Username must have between 4 and 50 characters';
        }
        let regexp = /^(?:(?!template).)+$/;
        let pattern = new RegExp(regexp);
        if (!pattern.test(value)) {
            return 'Username is not valid';
        }
    }

    static validatePasswordSignup (value: string): string | undefined {
        if (value.length < 8) {
            return 'Password is too short';
        }
    }

    static validatePasswordLogin (value: string): string | undefined {
        return Validators.validateNotEmpty(value, 'Please enter your password');
    }

    static validateNotEmpty (value: string, errorMessage: string): string | undefined {
        if (value.length <= 0) {
            return errorMessage;
        }
    }

    static validateName (value: string): string | undefined {
        return Validators.validateNotEmpty(value, 'Please enter your name');
    }

    static validateLastName (value: string): string | undefined {
        return Validators.validateNotEmpty(value, 'Please enter your last name');
    }

    static validateCourseName (value: string): string | undefined {
        if (value.length < 10 || value.length > 100) {
            return "Course name must be between 10 and 100 characters";
        }
    }

    static validateExerciseName (value: string): string | undefined {
        return Validators.validateCourseName(value); // Same conditions as a course name
    }

    static validateSharingCode (value: string): string | undefined {
        return Validators.validateNotEmpty(value, 'Please introduce the sharing code');
    }
}
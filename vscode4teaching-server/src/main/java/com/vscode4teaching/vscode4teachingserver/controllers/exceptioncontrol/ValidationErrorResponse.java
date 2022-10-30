package com.vscode4teaching.vscode4teachingserver.controllers.exceptioncontrol;

import java.util.List;

public class ValidationErrorResponse {
    private List<ErrorDetail> errors;

    public ValidationErrorResponse(List<ErrorDetail> errors) {
        this.errors = errors;
    }

    public ValidationErrorResponse() {
    }

    public List<ErrorDetail> getErrors() {
        return errors;
    }

    public void setErrors(List<ErrorDetail> errors) {
        this.errors = errors;
    }

    public static class ErrorDetail {
        private String fieldName;
        private String message;

        public ErrorDetail(String fieldName, String message) {
            this.fieldName = fieldName;
            this.message = message;
        }

        public String getFieldName() {
            return fieldName;
        }

        public void setFieldName(String fieldName) {
            this.fieldName = fieldName;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

}
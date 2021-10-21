package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

import com.vscode4teaching.vscode4teachingserver.controllers.exceptioncontrol.ValidationErrorResponse;
import com.vscode4teaching.vscode4teachingserver.controllers.exceptioncontrol.ValidationErrorResponse.ErrorDetail;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CantRemoveCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.EmptyJSONObjectException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.EmptyURIException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.MissingPropertyException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;

import io.jsonwebtoken.MalformedJwtException;

@RestControllerAdvice
public class ExceptionController {
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Set<ConstraintViolation<?>>> handleConstraintViolationException(
            ConstraintViolationException e) {
        Set<ConstraintViolation<?>> errors = e.getConstraintViolations();
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e) {
        List<FieldError> errors = e.getBindingResult().getFieldErrors();
        List<ErrorDetail> errorDetails = new ArrayList<>();
        for (FieldError fieldError : errors) {
            ErrorDetail error = new ErrorDetail(fieldError.getField(), fieldError.getDefaultMessage());
            errorDetails.add(error);
        }

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(errorDetails);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.hibernate.exception.ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleHibernateConstraintViolationException(
            org.hibernate.exception.ConstraintViolationException e) {
        return new ResponseEntity<>(e.getSQLException().getMessage().split(" for key ")[0] + ".",
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNotFoundException(NotFoundException e) {
        return new ResponseEntity<>("Not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleBadCredentialsException(BadCredentialsException e) {
        return new ResponseEntity<>("Invalid credentials: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(DisabledException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleDisabledException(DisabledException e) {
        return new ResponseEntity<>("This user is disabled: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(LockedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleLockedException(LockedException e) {
        return new ResponseEntity<>("This user is locked: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException e) {
        return new ResponseEntity<>("This user does not exist: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MalformedJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(value = { NotInCourseException.class, CantRemoveCreatorException.class, NotCreatorException.class })
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleNotInCourseException(NotInCourseException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(NoTemplateException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNoTemplateException(NoTemplateException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = { ExerciseFinishedException.class, MultipartException.class,
        EmptyJSONObjectException.class, EmptyURIException.class, MissingPropertyException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleMultipartException(MultipartException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
    }
}
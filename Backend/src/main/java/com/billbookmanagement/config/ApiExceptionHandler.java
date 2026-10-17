package com.billbookmanagement.config;

import com.billbookmanagement.shared.service.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, Object>> api(ApiException exception, HttpServletRequest request) {
        return response(exception.status(), exception.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Request validation failed", fields, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<Map<String, Object>> constraintViolation(ConstraintViolationException exception,
            HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                fields.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return response(HttpStatus.BAD_REQUEST, "Request validation failed", fields, request);
    }

    @ExceptionHandler(BindException.class)
    ResponseEntity<Map<String, Object>> bind(BindException exception, HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Request validation failed", fields, request);
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MissingServletRequestParameterException.class,
        MissingPathVariableException.class,
        MethodArgumentTypeMismatchException.class
    })
    ResponseEntity<Map<String, Object>> malformedRequest(Exception exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "Malformed or incomplete request", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, Object>> conflict(DataIntegrityViolationException exception,
            HttpServletRequest request) {
        log.warn("Data integrity violation on {} {}", request.getMethod(), request.getRequestURI());
        return response(HttpStatus.CONFLICT, "Request conflicts with existing data", request);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    ResponseEntity<Map<String, Object>> emptyResult(EmptyResultDataAccessException exception,
            HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, "Resource not found", request);
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<Map<String, Object>> database(DataAccessException exception, HttpServletRequest request) {
        log.error("Database error on {} {}", request.getMethod(), request.getRequestURI(), exception);
        return response(HttpStatus.SERVICE_UNAVAILABLE, "Database operation failed", request);
    }

    @ExceptionHandler({AuthenticationException.class})
    ResponseEntity<Map<String, Object>> authentication(AuthenticationException exception,
            HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, "Authentication required", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Map<String, Object>> accessDenied(AccessDeniedException exception,
            HttpServletRequest request) {
        return response(HttpStatus.FORBIDDEN, "Access denied", request);
    }

    @ExceptionHandler({
        HttpRequestMethodNotSupportedException.class,
        HttpMediaTypeNotSupportedException.class
    })
    ResponseEntity<Map<String, Object>> unsupportedRequest(Exception exception, HttpServletRequest request) {
        HttpStatus status = exception instanceof HttpRequestMethodNotSupportedException
                ? HttpStatus.METHOD_NOT_ALLOWED : HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        return response(status, "Request is not supported", request);
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    ResponseEntity<Map<String, Object>> notFound(Exception exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, "Resource not found", request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled exception on {} {}: {}",
                request.getMethod(), request.getRequestURI(), exception.getMessage(), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request);
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message,
            HttpServletRequest request) {
        return response(status, message, Map.of(), request);
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message,
            Map<String, ?> details, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", message);
        body.put("timestamp", Instant.now());
        if (!details.isEmpty()) body.put("details", details);
        return ResponseEntity.status(status).body(body);
    }
}

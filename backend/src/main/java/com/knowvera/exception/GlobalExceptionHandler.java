package com.knowvera.exception;

import java.time.Instant;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

import com.knowvera.dto.ErrorResponseDTO;

import jakarta.validation.ConstraintViolationException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponseDTO> handleApiException(ApiException ex, HttpServletRequest request) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDTO> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : "Request failed";
        return buildErrorResponse(status, message, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining(", "));
        if (message.isBlank()) {
            message = "Validation failed";
        }
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(
            ConstraintViolationException ex,
            HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponseDTO> handleBadRequestExceptions(Exception ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid request payload or parameters", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        String raw = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        if (raw != null) {
            // Postgres check-constraint violations for the books table.
            if (raw.contains("books_check") || raw.contains("relation \"books\" violates check constraint")) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST, "Available copies cannot exceed total copies", request);
            }
        }
        return buildErrorResponse(HttpStatus.CONFLICT, "Request conflicts with existing data", request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        String message = ex.getMessage() == null || ex.getMessage().isBlank()
                ? "Invalid argument"
                : ex.getMessage();
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex,
            HttpServletRequest request) {
        String message = ex.getMessage() == null || ex.getMessage().isBlank()
                ? "Invalid state for this operation"
                : ex.getMessage();
        return buildErrorResponse(HttpStatus.CONFLICT, message, request);
    }

    @ExceptionHandler({ AccessDeniedException.class, AuthenticationCredentialsNotFoundException.class })
    public ResponseEntity<ErrorResponseDTO> handleSecurityException(Exception ex, HttpServletRequest request) {
        HttpStatus status = ex instanceof AccessDeniedException ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED;
        return buildErrorResponse(status, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleInternalException(
            Exception ex,
            HttpServletRequest request) {
        log.error("Unhandled exception at {} {}", request.getMethod(), request.getRequestURI(), ex);

        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request) {
        ErrorResponseDTO body = ErrorResponseDTO.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .error(status.name())
                .message(message)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(body);
    }

    private String formatFieldError(FieldError error) {
        String defaultMessage = error.getDefaultMessage() == null ? "invalid value" : error.getDefaultMessage();
        return error.getField() + ": " + defaultMessage;
    }
}

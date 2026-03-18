package com.awsome.shop.product.exception;

import com.awsome.shop.product.common.BusinessException;
import com.awsome.shop.product.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException e) {
        HttpStatus status = resolveHttpStatus(e.getErrorCode());
        log.warn("业务异常: code={}, message={}", e.getErrorCode(), e.getErrorMessage());
        return ResponseEntity.status(status)
                .body(Result.failure(e.getErrorCode(), e.getErrorMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.failure("PARAM_001", message));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Result<Void>> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        log.warn("文件大小超过限制: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.failure("PARAM_005", "文件大小超过限制"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("参数错误: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Result.failure("PARAM_001", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception e) {
        log.error("未预期异常", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.failure("SYS_001", "系统内部错误"));
    }

    private HttpStatus resolveHttpStatus(String errorCode) {
        if (errorCode == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        if (errorCode.startsWith("AUTH_")) return HttpStatus.UNAUTHORIZED;
        if (errorCode.startsWith("AUTHZ_")) return HttpStatus.FORBIDDEN;
        if (errorCode.startsWith("NOT_FOUND_")) return HttpStatus.NOT_FOUND;
        if (errorCode.startsWith("CONFLICT_")) return HttpStatus.CONFLICT;
        if (errorCode.startsWith("PARAM_")) return HttpStatus.BAD_REQUEST;
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}

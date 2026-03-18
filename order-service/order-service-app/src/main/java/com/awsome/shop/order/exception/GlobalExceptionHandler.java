package com.awsome.shop.order.exception;

import com.awsome.shop.order.common.BusinessException;
import com.awsome.shop.order.common.Result;
import com.awsome.shop.order.enums.OrderErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getErrorCode(), e.getErrorMessage());
        Result<Void> result = Result.failure(e.getErrorCode(), e.getErrorMessage());
        HttpStatus status = resolveHttpStatus(e.getErrorCode());
        return ResponseEntity.status(status).body(result);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("参数校验失败");
        log.warn("参数校验失败: {}", message);
        return ResponseEntity.badRequest().body(Result.failure("PARAM_001", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Result<Void>> handleMessageNotReadable(HttpMessageNotReadableException e) {
        log.warn("请求体解析失败: {}", e.getMessage());
        return ResponseEntity.badRequest().body(Result.failure("PARAM_002", "请求参数格式错误"));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Result<Void>> handleMissingHeader(MissingRequestHeaderException e) {
        log.warn("缺少请求头: {}", e.getHeaderName());
        return ResponseEntity.badRequest().body(Result.failure("PARAM_003", "缺少必要的请求头: " + e.getHeaderName()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.failure("SYS_001", "系统内部错误"));
    }

    private HttpStatus resolveHttpStatus(String errorCode) {
        for (OrderErrorCode code : OrderErrorCode.values()) {
            if (code.getCode().equals(errorCode)) {
                return HttpStatus.valueOf(code.getHttpStatus());
            }
        }
        // 按前缀兜底
        if (errorCode.startsWith("PARAM_")) return HttpStatus.BAD_REQUEST;
        if (errorCode.startsWith("NOT_FOUND_")) return HttpStatus.NOT_FOUND;
        if (errorCode.startsWith("CONFLICT_")) return HttpStatus.CONFLICT;
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}

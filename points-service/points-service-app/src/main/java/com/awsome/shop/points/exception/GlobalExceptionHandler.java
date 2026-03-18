package com.awsome.shop.points.exception;

import com.awsome.shop.points.common.BusinessException;
import com.awsome.shop.points.common.Result;
import com.awsome.shop.points.enums.PointsErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getErrorCode(), e.getErrorMessage());
        Result<Void> result = Result.failure(e.getErrorCode(), e.getErrorMessage());

        // 根据错误码映射 HTTP 状态码
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

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<Result<Void>> handleLockException(PessimisticLockingFailureException e) {
        log.error("悲观锁超时: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Result.failure("CONFLICT_001", "操作冲突，请稍后重试"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.failure("SYS_001", "系统内部错误"));
    }

    private HttpStatus resolveHttpStatus(String errorCode) {
        for (PointsErrorCode code : PointsErrorCode.values()) {
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

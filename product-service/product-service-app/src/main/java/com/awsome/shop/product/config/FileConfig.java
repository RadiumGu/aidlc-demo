package com.awsome.shop.product.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Getter
@Configuration
public class FileConfig {

    @Value("${file.upload-dir:${UPLOAD_DIR:/app/uploads}}")
    private String uploadDir;

    @Value("${file.max-size:${MAX_FILE_SIZE:5MB}}")
    private String maxFileSize;

    @PostConstruct
    public void init() throws IOException {
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("创建上传目录: {}", path.toAbsolutePath());
        }
    }

    /**
     * 获取最大文件大小（字节）
     */
    public long getMaxFileSizeBytes() {
        String size = maxFileSize.trim().toUpperCase();
        if (size.endsWith("MB")) {
            return Long.parseLong(size.replace("MB", "").trim()) * 1024 * 1024;
        } else if (size.endsWith("KB")) {
            return Long.parseLong(size.replace("KB", "").trim()) * 1024;
        }
        return Long.parseLong(size);
    }
}

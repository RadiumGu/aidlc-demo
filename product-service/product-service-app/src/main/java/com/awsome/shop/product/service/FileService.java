package com.awsome.shop.product.service;

import com.awsome.shop.product.common.BusinessException;
import com.awsome.shop.product.config.FileConfig;
import com.awsome.shop.product.dto.FileResponse;
import com.awsome.shop.product.enums.FileErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileConfig fileConfig;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    public FileResponse upload(MultipartFile file) {
        // 校验非空
        if (file == null || file.isEmpty()) {
            throw new BusinessException(FileErrorCode.FILE_EMPTY);
        }

        // 校验大小
        if (file.getSize() > fileConfig.getMaxFileSizeBytes()) {
            throw new BusinessException(FileErrorCode.FILE_TOO_LARGE);
        }

        // 校验扩展名
        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException(FileErrorCode.FILE_TYPE_NOT_SUPPORTED);
        }

        // UUID 重命名
        String newFilename = UUID.randomUUID() + "." + extension;
        Path targetPath = Paths.get(fileConfig.getUploadDir()).resolve(newFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("文件保存失败: {}", e.getMessage(), e);
            throw new BusinessException("SYS_001", "文件保存失败");
        }

        String url = "/api/files/" + newFilename;
        return new FileResponse(url, newFilename);
    }

    public Resource getFile(String filename) {
        try {
            Path filePath = Paths.get(fileConfig.getUploadDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            return null;
        } catch (MalformedURLException e) {
            return null;
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}

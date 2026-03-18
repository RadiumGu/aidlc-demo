package com.awsome.shop.product.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("products")
public class ProductPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private Integer pointsPrice;

    private Integer stock;

    private String imageUrl;

    private Long categoryId;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

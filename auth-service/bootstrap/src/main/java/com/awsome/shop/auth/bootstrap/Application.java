package com.awsome.shop.auth.bootstrap;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * AWSomeShop Auth Service Application Entry Point
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.awsome.shop.auth")
@MapperScan("com.awsome.shop.auth.repository.mysql.mapper")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

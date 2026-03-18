-- 种子数据：初始用户
-- 密码使用 BCrypt(strength=10) 加密
-- admin / admin123
-- employee / emp123

INSERT INTO `t_user` (`username`, `password_hash`, `display_name`, `role`, `status`, `failed_attempts`)
VALUES
    ('admin', '$2b$10$RugusWYkAXSvflZ6oxiSt.RoAoYC5QNpXl2kR8bn5c0zUEhkiy4O2', '系统管理员', 'ADMIN', 'ACTIVE', 0),
    ('employee', '$2b$10$Qw9mIiQFnXIo6isYwi0Qve8Uw7UB4gWtYNA/Fn.Gu.FYqsQIWt0K6', '普通员工', 'EMPLOYEE', 'ACTIVE', 0);

-- 更新初始用户为安全账号
-- shopmaster / Aw3s0me$h0p!2026
-- zhangwei / W3lcome@Shop#2026

UPDATE `t_user` SET username='shopmaster', password_hash='$2b$10$AKac6yynY.8Qqw0qi8rkkOSRe5JHxRANvSZiH481HYOWPux3tIMf6', display_name='商城管理员' WHERE id=1;
UPDATE `t_user` SET username='zhangwei', password_hash='$2b$10$j6cHLG.J7INXZYrNRc/87uSY5m7dFanIf7mOG0jUL64A9KZsPZFba', display_name='张伟' WHERE id=2;

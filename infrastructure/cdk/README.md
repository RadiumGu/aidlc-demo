# AWSomeShop CDK 部署

## 架构

```
用户 --HTTP--> CloudFront --HTTP--> ALB --HTTP--> EC2:80 (docker-compose)
```

镜像存储在 ECR，EC2 从 ECR pull 镜像运行，不需要上传源码。

## 前置条件

1. AWS CLI 已配置 (`aws configure`)
2. Node.js 18+
3. CDK CLI (`npm install -g aws-cdk`)
4. Docker（本地构建镜像用）
5. 已创建 EC2 Key Pair（默认名 `awsomeshop-key`）

## 部署步骤

```bash
# 1. 部署基础设施（VPC + EC2 + ALB + CloudFront + ECR）
cd infrastructure/cdk
npm install
npm run build
npx cdk bootstrap   # 首次使用 CDK
npx cdk deploy \
  --parameters KeyPairName=awsomeshop-key \
  --parameters InstanceType=t3.large \
  --parameters SshCidr=0.0.0.0/0

# 2. 本地构建并推送镜像到 ECR
cd infrastructure
bash push-to-ecr.sh

# 3. SSH 到 EC2，上传配置文件
ssh -i ~/.ssh/awsomeshop-key.pem ec2-user@<EC2_PUBLIC_IP>

# 在 EC2 上：
# - 上传 .env, docker-compose.ecr.yml, nginx/default.conf, mysql/*.sql
# - 编辑 .env 设置生产密码
# - 运行部署脚本
bash deploy-ec2.sh

# 4. 通过 CloudFront URL 访问
```

## 文件说明

- `cdk/` - CDK 基础设施代码
- `docker-compose.ecr.yml` - EC2 用的 compose 文件（从 ECR pull 镜像）
- `push-to-ecr.sh` - 本地构建 & 推送镜像到 ECR
- `deploy-ec2.sh` - EC2 上的部署脚本
- `.env.production` - 生产环境变量模板

## 销毁

```bash
cd infrastructure/cdk
npx cdk destroy
```

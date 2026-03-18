import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

/**
 * AwesomeShop 基础设施 Stack
 * - RDS MySQL 8.0 (单 AZ, db.t3.micro — 开发环境)
 * - ElastiCache Redis 7.x (单节点, cache.t3.micro — 开发环境)
 * - 部署到现有 PetSite VPC 的 Private Subnet
 * - 安全组允许 EKS 集群访问
 */
export class AwesomeShopInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========== 导入现有 VPC ==========
    const vpc = ec2.Vpc.fromLookup(this, 'PetSiteVPC', {
      vpcId: 'vpc-010ab37a3f9f74725',
    });

    // 导入 EKS 集群安全组（Pod 从这个 SG 发起连接）
    const eksClusterSg = ec2.SecurityGroup.fromSecurityGroupId(
      this, 'EksClusterSG', 'sg-02df8bc13ac85c4cc'
    );

    // ========== RDS MySQL ==========

    // 数据库安全组
    const dbSg = new ec2.SecurityGroup(this, 'AwesomeShopDbSG', {
      vpc,
      description: 'AwesomeShop RDS MySQL security group',
      allowAllOutbound: false,
    });
    dbSg.addIngressRule(eksClusterSg, ec2.Port.tcp(3306), 'Allow MySQL from EKS');

    // 数据库密码（存 Secrets Manager）
    const dbSecret = new secretsmanager.Secret(this, 'AwesomeShopDbSecret', {
      secretName: 'awesomeshop/db-credentials',
      description: 'AwesomeShop RDS MySQL credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'awesomeshop' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 24,
      },
    });

    // RDS 子网组
    const dbSubnetGroup = new rds.SubnetGroup(this, 'AwesomeShopDbSubnetGroup', {
      vpc,
      description: 'AwesomeShop DB subnet group',
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // RDS MySQL 实例
    const dbInstance = new rds.DatabaseInstance(this, 'AwesomeShopMySQL', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      subnetGroup: dbSubnetGroup,
      securityGroups: [dbSg],
      credentials: rds.Credentials.fromSecret(dbSecret),
      databaseName: 'awesomeshop',
      multiAz: false,                       // 开发环境单 AZ
      allocatedStorage: 20,                  // 20 GB gp3
      storageType: rds.StorageType.GP3,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false,             // 开发环境允许删除
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      parameterGroup: new rds.ParameterGroup(this, 'AwesomeShopDbParams', {
        engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
        parameters: {
          'character_set_server': 'utf8mb4',
          'collation_server': 'utf8mb4_unicode_ci',
        },
      }),
    });

    // ========== ElastiCache Redis ==========

    // Redis 安全组
    const redisSg = new ec2.SecurityGroup(this, 'AwesomeShopRedisSG', {
      vpc,
      description: 'AwesomeShop ElastiCache Redis security group',
      allowAllOutbound: false,
    });
    redisSg.addIngressRule(eksClusterSg, ec2.Port.tcp(6379), 'Allow Redis from EKS');

    // Redis 子网组
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'AwesomeShopRedisSubnetGroup', {
      description: 'AwesomeShop Redis subnet group',
      subnetIds: vpc.privateSubnets.map(s => s.subnetId),
      cacheSubnetGroupName: 'awesomeshop-redis-subnets',
    });

    // Redis 集群（单节点）
    const redisCluster = new elasticache.CfnCacheCluster(this, 'AwesomeShopRedis', {
      engine: 'redis',
      engineVersion: '7.1',
      cacheNodeType: 'cache.t3.micro',
      numCacheNodes: 1,
      clusterName: 'awesomeshop-redis',
      cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName,
      vpcSecurityGroupIds: [redisSg.securityGroupId],
    });
    redisCluster.addDependency(redisSubnetGroup);

    // ========== Outputs ==========

    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: dbInstance.dbInstanceEndpointAddress,
      description: 'RDS MySQL endpoint',
      exportName: 'AwesomeShop-RDS-Endpoint',
    });

    new cdk.CfnOutput(this, 'RdsPort', {
      value: dbInstance.dbInstanceEndpointPort,
      description: 'RDS MySQL port',
    });

    new cdk.CfnOutput(this, 'RdsSecretArn', {
      value: dbSecret.secretArn,
      description: 'RDS credentials secret ARN',
      exportName: 'AwesomeShop-RDS-SecretArn',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
      description: 'ElastiCache Redis endpoint',
      exportName: 'AwesomeShop-Redis-Endpoint',
    });

    new cdk.CfnOutput(this, 'RedisPort', {
      value: redisCluster.attrRedisEndpointPort,
      description: 'ElastiCache Redis port',
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

const APP_SERVICES = ['auth-service', 'product-service', 'points-service', 'order-service', 'api-gateway', 'frontend'];

export class AwsomeShopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========== Parameters ==========
    const keyPairName = new cdk.CfnParameter(this, 'KeyPairName', {
      type: 'String',
      description: 'EC2 Key Pair name for SSH access',
      default: 'awsomeshop-key',
    });

    const instanceType = new cdk.CfnParameter(this, 'InstanceType', {
      type: 'String',
      description: 'EC2 instance type (ARM/Graviton)',
      default: 't4g.large',
      allowedValues: ['t4g.medium', 't4g.large', 't4g.xlarge', 'm6g.large'],
    });

    const sshCidr = new cdk.CfnParameter(this, 'SshCidr', {
      type: 'String',
      description: 'CIDR block allowed for SSH (e.g. your IP/32)',
      default: '0.0.0.0/0',
    });

    // ========== ECR Repositories ==========
    const repos: Record<string, ecr.Repository> = {};
    for (const svc of APP_SERVICES) {
      repos[svc] = new ecr.Repository(this, `Ecr-${svc}`, {
        repositoryName: `awsomeshop/${svc}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        emptyOnDelete: true,
        lifecycleRules: [{ maxImageCount: 5 }],
      });
    }

    // ========== VPC ==========
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { cidrMask: 24, name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
      ],
    });

    // ========== Security Groups ==========
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc,
      description: 'ALB - allow HTTP from anywhere',
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP from anywhere');

    const ec2Sg = new ec2.SecurityGroup(this, 'Ec2Sg', {
      vpc,
      description: 'EC2 - HTTP from ALB only + SSH',
      allowAllOutbound: true,
    });
    ec2Sg.addIngressRule(albSg, ec2.Port.tcp(80), 'HTTP from ALB only');
    ec2Sg.addIngressRule(ec2.Peer.ipv4(sshCidr.valueAsString), ec2.Port.tcp(22), 'SSH');

    // ========== IAM Role ==========
    const ec2Role = new iam.Role(this, 'Ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });
    // Grant ECR pull access
    for (const repo of Object.values(repos)) {
      repo.grantPull(ec2Role);
    }

    // ========== EC2 UserData ==========
    const region = cdk.Stack.of(this).region;
    const account = cdk.Stack.of(this).account;

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -euxo pipefail',
      '',
      '# Install Docker',
      'yum update -y',
      'yum install -y docker',
      'systemctl enable docker && systemctl start docker',
      'usermod -aG docker ec2-user',
      '',
      '# Install Docker Compose v2',
      'mkdir -p /usr/local/lib/docker/cli-plugins',
      'curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose',
      'chmod +x /usr/local/lib/docker/cli-plugins/docker-compose',
      '',
      '# ECR login',
      `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com`,
      '',
      '# Create app directory',
      'mkdir -p /home/ec2-user/awsomeshop/infrastructure/nginx',
      'mkdir -p /home/ec2-user/awsomeshop/infrastructure/mysql',
      'chown -R ec2-user:ec2-user /home/ec2-user/awsomeshop',
      '',
      'echo "UserData complete" > /tmp/userdata-done',
    );

    const instance = new ec2.Instance(this, 'AppServer', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: new ec2.InstanceType(instanceType.valueAsString),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      securityGroup: ec2Sg,
      role: ec2Role,
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'KeyPair', keyPairName.valueAsString),
      userData,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });

    // ========== ALB ==========
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'Ec2Tg', {
      vpc,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [new elbv2_targets.InstanceTarget(instance, 80)],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    // ========== CloudFront ==========
    const distribution = new cloudfront.Distribution(this, 'Cdn', {
      comment: 'AWSomeShop CDN',
      defaultBehavior: {
        origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
    });

    // ========== Outputs ==========
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `http://${distribution.distributionDomainName}`,
      description: 'CloudFront URL',
    });
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
    });
    new cdk.CfnOutput(this, 'Ec2PublicIp', {
      value: instance.instancePublicIp,
      description: 'EC2 Public IP (SSH)',
    });
    new cdk.CfnOutput(this, 'Ec2InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID',
    });
    new cdk.CfnOutput(this, 'EcrRegistry', {
      value: `${account}.dkr.ecr.${region}.amazonaws.com`,
      description: 'ECR Registry URL',
    });
    new cdk.CfnOutput(this, 'SshCommand', {
      value: `ssh -i ~/.ssh/${keyPairName.valueAsString}.pem ec2-user@${instance.instancePublicIp}`,
      description: 'SSH command',
    });
  }
}

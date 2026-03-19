#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsomeShopStack } from '../lib/awsomeshop-stack';

const app = new cdk.App();

new AwsomeShopStack(app, 'AwsomeShopStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'AWSomeShop - Employee Points & Redemption Platform',
});

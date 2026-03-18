#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwesomeShopInfraStack } from '../lib/infra-stack';

const app = new cdk.App();

new AwesomeShopInfraStack(app, 'AwesomeShopInfra', {
  env: {
    account: '926093770964',
    region: 'ap-northeast-1',
  },
  description: 'AwesomeShop - RDS MySQL + ElastiCache Redis infrastructure',
});

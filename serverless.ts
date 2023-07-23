import type { AWS } from '@serverless/typescript';

import auth from './src/functions/auth';
const serverlessConfiguration: AWS = {
  service: 'backend-interview',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb-local', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*', // All DynamoDB actions
        Resource: 'arn:aws:dynamodb:us-east-1:221368609253:table/*', // Replace YOUR_ACCOUNT_ID with your actual AWS account ID
      },
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },

  resources: {
    Resources: {
      UsersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'UsersTable',
          AttributeDefinitions: [
            { AttributeName: 'email', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      ProductsTable: { // Add the ProductsTable configuration here
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'ProductsTable',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }, // Assuming 'id' is a string
            { AttributeName: 'name', AttributeType: 'S' }, // Assuming 'name' is a string
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }, // Assuming 'id' is the primary key
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
  
  // import the function via paths
  functions: { ...auth },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;

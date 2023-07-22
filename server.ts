import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'backend-interview',
  frameworkVersion: '3',
  // Remove the serverless-esbuild plugin
  plugins: ['serverless-localstack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  
  // Import the function via paths
  functions: { hello, users },
  package: { individually: true },
  custom: {
    localstack: {
      debug: true,
      stages: ['local', 'dev'],
      endpointFile: './localstack_endpoints.json',
    },
  },
};

module.exports = serverlessConfiguration;

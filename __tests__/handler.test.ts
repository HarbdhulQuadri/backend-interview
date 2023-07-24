// Import the function from handler.ts
import { createProduct } from '../src/functions/auth/handler';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CustomAPIGatewayProxyEvent } from '../src/functions/auth/middleware'; // Import the updated custom type

// Mock the DynamoDB DocumentClient methods used in createProduct function
jest.mock('aws-sdk', () => {
  const putMock = jest.fn().mockReturnValue({ promise: jest.fn() });
  const DocumentClient = jest.fn(() => ({ put: putMock }));
  return { DynamoDB: { DocumentClient } };
});

describe('createProduct', () => {
  it('should create a new product', async () => {
    // Mock event for createProduct function
    const event: CustomAPIGatewayProxyEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({ name: 'Product Name', price: 50 }),
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      path: '',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      resource: ''
    };

    // Call the createProduct function
    const result = await createProduct(event);

    // Assert the result
    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();

    // Parse the result body to JSON
    const responseBody = JSON.parse(result.body);

    // Check the properties of the response body
    expect(responseBody.message).toBe('Product created successfully.');
    expect(responseBody.product).toBeDefined();
    expect(responseBody.product.id).toBeDefined();
    expect(responseBody.product.name).toBe('Product Name');
    expect(responseBody.product.price).toBe(50);
    // Add more assertions as needed based on your actual implementation
  });

  // Add more test cases for error scenarios or edge cases as needed
});
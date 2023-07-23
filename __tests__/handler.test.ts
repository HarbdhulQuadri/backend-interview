// handler.test.ts

import { APIGatewayProxyEvent } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { DynamoDB } from 'aws-sdk';
import { signup, login } from '/Users/codehunter/backend-interview/src/functions/auth/handler'; // Import the "register" and "login" functions from your handler file

// handler.test.ts

// Mock the DynamoDB client
jest.mock('aws-sdk', () => require('aws-sdk-mock'));

describe('Register Function', () => {
  const dynamoDbMock = DynamoDB.DocumentClient as jest.MockedClass<typeof DynamoDB.DocumentClient>;

  it('should return a success message when registering a new user', async () => {
    // Mock DynamoDB getItem to return null (user does not exist)
    dynamoDbMock.prototype.get = jest.fn().mockReturnValueOnce({ promise: () => ({ Item: null }) });

    // Mock DynamoDB put to return success
    dynamoDbMock.prototype.put = jest.fn().mockReturnValueOnce({ promise: () => ({}) });

    // Create a mock event
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' }),
      headers: {}, // Add headers here
      multiValueHeaders: {}, // Add multiValueHeaders here
      httpMethod: 'POST', // Add the HTTP method here
      isBase64Encoded: false, // Set this value accordingly
      path: '/register', // Add the path of the endpoint here
      pathParameters: null, // Set this value accordingly if you have path parameters
      queryStringParameters: null, // Set this value accordingly if you have query parameters
      multiValueQueryStringParameters: null, // Set this value accordingly if you have multi-value query parameters
      stageVariables: null, // Set this value accordingly if you have stage variables
      resource: null, // Set this value accordingly if you have a resource
    };

    // Execute the "register" function
    const result = await signup(event);

    // Assert the result
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: 'User registered successfully.' });
  });

  // Add more test cases for error scenarios and edge cases
});

describe('Login Function', () => {
  const dynamoDbMock = DynamoDB.DocumentClient as jest.MockedClass<typeof DynamoDB.DocumentClient>;

  it('should return a success message when logging in with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('testpassword', 10);

    // Mock DynamoDB getItem to return a user with a hashed password
    dynamoDbMock.prototype.get = jest.fn().mockReturnValueOnce({ promise: () => ({ Item: { password: hashedPassword } }) });

    // Create a mock event
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' }),
      headers: {}, // Add headers here
      multiValueHeaders: {}, // Add multiValueHeaders here
      httpMethod: 'POST', // Add the HTTP method here
      isBase64Encoded: false, // Set this value accordingly
      path: '/login', // Add the path of the endpoint here
      pathParameters: null, // Set this value accordingly if you have path parameters
      queryStringParameters: null, // Set this value accordingly if you have query parameters
      multiValueQueryStringParameters: null, // Set this value accordingly if you have multi-value query parameters
      stageVariables: null, // Set this value accordingly if you have stage variables
      requestContext: null, // Set this value accordingly if you have a request context
      resource: null, // Set this value accordingly if you have a resource
    };

    // Execute the "login" function
    const result = await login(event);

    // Assert the result
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: 'Login successful.' });
  });

  // Add more test cases for error scenarios and edge cases
});

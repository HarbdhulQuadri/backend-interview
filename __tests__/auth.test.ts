import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import * as authHandler from '/Users/codehunter/backend-interview/src/functions/auth';


// Mock the DynamoDB client
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn().mockReturnValue({
        put: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({ Item: null }),
      }),
    },
  };
});

describe('Authentication Handlers', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    // Sample event for testing, replace with appropriate data as needed
    event = {
      httpMethod: 'POST',
      path: '/register',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' }),
    } as unknown as APIGatewayProxyEvent;

    // Sample context for testing
    context = {} as Context;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    const response = await authHandler.register(event, context);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'User registered successfully.' });
  });

  it('should fail to register a user with an existing email', async () => {
    // Mock the DynamoDB client to return an existing user
    jest.spyOn(authHandler, 'getUserByEmail').mockResolvedValueOnce({ email: 'test@example.com', password: 'hashedpassword' });

    const response = await authHandler.register(event, context);
    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({ error: 'User already exists.' });
  });

  it('should login a user', async () => {
    // Mock the DynamoDB client to return a user with hashed password
    jest.spyOn(authHandler, 'getUserByEmail').mockResolvedValueOnce({ email: 'test@example.com', password: 'hashedpassword' });

    // Update event path for login
    event.path = '/login';
    event.body = JSON.stringify({ email: 'test@example.com', password: 'testpassword' });

    const response = await authHandler.login(event, context);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'Login successful.' });
  });

  it('should fail to login a user with incorrect credentials', async () => {
    // Mock the DynamoDB client to return a user with hashed password
    jest.spyOn(authHandler, 'getUserByEmail').mockResolvedValueOnce({ email: 'test@example.com', password: 'hashedpassword' });

    // Provide incorrect password
    event.path = '/login';
    event.body = JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' });

    const response = await authHandler.login(event, context);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid credentials.' });
  });
});

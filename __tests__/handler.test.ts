// Import the function from handler.ts
import { createProduct } from '../src/functions/auth/handler';


// Mock the DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => ({
        put: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({})
        })
      }))
    }
  };
});

// Mock the jwt sign function
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token')
}));

// Mock the bcrypt hash function
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

// Mock the authenticateMiddleware function
jest.mock('./middleware', () => ({
  authenticateMiddleware: jest.fn().mockImplementation((event) => event)
}));

describe('createProduct', () => {
  const mockEvent = {
    body: JSON.stringify({
      name: 'Test Product',
      price: 100
    })
  };

  it('should create a product and return success response', async () => {
    const result = await createProduct(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.message).toBe('Product created successfully.');
    expect(parsedBody.product).toBeDefined();
    expect(parsedBody.product.id).toBeDefined();
    expect(parsedBody.product.name).toBe('Test Product');
    expect(parsedBody.product.price).toBe(100);
  });

  it('should return 500 error response if there is an internal server error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error output

    // Mocking the saveProductToDynamoDB function to throw an error
    jest.mock('./handler', () => ({
      saveProductToDynamoDB: jest.fn().mockRejectedValue(new Error('Mocked Error'))
    }));

    const result = await createProduct(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBeDefined();
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.error).toBe('Internal server error');
  });
});

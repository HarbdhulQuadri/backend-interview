import { APIGatewayProxyHandler, APIGatewayProxyResult, Context } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { DynamoDB } from 'aws-sdk';
import * as jwt from 'jsonwebtoken';
import { CustomAPIGatewayProxyEvent } from './middleware'; // Import the custom type
import { authenticateMiddleware } from './middleware';


const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE = 'ProductsTable'; 

const USERS_TABLE = 'UsersTable';
const HASH_SALT_ROUNDS = 10;
const JWT_SECRET = 'your-jdygegdy373ihuojw,dokow,dwumduygy3i38hdhebduehb-key'; 


interface SignupRequestBody {
  email: string;
  name: string;
  password: string;
  address: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}
interface CreateProductRequestBody {
  name: string;
  price: number;
}

// Helper function to create a user in DynamoDB
async function createUser(user: { email: string; password: string; name:string; address:string }): Promise<void> {
  const params = {
    TableName: USERS_TABLE,
    Item: user,
  };

  try {
    await dynamoDb.put(params).promise();
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function getUserByEmail(email: string): Promise<any | null> {
  const params = {
    TableName: USERS_TABLE,
    Key: { email },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}




export const signup: APIGatewayProxyHandler = async (event) => {
  try {
    const requestBody: SignupRequestBody = JSON.parse(event.body);

    // Check if the user already exists in DynamoDB
    const existingUser = await getUserByEmail(requestBody.email);
    console.log("user is here", existingUser);
    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'User already exists.' }),
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(requestBody.password, HASH_SALT_ROUNDS);

    // Save the user to DynamoDB
    await createUser({ email: requestBody.email, password: hashedPassword,name: requestBody.name,address: requestBody.address});

    // Generate and sign a JWT token
    const payload = { email: requestBody.email, password: hashedPassword,name: requestBody.name,address: requestBody.address}; // Include any user data you want in the payload
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully.', token, user: payload }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};


export const login: APIGatewayProxyHandler = async (event) => {
  try {
    const requestBody: LoginRequestBody = JSON.parse(event.body);

    // Find the user with the given email from DynamoDB
    const user = await getUserByEmail(requestBody.email);
    console.log("user is here", user);


    // Check if the user exists and compare the passwords
    if (!user || !(await bcrypt.compare(requestBody.password, user.password))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials.' }),
      };
    }

    // Generate and sign a JWT token
    const payload = { email: requestBody.email }; // Include any user data you want in the payload
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful.', token, user: payload }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
export const createProduct: APIGatewayProxyHandler = async (
  event: CustomAPIGatewayProxyEvent,
  context: Context
) => {
  try {
    // Use the authenticateMiddleware to verify the user's token and get the email
    const authenticatedEvent = await authenticateMiddleware(event);

    const requestBody: CreateProductRequestBody = JSON.parse(authenticatedEvent.body);

    const product = {
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID for the product
      name: requestBody.name,
      price: requestBody.price,
      createdBy: authenticatedEvent.email, // Use the extracted email from the token as the createdBy field
    };

    // Save the product to DynamoDB
    await saveProductToDynamoDB(product);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product created successfully.', product }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
// Helper function to save the product to DynamoDB
async function saveProductToDynamoDB(product: any): Promise<void> {
  const params = {
    TableName: PRODUCTS_TABLE,
    Item: product,
  };

  try {
    await dynamoDb.put(params).promise();
  } catch (error) {
    console.error('Error saving product to DynamoDB:', error);
    throw error;
  }
}
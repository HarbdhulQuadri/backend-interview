import { APIGatewayProxyHandler } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const USERS_TABLE = 'UsersTable';
const HASH_SALT_ROUNDS = 10;

interface SignupRequestBody {
  email: string;
  password: string;
}

export const signup: APIGatewayProxyHandler = async (event) => {
  try {
    const requestBody: SignupRequestBody = JSON.parse(event.body);

    // Check if the user already exists in DynamoDB
    const existingUser = await getUserByEmail(requestBody.email);
    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'User already exists.' }),
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(requestBody.password, HASH_SALT_ROUNDS);

    // Save the user to DynamoDB
    await createUser({ email: requestBody.email, password: hashedPassword });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully.' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

interface LoginRequestBody {
  email: string;
  password: string;
}

export const login: APIGatewayProxyHandler = async (event) => {
  try {
    const requestBody: LoginRequestBody = JSON.parse(event.body);

    // Find the user with the given email from DynamoDB
    const user = await getUserByEmail(requestBody.email);

    // Check if the user exists and compare the passwords
    if (!user || !(await bcrypt.compare(requestBody.password, user.password))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful.' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Helper function to get a user by email from DynamoDB
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

// Helper function to create a user in DynamoDB
async function createUser(user: { email: string; password: string }): Promise<void> {
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



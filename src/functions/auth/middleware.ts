// auth/middleware.ts

import { APIGatewayProxyEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key'; // Replace with your actual secret key for JWT

// Define a custom type to include the 'email' property in the event object
import { APIGatewayProxyResult, Context, Callback } from 'aws-lambda';

export interface CustomAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  email: string;
  // Add any additional properties that are missing from the base APIGatewayProxyEvent
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  multiValueQueryStringParameters: { [name: string]: string[] } | null;
  stageVariables: { [name: string]: string } | null;
  // Add any other properties that are used in your code
}

// Rest of the code remains the same


export const authenticateMiddleware = async (
  event: CustomAPIGatewayProxyEvent
): Promise<CustomAPIGatewayProxyEvent> => {
  try {
    const token = event.headers?.Authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Authorization token not provided.');
    }

    // Verify the token and extract the email if it's valid
    const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    if (!decoded.email) {
      throw new Error('Invalid token or missing email.');
    }

    // Add the email to the event object
    event.email = decoded.email;

    return event;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

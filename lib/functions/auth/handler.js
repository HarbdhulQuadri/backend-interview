import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const dynamoDb = new DocumentClient();
const USERS_TABLE = 'UsersTable';
const HASH_SALT_ROUNDS = 10;
const JWT_SECRET = 'your-secret-key';
export const register = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User already exists.' }),
            };
        }
        const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);
        await createUser({ email, password: hashedPassword });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully.' }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
export const login = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);
        const user = await getUserByEmail(email);
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials.' }),
            };
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials.' }),
            };
        }
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful.', token }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
async function getUserByEmail(email) {
    const params = {
        TableName: USERS_TABLE,
        Key: { email },
    };
    try {
        const result = await dynamoDb.get(params).promise();
        return result.Item;
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
async function createUser(user) {
    const params = {
        TableName: USERS_TABLE,
        Item: user,
    };
    try {
        await dynamoDb.put(params).promise();
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
}
//# sourceMappingURL=handler.js.map
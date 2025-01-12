export default {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
    required: ['email', 'password'],
  } as const;
  
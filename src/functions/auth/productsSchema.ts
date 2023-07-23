export default {
    type: 'object',
    properties: {
      name: { type: 'string' },
      address: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
    required: ['name', 'email', 'password'],
  } as const;
  
//   Name
// - Email
// - Phone
// - Address
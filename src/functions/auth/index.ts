import { handlerPath } from '@libs/handler-resolver';
import registerSchema from './registerSchema';
import loginSchema from './loginSchema';
import productsSchema from './productsSchema';


export default {
  register: {
    handler: `${handlerPath(__dirname)}/handler.signup`,
    events: [
      {
        http: {
          method: 'post',
          path: 'register',
          request: {
            schemas: {
              'application/json': registerSchema,
            },
          },
        },
      },
    ],
  },
  login: {
    handler: `${handlerPath(__dirname)}/handler.login`,
    events: [
      {
        http: {
          method: 'post',
          path: 'login',
          request: {
            schemas: {
              'application/json': loginSchema,
            },
          },
        },
      },
    ],
  },
  createProduct: {
    handler:  `${handlerPath(__dirname)}/handler.createProduct`,
    events: [
      {
        http: {
          method: 'post',
          path: 'products', 
          request: {
            schemas: {
              'application/json': productsSchema,
            },
          },
        },
      },
    ],
  },
};

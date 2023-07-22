import { handlerPath } from '@libs/handler-resolver';
import registerSchema from './registerSchema';
import loginSchema from './loginSchema';
export default {
    register: {
        handler: `${handlerPath(__dirname)}/handler.register`,
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
};
//# sourceMappingURL=index.js.map
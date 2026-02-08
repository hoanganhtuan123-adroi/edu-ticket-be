export const CONFIG_KEYS = {
  DATABASE: {
    HOST: 'DATABASE_HOST',
    PORT: 'DATABASE_PORT',
    USERNAME: 'DATABASE_USERNAME',
    PASSWORD: 'DATABASE_PASSWORD',
    NAME: 'DATABASE_NAME',
  },
  JWT: {
    SECRET: 'JWT_SECRET',
    EXPIRES_IN: 'JWT_EXPIRES_IN',
  },
  APP: {
    PORT: 'APP_PORT',
    NODE_ENV: 'NODE_ENV',
  },
} as const;

export const DEFAULT_VALUES = {
  DATABASE: {
    HOST: 'localhost',
    PORT: '5432',
    USERNAME: 'postgres',
    PASSWORD: 'postgres123',
    NAME: 'event_management',
  },
  JWT: {
    SECRET: 'default-secret-key',
    EXPIRES_IN: '1d',
  },
  APP: {
    PORT: '8080',
  },
} as const;

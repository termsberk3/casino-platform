import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3001),

  DATABASE_URL: Joi.string()
    .uri({
      scheme: ['postgres', 'postgresql'],
    })
    .required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  JWT_ACCESS_TTL: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m'),

  JWT_REFRESH_TTL: Joi.string()
    .pattern(/^\d+[mhd]$/)
    .default('7d'),

  CORS_ORIGIN: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .default('http://localhost:3000'),

  THROTTLE_TTL_MS: Joi.number().integer().positive().default(60000),

  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),

  AUTH_THROTTLE_TTL_MS: Joi.number().integer().positive().default(60000),

  AUTH_THROTTLE_LIMIT: Joi.number().integer().positive().default(10),

  PLATFORM_BASE_CURRENCY: Joi.string().length(3).uppercase().default('EUR'),

  CURRENCY_API_BASE_URL: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .default('https://api.frankfurter.dev'),

  CURRENCY_CACHE_TTL_SECONDS: Joi.number().integer().positive().default(3600),

  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('true'),

  SWAGGER_PATH: Joi.string().default('docs'),

  API_TITLE: Joi.string().default('Casino Platform API'),

  API_DESCRIPTION: Joi.string().default('Fullstack Developer Test API'),

  API_VERSION: Joi.string().default('1.0.0'),
});

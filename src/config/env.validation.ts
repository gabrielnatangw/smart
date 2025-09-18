import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).default('3000'),

  // Database Configuration
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required for PostgreSQL connection'),

  // MQTT Configuration
  MQTT_HOST: z.string().min(1, 'MQTT_HOST is required for IoT communication'),
  MQTT_USERNAME: z
    .string()
    .min(1, 'MQTT_USERNAME is required for MQTT authentication'),
  MQTT_PASSWORD: z
    .string()
    .min(1, 'MQTT_PASSWORD is required for MQTT authentication'),
  MQTT_PROTOCOL: z.enum(['mqtt', 'mqtts', 'ws', 'wss']).default('mqtt'),
  MQTT_PORT: z.string().regex(/^\d+$/).default('1883'),
  MQTT_CLIENT_ID: z.string().optional(),

  // Socket.IO Configuration (optional)
  SOCKET_IO_PORT: z.string().regex(/^\d+$/).optional(),
  SOCKET_IO_CORS_ORIGIN: z.string().default('*'),
  SOCKET_IO_PING_TIMEOUT: z.string().regex(/^\d+$/).default('60000'),
  SOCKET_IO_PING_INTERVAL: z.string().regex(/^\d+$/).default('25000'),

  // JWT Configuration (required for authentication)
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('30d'),

  // Redis Configuration (optional)
  REDIS_HOST: z.string().default('localhost').optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).default('6379').optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Google Cloud SQL Configuration (optional)
  USE_CLOUD_SQL: z
    .string()
    .default('false')
    .transform(val => val === 'true'),
  INSTANCE_CONNECTION_NAME: z
    .string()
    .optional()
    .refine(
      val => {
        // Se USE_CLOUD_SQL for true, INSTANCE_CONNECTION_NAME deve estar presente
        const useCloudSql = process.env.USE_CLOUD_SQL === 'true';
        return !useCloudSql || (val && val.length > 0);
      },
      {
        message:
          'INSTANCE_CONNECTION_NAME é obrigatório quando USE_CLOUD_SQL=true',
      }
    ),

  // Production Database Configuration (for Cloud SQL)
  PROD_DB_USERNAME: z.string().optional(),
  PROD_DB_PASSWORD: z.string().optional(),
  PROD_DB_DATABASE: z.string().optional(),
  PROD_DB_HOST: z.string().optional(),
  PROD_DB_DIALECT: z.string().optional(),
  PROD_DB_SSL: z.string().optional(),
  PROD_DB_PORT: z.string().regex(/^\d+$/).default('5432').optional(),
  PROD_DB_SSL_MODE: z.string().default('require').optional(),
  PROD_DB_HOST_PRIVATE: z.string().optional(),

  // Staging Database Configuration (for Cloud SQL)
  STAGING_DB_USERNAME: z.string().optional(),
  STAGING_DB_PASSWORD: z.string().optional(),
  STAGING_DB_DATABASE: z.string().optional(),
  STAGING_DB_HOST: z.string().optional(),
  STAGING_DB_PORT: z.string().regex(/^\d+$/).default('5432').optional(),
  STAGING_DB_SSL_MODE: z.string().default('require').optional(),
  STAGING_DB_HOST_PRIVATE: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  console.log('🔍 Validating environment variables...\n');

  try {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error('❌ Environment validation failed!\n');

      const errors = result.error.issues;
      const requiredVars: string[] = [];
      const invalidVars: Array<{ key: string; value: string; issue: string }> =
        [];

      errors.forEach((error: any) => {
        const key = error.path.join('.');
        const currentValue = process.env[key] || 'undefined';

        if (error.code === 'invalid_type' && currentValue === 'undefined') {
          requiredVars.push(key);
        } else {
          invalidVars.push({
            key,
            value: currentValue,
            issue: error.message,
          });
        }
      });

      // Display missing required variables
      if (requiredVars.length > 0) {
        console.error('🚫 Missing required environment variables:');
        requiredVars.forEach(varName => {
          console.error(`   • ${varName}`);
        });
        console.error();
      }

      // Display invalid variables
      if (invalidVars.length > 0) {
        console.error('⚠️  Invalid environment variables:');
        invalidVars.forEach(({ key, value, issue }) => {
          console.error(`   • ${key}: "${value}" - ${issue}`);
        });
        console.error();
      }

      // Provide helpful suggestions
      console.error('💡 To fix these issues:');
      console.error(
        '   1. Create or update your .env file in the project root'
      );
      console.error('   2. Add the missing/invalid environment variables');
      console.error('   3. Restart the application\n');

      // Show example .env content
      console.error('📝 Example .env file:');
      console.error('   NODE_ENV=development');
      console.error('   PORT=3000');
      console.error(
        '   DATABASE_URL=postgresql://user:password@localhost:5432/database'
      );
      console.error('   MQTT_HOST=mqtt.example.com');
      console.error('   MQTT_USERNAME=your_username');
      console.error('   MQTT_PASSWORD=your_password');
      console.error('   MQTT_PROTOCOL=mqtt');
      console.error('   MQTT_PORT=1883\n');

      process.exit(1);
    }

    console.log('✅ Environment validation successful!\n');

    // Log validated configuration (without sensitive data)
    const safeConfig = {
      NODE_ENV: result.data.NODE_ENV,
      PORT: result.data.PORT,
      DATABASE_URL: result.data.DATABASE_URL ? '***configured***' : 'not set',
      MQTT_HOST: result.data.MQTT_HOST,
      MQTT_USERNAME: result.data.MQTT_USERNAME ? '***configured***' : 'not set',
      MQTT_PASSWORD: result.data.MQTT_PASSWORD ? '***configured***' : 'not set',
      MQTT_PROTOCOL: result.data.MQTT_PROTOCOL,
      MQTT_PORT: result.data.MQTT_PORT,
      SOCKET_IO_PORT: result.data.SOCKET_IO_PORT || 'not set',
      JWT_SECRET: result.data.JWT_SECRET ? '***configured***' : 'not set',
      JWT_REFRESH_SECRET: result.data.JWT_REFRESH_SECRET
        ? '***configured***'
        : 'not set',
      JWT_ACCESS_TOKEN_EXPIRY: result.data.JWT_ACCESS_TOKEN_EXPIRY,
      JWT_REFRESH_TOKEN_EXPIRY: result.data.JWT_REFRESH_TOKEN_EXPIRY,
      USE_CLOUD_SQL: result.data.USE_CLOUD_SQL,
      INSTANCE_CONNECTION_NAME:
        result.data.INSTANCE_CONNECTION_NAME || 'not set',
      PROD_DB_USERNAME: result.data.PROD_DB_USERNAME || 'not set',
      PROD_DB_PASSWORD: result.data.PROD_DB_PASSWORD
        ? '***configured***'
        : 'not set',
      PROD_DB_DATABASE: result.data.PROD_DB_DATABASE || 'not set',
      PROD_DB_HOST: result.data.PROD_DB_HOST || 'not set',
    };

    console.log('📋 Configuration summary:');
    Object.entries(safeConfig).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log();

    return result.data;
  } catch (error) {
    console.error('💥 Unexpected error during environment validation:', error);
    process.exit(1);
  }
}

export default validateEnvironment;

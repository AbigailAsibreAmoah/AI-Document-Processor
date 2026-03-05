export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET,
    },
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,txt').split(','),
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  },
};
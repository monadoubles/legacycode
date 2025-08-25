export const UPLOAD_CONFIG = {
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local' | 's3' | 'gcs'
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10'),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pl,pm,xml,ktr,kjb,txt,log').split(','),
  },
  
  processing: {
    enableVirusScanning: process.env.ENABLE_VIRUS_SCAN === 'true',
    enableDuplicateDetection: process.env.ENABLE_DUPLICATE_DETECTION !== 'false',
    enableAutoAnalysis: process.env.ENABLE_AUTO_ANALYSIS !== 'false',
    batchSize: parseInt(process.env.ANALYSIS_BATCH_SIZE || '5'),
    maxConcurrentAnalysis: parseInt(process.env.MAX_CONCURRENT_ANALYSIS || '3'),
    analysisTimeout: parseInt(process.env.ANALYSIS_TIMEOUT || '300000'), // 5 minutes
  },
  
  validation: {
    enableContentValidation: process.env.ENABLE_CONTENT_VALIDATION !== 'false',
    enableMimeTypeValidation: process.env.ENABLE_MIME_VALIDATION !== 'false',
    enableFilenameValidation: process.env.ENABLE_FILENAME_VALIDATION !== 'false',
    maxFilenameLength: parseInt(process.env.MAX_FILENAME_LENGTH || '255'),
    allowedMimeTypes: [
      'text/plain',
      'text/x-perl',
      'application/xml',
      'text/xml',
      'application/octet-stream'
    ],
  },
  
  security: {
    enableFileEncryption: process.env.ENABLE_FILE_ENCRYPTION === 'true',
    encryptionKey: process.env.FILE_ENCRYPTION_KEY,
    enableAccessLogging: process.env.ENABLE_ACCESS_LOGGING !== 'false',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
  },
  
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    bucket: process.env.GCP_STORAGE_BUCKET,
    keyFilename: process.env.GCP_KEY_FILENAME,
  },
  
  cleanup: {
    enableAutoCleanup: process.env.ENABLE_AUTO_CLEANUP === 'true',
    retentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '90'),
    cleanupSchedule: process.env.CLEANUP_SCHEDULE || '0 3 * * *', // Daily at 3 AM
  }
};

export const validateUploadConfig = () => {
  const errors: string[] = [];
  
  if (UPLOAD_CONFIG.storage.maxFileSize <= 0) {
    errors.push('MAX_FILE_SIZE must be greater than 0');
  }
  
  if (UPLOAD_CONFIG.storage.allowedTypes.length === 0) {
    errors.push('ALLOWED_FILE_TYPES must not be empty');
  }
  
  if (UPLOAD_CONFIG.storage.type === 's3' && !UPLOAD_CONFIG.aws.bucket) {
    errors.push('AWS_S3_BUCKET is required when using S3 storage');
  }
  
  if (UPLOAD_CONFIG.storage.type === 'gcs' && !UPLOAD_CONFIG.gcp.bucket) {
    errors.push('GCP_STORAGE_BUCKET is required when using GCS storage');
  }
  
  if (errors.length > 0) {
    throw new Error(`Upload configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
};

export const getStorageEngine = () => {
  switch (UPLOAD_CONFIG.storage.type) {
    case 's3':
      return 's3';
    case 'gcs':
      return 'gcs';
    default:
      return 'local';
  }
};

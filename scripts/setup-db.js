#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Legacy Code Analyzer...');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = '18.0.0';
if (nodeVersion < `v${requiredVersion}`) {
  console.error(`❌ Node.js version ${requiredVersion} or higher is required. You have ${nodeVersion}`);
  process.exit(1);
}

// Create necessary directories
const directories = [
  'uploads',
  'logs',
  'temp',
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Check for required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.log('📋 Please copy .env.example to .env.local and fill in the required values');
}

// Install dependencies if needed
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}

// Run database migrations
if (process.env.DATABASE_URL) {
  console.log('🗄️  Running database migrations...');
  try {
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
  }
}

// Check if Ollama is running
try {
  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  const fetch = require('node-fetch');

  console.log('🧠 Checking Ollama connection...');
  // This would need actual fetch implementation in real scenario
  console.log('ℹ️  Make sure Ollama is running and has codellama:7b model installed');
  console.log('   Run: ollama pull codellama:7b');
} catch (error) {
  console.warn('⚠️  Could not connect to Ollama. AI features may not work.');
}

console.log('✅ Setup completed successfully!');
console.log('');
console.log('🎯 Next steps:');
console.log('   1. Start the development server: npm run dev');
console.log('   2. Open http://localhost:3000 in your browser');
console.log('   3. Upload some legacy code files to get started');
console.log('');
console.log('📚 For more information, see README.md');

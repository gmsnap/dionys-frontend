import dotenv from 'dotenv';
import path from 'path';
import type { NextConfig } from "next";

// Detect the environment, defaulting to 'local'
const nodeEnv = process.env.NODE_ENV || 'local';

// Map for specific environments
const ENV_FILE: { [key in 'local' | 'development' | 'production']: string } = {
  local: '.env.local',
  development: '.env.development',
  production: '.env.production',
};

// Explicitly determine which .env file to load
const envFile = ENV_FILE[nodeEnv as 'local' | 'development' | 'production'];

// Load environment variables
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

// Add a function to get available locales
export function getAvailableLocales(): string[] {
  return ["de"]; // Add your supported locales here
}

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export", // Enable static export
  trailingSlash: true, // Ensure trailing slashes for paths
  images: {
    unoptimized: true,
  },
};

//console.log(`Loaded Environment Config from: ${envPath}`);
//console.log('NODE_ENV:', process.env.NODE_ENV);
//console.log('ENV:', process.env.ENV);

export default nextConfig;
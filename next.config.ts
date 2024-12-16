import type { NextConfig } from "next";
import { createTranslator } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import path from "path";
import dotenv from 'dotenv';

// Load environment-specific variables
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

// Define a type for our messages
type Messages = AbstractIntlMessages;

// Add a function to get available locales
export function getAvailableLocales(): string[] {
  return ['de']; // Add your supported locales here
}

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',  // Enable static export
  trailingSlash: true, // Ensure trailing slashes for paths
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
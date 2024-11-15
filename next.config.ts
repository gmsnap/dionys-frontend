import type { NextConfig } from "next";
import { createTranslator } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

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
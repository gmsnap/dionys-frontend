# Dionys App Frontend

This is the frontend application for the **Dionys App**, built with [Next.js](https://nextjs.org).

## 🚀 Getting Started (Local Development)

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy to Dev environment

Make sure you have an AWS CLI profile configured locally with the following name:
digital-events-ppl-dev-frontend

Store your local development environment variables in a file named .env.local-copy.

Store your production environment variables in a file named .env.production.

Make sure to keep sensitive values (e.g. API keys, secrets) secure and never commit .env files to version control.

### Mac / Linux
Run the deployment script:
```bash
./deploy-dev.sh
```

### Windows
Run the deployment script in Windows Terminal:
```bash
deploy-dev.bat
```

## Deploy to Live environment

Make sure you have an AWS CLI profile configured locally with the following name:
dionys-prod-full

Run the deployment script:
```bash
./deploy-prod.sh
```
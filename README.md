# Node.js Backend with Authentication

A professional, scalable Node.js backend with authentication, profile management, and audit logging features.

## Features

- 🔐 Authentication with JWT (access & refresh tokens)
- 👤 User profile management
- 📝 Audit logging
- 🔄 Password reset functionality
- 📧 Email notifications
- 🛡️ Security features (rate limiting, password hashing)
- 📊 PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- SMTP server for email functionality

## Setup

1. Clone the repository:
```bash
git clone git@github.com:officialtpss/nodejs-auth-backend.git
cd nodejs-auth-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

4. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh-token` - Get new access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/logout` - Logout user

### Profile

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /profile/activities` - Get user activities

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting on auth routes
- Secure password reset flow
- Audit logging for all actions

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:1@localhost:5432/nodejs_backend?schema=public"

# JWT
JWT_ACCESS_SECRET="your-access-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
MAIL_FROM="noreply@example.com"

# Server
PORT="3000"
NODE_ENV="development"
```

### 👤 Author

Tech Prastish - [github.com/officialtpss](https://github.com/officialtpss)  

Contact: info@tech-prastish.com


### 📄 License

This is a sample project intended for learning and demo purposes only.

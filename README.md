# Tryout Rizztek Backend

A comprehensive backend API for managing online tryouts, assessments, and exams. Built with TypeScript, Hono.js, and Prisma.

## Overview

Tryout Rizztek is a platform that enables users to create, manage, and participate in online assessments. The platform supports multiple question types, user authentication, and detailed submission tracking.

## Features

- **User Management**: Register, login, profile management
- **Tryout Creation**: Create and manage assessment with various question types
- **Question Types**: Support for multiple choice, true/false, and short answer questions
- **Submissions**: Track user submissions, answers, and scores
- **Authentication**: JWT-based authentication and authorization

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono.js](https://honojs.dev/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)
- Node.js (v18+)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/your-username/tryout-rizztek-be.git
cd tryout-rizztek-be
```

2. Install dependencies:

```sh
bun install
```

3. Set up environment variables (see Environment Variables)

4. Run database migrations:

```sh
bunx prisma migrate dev
```

5. Start the development server:

```sh
bun run dev
```

The server will be available at `http://localhost:3000`

### Database Setup

This project uses Prisma as an ORM. The schema is defined in schema.prisma.

To initialize the database:

```sh
bunx prisma migrate dev --name init
```

To generate Prisma client:

```sh
bunx prisma generate
```

## 📚 API Documentation

### Authentication

| Endpoint         | Method | Description         | Request Body                    |
| ---------------- | ------ | ------------------- | ------------------------------- |
| `/auth/register` | POST   | Register a new user | `{ username, email, password }` |
| `/auth/login`    | POST   | Login               | `{ email, password }`           |
| `/auth/logout`   | POST   | Logout              | -                               |

### Users

| Endpoint    | Method | Description    | Request Body |
| ----------- | ------ | -------------- | ------------ |
| `/user`     | GET    | Get all users  | -            |
| `/user/:id` | GET    | Get user by ID | -            |

### Tryouts

| Endpoint                     | Method | Description             | Request Body                            |
| ---------------------------- | ------ | ----------------------- | --------------------------------------- |
| `/tryout`                    | GET    | Get all tryouts         | -                                       |
| `/tryout`                    | POST   | Create a new tryout     | `{ title, description, category, ... }` |
| `/tryout/:id`                | GET    | Get tryout by ID        | -                                       |
| `/tryout/:id`                | PUT    | Update tryout           | `{ title, description, ... }`           |
| `/tryout/:id`                | DELETE | Delete tryout           | -                                       |
| `/tryout/title/:title`       | GET    | Search tryouts by title | -                                       |
| `/tryout/category/:category` | GET    | Get tryouts by category | -                                       |

### Submissions

| Endpoint                          | Method | Description                  | Request Body           |
| --------------------------------- | ------ | ---------------------------- | ---------------------- |
| `/submission`                     | POST   | Create a submission          | `{ tryoutId, userId }` |
| `/submission/:id`                 | GET    | Get submission by ID         | -                      |
| `/submission/user/:userId`        | GET    | Get submissions by user ID   | -                      |
| `/submission/tryout/:tryoutId`    | GET    | Get submissions by tryout ID | -                      |
| `/submission/:id/submit`          | PUT    | Submit answers               | `{ answers: [...] }`   |
| `/submission/finalize/:id/submit` | PUT    | Finalize submission          | -                      |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. When a user logs in, a token is returned that should be included in subsequent requests as an `Authorization` header.

```
Authorization: Bearer <token>
```

## 📂 Project Structure

```
tryout-rizztek-be/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── prisma.ts        # Prisma client initialization
├── src/
│   ├── auth/            # Authentication related files
│   │   ├── auth.route.ts
│   │   └── auth.service.ts
│   ├── user/            # User related files
│   │   ├── user.route.ts
│   │   └── user.service.ts
│   ├── tryout/          # Tryout related files
│   │   ├── tryout.route.ts
│   │   └── tryout.service.ts
│   ├── submission/      # Submission related files
│   │   ├── submission.route.ts
│   │   └── submission.service.ts
│   └── index.ts         # Main entry point
├── .env                 # Environment variables
├── package.json
└── README.md
```

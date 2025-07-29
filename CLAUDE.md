# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Build the application using Nest CLI
- `npm start` or `npm run start:dev` - Start development server with watch mode on localhost
- `npm run start:debug` - Start with debug mode and watch
- `npm run start:prod` - Start production server

### Code Quality
- `npm run lint` - Run ESLint with auto-fix for TypeScript files
- `npm run format` - Format code using Prettier

### Testing
- `npm test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests in debug mode

### Database (Prisma)
- `npm run prisma` - Complete Prisma setup: load env, pull schema, and generate client
- `npm run prisma:env` - Load Prisma environment variables only
- `npm run prisma:pull` - Pull database schema from existing database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio for database management

### NestJS CLI Commands
- `nest g module features/[feature-name]` - Generate new feature module
- `nest g co features/[feature-name]/controller/[name] --flat --no-spec` - Generate controller
- `nest g s features/[feature-name]/service/[name] --flat --no-spec` - Generate service

## Architecture Overview

### Project Structure
This is a NestJS application with a feature-based architecture organized under `src/features/`. Each feature contains its own controllers, services, DTOs, and interfaces in separate directories.

### Key Components

**Core Application (src/)**
- `main.ts` - Application bootstrap with comprehensive middleware setup, global guards, filters, and graceful shutdown handling
- `app.module.ts` - Root module with global configuration and feature module imports

**Database Layer**
- Uses Prisma ORM with MySQL database
- Custom Prisma service with connection lifecycle management
- Database configuration loaded via environment-specific files
- Custom script (`loadPrismaEnv.ts`) handles Prisma environment variable setup

**Configuration Management**
- Environment-specific configuration files: `.env.local`, `.env.development`, `.env.production`
- Centralized configuration service in `src/config/configuration.ts`
- Dynamic CORS configuration based on environment

**Security & Middleware Stack**
- Global authorization guard (`AuthorizeGuard`)
- Authentication token guard (`AuthTokenGuard`) 
- Helmet security middleware with custom settings
- Global validation pipes with whitelist and transform
- Cookie parser middleware
- Global exception filter with logging integration

**Logging System**
- Custom logging service (`LoggerService`) integrated throughout the application
- Global logging interceptor for request/response tracking
- Comprehensive error handling with structured logging

**Authentication Features**
- Complete auth module with login, logout, signup, signout, and token refresh
- JWT-based authentication with refresh token support
- Dedicated controllers and services for each auth operation

### Development Conventions

**File Naming**
- Files use camelCase with role suffix: `*.{role}.ts` (e.g., `login.controller.ts`, `authorize.guard.ts`)
- Directory names use lowercase with hyphens for multi-word names

**Database Development**
- Prefer database-first approach: create tables/columns in database, then pull schema with `npm run prisma:pull`
- Always run `npm run prisma:generate` after schema changes

**Feature Development**
- Organize features under `src/features/[feature-name]/`
- Each feature should have dedicated controller/, service/, dto/, and interface/ directories
- Use NestJS CLI commands for consistent code generation

**Environment Setup**
- Environment variables loaded from `.env.${NODE_ENV}` files
- Development environment defaults to `local` if NODE_ENV not set
- Prisma requires DATABASE_URL generation via custom script

### Tech Stack
- Node.js v20.11.0
- NestJS v11.0.6
- TypeScript v5.8.3
- Prisma ORM with MySQL
- Jest for testing
- ESLint + Prettier for code quality

## Code Style Rules

### Prettier Configuration
- **Single Quotes**: Use single quotes for strings (`'hello'` not `"hello"`)
- **No Trailing Commas**: Objects and arrays should not have trailing commas
- **Print Width**: 80 characters maximum line length
- **Tab Width**: 2 spaces for indentation (no tabs)
- **Semicolons**: Always use semicolons
- **Bracket Spacing**: Space inside object brackets (`{ foo: bar }`)
- **Arrow Function Parentheses**: Always use parentheses around arrow function parameters
- **JSX**: Use single quotes and no bracket same line

### ESLint Rules
**TypeScript & General Rules:**
- `no-var`: Use `let`/`const` instead of `var`
- `prefer-const`: Use `const` for variables that are never reassigned
- `consistent-return`: Functions should have consistent return behavior
- `arrow-body-style`: Always use block body for arrow functions (`() => { return value; }`)
- `spaced-comment`: Always add space after comment markers (`// comment` not `//comment`)

**Disabled Strict Rules:**
- `@typescript-eslint/no-explicit-any`: `any` type is allowed when necessary
- `@typescript-eslint/explicit-function-return-type`: Return types are optional
- `@typescript-eslint/explicit-module-boundary-types`: Module boundary types are optional
- `no-console`: Console methods (warn, error, info) are allowed

**Code Formatting:**
- `comma-dangle`: Never use trailing commas
- `linebreak-style`: Any line ending style accepted
- No restrictions on function expressions or prototype methods
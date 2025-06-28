# Universal Translator Application

## Overview

This is a full-stack web application that provides language translation services. The application is built using a modern React frontend with a Node.js/Express backend, featuring a clean and responsive user interface with dark/light theme support. The system supports translation between over 100 languages and includes language detection capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom React Context for dark/light mode switching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for translation services
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: In-memory storage with fallback to database persistence
- **Development Server**: Vite integration for hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Memory Storage**: Custom implementation for development/testing
- **Connection**: Neon Database serverless PostgreSQL driver
- **Migrations**: Automated schema management via drizzle-kit

## Key Components

### Database Schema
```typescript
// Users table for authentication
users: {
  id: serial (primary key)
  username: text (unique, not null)
  password: text (not null)
}

// Translations table for storing translation history
translations: {
  id: serial (primary key)
  sourceText: text (not null)
  translatedText: text (not null)
  sourceLanguage: text (not null)
  targetLanguage: text (not null)
  createdAt: timestamp (default now)
}
```

### API Endpoints
- `POST /api/translate` - Translate text between languages
- `POST /api/detect-language` - Detect source language of provided text
- Translation history and user management (prepared for future implementation)

### Frontend Features
- Language selection with 100+ supported languages
- Real-time translation with loading states
- Language auto-detection
- Copy-to-clipboard functionality
- Dark/light theme toggle
- Responsive design for mobile and desktop
- Toast notifications for user feedback

### UI Component System
- Comprehensive design system using shadcn/ui
- Accessible components built on Radix UI
- Consistent styling with CSS custom properties
- Reusable form components with validation
- Responsive layout components

## Data Flow

1. **User Input**: User enters text in source language textarea
2. **Language Detection**: Optional auto-detection of source language
3. **Translation Request**: Frontend sends POST request to `/api/translate`
4. **External Service**: Backend processes translation (integration point for Google Translate API)
5. **Data Persistence**: Translation stored in database for history
6. **Response Handling**: Frontend displays translated text with error handling
7. **User Actions**: Copy functionality and language swapping available

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI/UX libraries (Radix UI components, Lucide icons)
- Styling (Tailwind CSS, class-variance-authority)
- Form handling (React Hook Form with Zod validation)
- Date manipulation (date-fns)

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- Neon Database driver for PostgreSQL
- Zod for schema validation
- Session management utilities

### Development Dependencies
- TypeScript for type safety
- Vite for build tooling and development server
- ESBuild for production builds
- PostCSS for CSS processing

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Frontend assets served from Express in production

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production environment handling
- Static file serving configuration

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build for both frontend and backend
- `npm start` - Production server startup
- `npm run db:push` - Database schema synchronization

### Production Considerations
- Node.js runtime with ES module support
- PostgreSQL database requirement
- Environment variable configuration for database connectivity
- Static file serving for built frontend assets

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
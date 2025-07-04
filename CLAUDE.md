# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Project Architecture

ScaffAI is a scaffold calculation and design platform built as a TypeScript monorepo with the following structure:

```
scaffai/
├── apps/
│   ├── mobile/     # React Native (Expo) app
│   └── web/        # Next.js web application
├── packages/
│   ├── core/       # Shared business logic & calculation engine
│   └── ui/         # Shared UI components
└── docs/           # Project documentation
```

### Technology Stack
- **Monorepo**: Turbo + pnpm workspace
- **Mobile**: React Native + Expo (Router v7)
- **Web**: Next.js 15 + React 18 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand + React Context
- **UI Components**: Radix UI + class-variance-authority
- **Drawing Engine**: Konva.js + React-Konva (Web only)
- **Testing**: Jest + Playwright + React Testing Library
- **Type Safety**: TypeScript + Zod validation

## 🔧 Development Commands

### Root Level Commands
```bash
# Development
pnpm dev              # Start all apps simultaneously
pnpm dev:web          # Web app only (PORT 3048)
pnpm dev:mobile       # Mobile app only

# Quality Assurance
pnpm lint            # ESLint across all packages
pnpm typecheck       # TypeScript validation
pnpm test            # Jest unit tests
pnpm build           # Build all packages
pnpm format          # Prettier formatting
```

### App-Specific Commands
```bash
# Web App (apps/web/)
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright UI mode
npm run type-check   # TypeScript check

# Mobile App (apps/mobile/)
npm run dev:web      # Expo web development
npm run build:web    # Export for web
```

## 🏗️ Key Architecture Decisions

### Calculation Engine
- **Location**: `packages/core/src/calculations/`
- **Critical Rule**: The simple allocation calculation logic (`quickAllocationCalculator.ts`) is **PERFECT** and should **NEVER** be modified without explicit user confirmation
- **Type Safety**: All calculations use strict TypeScript types with Zod validation
- **Testing**: Maintains 100% accuracy match with original Python implementation

### Component Architecture
- **Separation Strategy**: Maximum component separation with single-responsibility principle
- **Size Limit**: Keep components under 100 lines when possible
- **Reusability**: Platform-specific implementations in `packages/ui/`
- **Pattern**: Composition over inheritance

### State Management
- **Global State**: Zustand stores for cross-component data
- **Local State**: React hooks for component-specific state
- **Form State**: react-hook-form with Zod validation
- **Session Data**: AsyncStorage (mobile) + localStorage (web)

## 📱 Platform-Specific Features

### Mobile App (`apps/mobile/`)
- **Navigation**: Expo Router with drawer navigation
- **Offline Support**: AsyncStorage persistence
- **Billing**: React Native Purchases (RevenueCat)
- **Camera**: Expo Camera for photo uploads
- **PWA**: Manifest + service worker support

### Web App (`apps/web/`)
- **Drawing Engine**: Konva.js for CAD-like functionality
- **Multi-level Support**: Up to 5 scaffold levels
- **Real-time Updates**: Immediate visual feedback
- **Export Features**: PDF generation, screenshot capture
- **Responsive Design**: Mobile-first approach

## 🧪 Testing Strategy

### E2E Testing (Playwright)
- **Base URL**: `http://localhost:3048`
- **Browser Support**: Chrome, Firefox, Safari, Mobile variants
- **Screenshot Testing**: Automatic on failures
- **Configuration**: Multi-browser parallel execution

### Unit Testing (Jest)
- **Coverage Target**: 80%+ code coverage
- **Focus Areas**: Calculation accuracy, component logic
- **Mock Strategy**: Supabase client mocking for API calls

## 🔍 Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Enabled across all packages
- **Path Mapping**: Absolute imports configured
- **Type Exports**: Shared types from `packages/core`

### ESLint Rules
- **Extends**: Next.js, React, React Hooks, React Native
- **Custom Rules**: Component naming, import ordering
- **Accessibility**: eslint-plugin-jsx-a11y for web

### File Naming Conventions
- **Components**: PascalCase (`CalculatorForm.tsx`)
- **Utilities**: camelCase (`quickAllocationCalculator.ts`)
- **Types**: PascalCase (`QuickAllocationInput`)
- **Constants**: UPPER_SNAKE_CASE (`STANDARD_PARTS`)

## 🗃️ Database Schema (Supabase)

### Key Tables
- `calculations` - Calculation history and results
- `projects` - User project management
- `drawing_data` - CAD drawing persistence
- `user_sessions` - Session management

### Row Level Security (RLS)
- **Enabled**: All tables have RLS policies
- **User Isolation**: Data scoped to authenticated users
- **Public Access**: Limited to demo/sample data

## 🎯 Development Workflow

### Standard Process
1. **Issue Analysis** → Create todos with TodoWrite
2. **Implementation** → One task at a time, mark completed immediately
3. **Testing** → Playwright for E2E, Jest for units
4. **Quality Check** → Lint, typecheck, manual testing
5. **Documentation** → Update roadmap.md checkboxes when complete

### Critical Development Rules
- **Port Usage**: Always use PORT 3048 for web development
- **File Creation**: Prefer editing existing files over creating new ones
- **Component Size**: Break large components into smaller, focused ones
- **Documentation**: No proactive creation of .md files unless requested
- **Calculation Logic**: Never modify simple allocation logic without user confirmation

## 📊 Performance Considerations

### Optimization Strategies
- **Bundle Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **State Updates**: Debounced inputs for real-time features
- **Memory Management**: Proper cleanup of Konva objects

### Monitoring
- **Client-side**: Error boundaries + performance monitoring
- **Server-side**: Supabase built-in analytics
- **Build Analysis**: Bundle analyzer for size optimization

## 🔒 Security Practices

### Data Protection
- **Environment Variables**: Separate for dev/prod
- **API Keys**: Client-side keys only (anon key)
- **Validation**: Server-side validation with Supabase RLS
- **Secrets**: Never commit sensitive data

### Authentication
- **Provider**: Supabase Auth with email/password
- **Session Management**: Automatic token refresh
- **Route Protection**: Middleware-based auth checks

## 📝 Important Notes

### Billing Integration
- **RevenueCat**: Mobile app billing (iOS + Android)
- **Stripe**: Web app billing (under development)
- **Plan Tiers**: Free, Plus (¥4,980), Pro (¥12,800), Max (¥24,800)

### Drawing Engine Specifics
- **Canvas Size**: Dynamic based on viewport
- **Coordinate System**: Relative to canvas dimensions
- **Performance**: Virtualization for large drawings
- **Export**: PNG, PDF, SVG support

### Deployment
- **Mobile**: Expo Application Services (EAS)
- **Web**: Vercel with Next.js optimization
- **Database**: Supabase hosted PostgreSQL
- **CDN**: Built-in with hosting providers

## 🚨 Critical Constraints

1. **Calculation Logic**: The simple allocation calculation is production-ready and should not be modified
2. **Port Configuration**: Always use PORT 3048 for local web development
3. **Component Architecture**: Maintain small, focused components with clear interfaces
4. **Type Safety**: All new code must be fully typed with proper Zod validation
5. **Testing**: All features must have corresponding Playwright E2E tests
6. **Documentation**: Update docs/roadmap.md checkboxes when tasks are completed

## 🔗 External Dependencies

### Core Dependencies
- **@supabase/supabase-js**: Database and auth client
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling with validation
- **konva**: Canvas drawing engine (web only)
- **expo**: Mobile app framework and services

### Development Tools
- **@playwright/test**: E2E testing framework
- **turbo**: Monorepo task runner
- **eslint**: Code linting and formatting
- **typescript**: Static type checking
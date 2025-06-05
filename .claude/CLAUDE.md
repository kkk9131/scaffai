# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScaffAI（スキャフAI）は日本の建設業界向け足場計算・設計プラットフォームです。建設現場とオフィス間のリアルタイム同期を実現するクロスプラットフォーム（モバイル・Web）アプリケーションとして設計されています。

## Current Project Status & Development Roadmap

**Current Status**: Phase 1 - Mobile MVP Development (Week 1-2)
- ✅ Mobile authentication system implemented
- ✅ Basic UI components and calculation logic exist
- ✅ Web UI structure created
- 🚧 Currently working on mobile-web data synchronization

**Development Priority**: Follow `/docs/roadmap.md` for structured development plan:
1. **Mobile MVP** (2 weeks): Complete mobile app with core scaffolding calculations
2. **Web MVP** (2 weeks): Web version with drawing tools and real-time sync
3. **Feature Enhancement** (4 weeks): Advanced calculations and collaboration
4. **Production Ready** (ongoing): Optimization and monitoring

## Technology Stack (Detailed)

### Frontend Applications
- **Mobile**: Expo SDK 53 + React Native 0.79.2 + NativeWind 4.x
- **Web**: Next.js 15.1.8 + React 19 + Radix UI + Tailwind CSS 4.x
- **Language**: TypeScript 5.8.3 (strict mode across all packages)

### Backend & Data
- **Database**: Supabase (PostgreSQL 15.x + Auth + Storage + Realtime)
- **API Server**: FastAPI 0.1x (Python) for complex calculations
- **State Management**: TanStack Query 5.x + Zustand 4.x

### Drawing & Visualization
- **Web Drawing**: Konva.js for 2D CAD functionality with snap grid, undo/redo
- **File Support**: DXF import, PDF export, real-time drawing sync
- **Mobile**: Basic drawing with potential 3D visualization

### Development Tools
- **Monorepo**: Turborepo 2.x with pnpm workspaces
- **Code Quality**: ESLint 9.x + Prettier 3.x
- **Testing**: Playwright for E2E testing
- **Deployment**: Vercel (web) + Expo EAS (mobile)

## Development Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Web app only
pnpm dev:mobile       # Mobile app only

# Build & Quality Checks - MUST run before committing
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript checking across monorepo
pnpm test             # Run all tests

# E2E Testing
pnpm test:e2e         # Playwright tests headless
pnpm test:e2e:ui      # Playwright UI mode

# Mobile Development
expo start            # Development server
expo run:android      # Android development
expo run:ios          # iOS development
eas build --platform android  # Production build
```

## Key Architectural Patterns

**Monorepo Structure**: Turborepo with shared packages
- `apps/mobile/`: Expo + React Native with comprehensive auth system
- `apps/web/`: Next.js with App Router + Konva.js drawing system
- `packages/types/`: Shared TypeScript type definitions
- `packages/database/`: Unified Supabase client and database layer
- `packages/scaffold-engine/`: Core scaffolding calculation algorithms (migrated from Python)
- `packages/utils/`: Common validation and utility functions

**Real-time Synchronization**: Critical requirement for construction site workflow
- All data flows through Supabase realtime subscriptions
- Cross-platform sync between mobile (site) and web (office)
- Offline support with local caching and conflict resolution

**Authentication Architecture**: 
- Supabase Auth with JWT tokens
- Cross-platform session synchronization
- AuthGuard component for protected routes
- Context-based auth state management

**Drawing System (Web-focused)**:
- Konva.js for 2D drawing with snap grid, undo/redo
- DXF layer analysis and PDF vectorization
- Real-time drawing data synchronization via Supabase
- Export functionality (PDF/DXF)

## Development Guidelines

### Code Quality Requirements
- **TypeScript**: Strict mode enforced across all packages
- **Quality Gates**: Always run `pnpm lint` and `pnpm typecheck` before committing
- **Testing**: Maintain E2E test coverage, especially for calculation accuracy
- **Performance**: Target 60fps UI, <3sec initial load time

### Package Management
- Use `workspace:*` for all shared package dependencies
- Mobile uses Expo Router (file-based routing)
- Web uses Next.js App Router with React 19 async components

### Japanese Language Support
- Core requirements documented in `apps/scaffai_requirements.md`
- UI text should support Japanese construction industry terminology
- Consider locale-specific number formatting for measurements

## Environment Configuration

```bash
# Supabase Configuration (Required)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_PROJECT_ID=your_project_id

# Platform-specific variables
NEXT_PUBLIC_*  # Public web app variables
EXPO_*         # Expo/mobile configuration
```

## Development Focus Areas

### Phase 1 Priority (Mobile MVP - Current)
1. **Authentication System Enhancement**: Fix auth flows, improve UX
2. **Scaffold Engine Integration**: Connect calculation logic to mobile UI
3. **Data Persistence**: Complete Supabase integration with real-time sync
4. **UI Polish**: Unify design with NativeWind, add animations

### Phase 2 Priority (Web MVP - Next)
1. **Cross-platform Auth**: Sync authentication state between mobile and web
2. **Calculation Engine Port**: Integrate @scaffai/scaffold-engine with web UI
3. **Drawing Implementation**: Konva.js with grid, snap, basic shapes
4. **Real-time Sync**: Ensure drawing data syncs between platforms

### Critical Success Factors
- **Real-time collaboration**: Essential for construction site workflow
- **Calculation accuracy**: Core business value for scaffolding safety
- **Cross-platform consistency**: Seamless experience between mobile/web
- **Offline capability**: Construction sites often have poor connectivity

## Performance & Quality Standards

- **Initial Load**: <3 seconds on mobile, <2 seconds on web
- **Frame Rate**: Maintain 60fps for drawing operations
- **Accessibility**: WCAG 2.1 AA compliance (especially important in Japan)
- **TypeScript Coverage**: 100% with strict mode
- **Test Coverage**: >70% E2E coverage for critical calculation paths

Refer to `/docs/roadmap.md` for detailed development timeline and feature priorities.

###全ての出力を日本語にしてください。
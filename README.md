# Student Tracker - Phase 1

This is the **Phase 1** implementation of the Student Tracker application, structured as a monorepo containing a shared library, a web application, and a mobile application.

## 📂 Project Structure

The project follows a strict directory structure:

```
packages/
├── shared/             # Shared logic library
│   ├── models/         # Data models and interfaces
│   ├── services/       # Business logic services
│   ├── hooks/          # Shared React hooks
│   ├── utils/          # Utility functions
│   ├── validators/     # Validation schemas (using Zod)
│   └── constants/      # App-wide constants
├── web/                # Next.js Web Application
│   ├── app/            # App Router pages and layouts
│   ├── components/     # Web-specific components
│   ├── styles/         # Web styling (CSS/Modules)
│   └── public/         # Static assets
└── mobile/             # React Native Mobile Application (Expo)
    ├── src/
    │   ├── screens/    # Mobile screens
    │   ├── components/ # Mobile-specific components
    │   ├── navigation/ # Navigation configuration
    │   ├── styles/     # Mobile styling
    │   └── assets/     # Mobile assets
    ├── android/        # Android native project
    └── ios/            # iOS native project
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/) (Package Manager)
- [Expo Go](https://expo.dev/client) (For testing mobile app)

### Installation

Install dependencies using pnpm:

```bash
pnpm install
```

### Running the Project

To start development servers for both Web and Mobile:

```bash
pnpm dev
```

This commands runs `turbo run dev`, which simultaneously starts:
- **Web**: Access at `http://localhost:3000`
- **Mobile**: Starts the Metro bundler for Expo. Press `a` for Android, `i` for iOS, or `w` for Web.

### Other Commands

- **Build**: `pnpm build` - Builds all packages.
- **Lint**: `pnpm lint` - Runs linting across the monorepo.
- **Format**: `pnpm format` - Formats code using Prettier.

## 🛠 Tech Stack

- **Monorepo**: Turbo + pnpm workspaces
- **Web**: Next.js 14, React, TypeScript
- **Mobile**: React Native, Expo, TypeScript
- **Shared**: TypeScript, Zod (Validation), Jest (Testing)

## ✅ Phase 1 Deliverables

- [x] Monorepo setup with `pnpm` workspaces
- [x] Shared library integration for logic reuse
- [x] Web project initialization (Next.js)
- [x] Mobile project initialization (Expo)
- [x] Strict directory structure implementation

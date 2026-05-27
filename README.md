# DevSync — Auth UI

A bold, dark-themed authentication UI for DevSync, matching the reference design.
Built with **React 18** + **Tailwind CSS v3** + **Vite**.

## Project Structure

```
src/
├── App.jsx                  # Root router (state-based navigation)
└── pages/
    ├── LandingPage.jsx      # Hero landing — YSK-inspired dark design
    ├── SignUp.jsx           # Register page → POST /api/auth/signup
    ├── SignIn.jsx           # Login page  → POST /api/auth/login
    └── Dashboard.jsx        # Post-login landing stub
```

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

## API Integration

### Sign Up
```
POST http://localhost:8080/api/auth/signup
     ?username=john_dev
     &email=john@example.com
     &password=Str0ng!Pass
```

### Sign In
```
POST http://localhost:8080/api/auth/login
     ?email=john@example.com
     &password=Str0ng!Pass
```

## Features

### Landing Page
- Bold Bebas Neue hero typography
- Animated orange ticker / marquee strip
- Feature list, testimonials, stats
- CTA buttons navigating to Sign Up / Sign In
- Fully responsive

### Sign Up Page (`/signup`)
- Username, Email, Password, Confirm Password fields
- Real-time password strength indicator (5 levels)
- Client-side validation (required, email format, password match)
- Show/hide password toggle
- Connects to `http://localhost:8080/api/auth/signup`
- Success redirect to Sign In
- "Already have an account? Sign In" link

### Sign In Page (`/signin`)
- Email + Password fields
- "Remember Me" checkbox (persists to localStorage)
- Forgot Password link
- Social login buttons (GitHub / Google — placeholders)
- Connects to `http://localhost:8080/api/auth/login`
- Redirects to Dashboard on success
- "Don't have an account? Sign Up" link

## Design System

| Token | Value |
|-------|-------|
| Brand Orange | `#FF4500` |
| Accent Lime | `#c8f135` |
| Background | `#0a0a0a` |
| Surface | `#111111` |
| Display Font | Bebas Neue |
| Body Font | Space Grotesk |

## Build for Production

```bash
npm run build      # outputs to /dist
npm run preview    # preview production build
```

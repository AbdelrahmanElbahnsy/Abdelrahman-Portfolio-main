<div align="center">

# Abdelrahman El-bahnsy
### Cloud & DevOps Engineer

A serverless web application combining a responsive public portfolio with a secure, custom CMS backend (AdminOS).

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://abdelrahman-el-bahnsy.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%7C_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)]()
[![Security](https://img.shields.io/badge/Security-Hardened-27c93f?style=for-the-badge&logo=shield&logoColor=white)]()

[View Live Portfolio](https://abdelrahman-el-bahnsy.vercel.app/) • [Open AdminOS](https://abdelrahman-el-bahnsy.vercel.app/admin/overview)

</div>

---

## 📑 Table of Contents

- [Overview](#overview)
- [Live Product](#live-product)
- [Key Features](#key-features)
- [Architecture & Data Flow](#architecture--data-flow)
- [Tech Stack](#tech-stack)
- [Security Implementation](#security-implementation)
- [Responsive & UX](#responsive--ux)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)

---

## Overview

This repository contains the source code for a comprehensive Cloud & DevOps engineering portfolio. Built entirely on a serverless architecture, it pairs a public-facing React frontend with **AdminOS**, a private internal content management system. 

The architecture is designed to manage the entire platform dynamically, relying on Firebase Authentication, Cloud Firestore, Cloudinary, and EmailJS for its core services.

---

## Live Product

### Public Portfolio

The frontend interface accessible to the public, dynamically rendering content fetched from Firestore.

<img src="./docs/assets/media_1789315076403.png" alt="Public Portfolio Preview" width="800">

**Live URL:** [https://abdelrahman-el-bahnsy.vercel.app/](https://abdelrahman-el-bahnsy.vercel.app/)

### AdminOS

The secure internal dashboard restricting portfolio content modification to authorized users.

<img src="./docs/assets/media_1789315102932.png" alt="AdminOS Dashboard Preview" width="800">

**Dashboard URL:** [https://abdelrahman-el-bahnsy.vercel.app/admin/overview](https://abdelrahman-el-bahnsy.vercel.app/admin/overview)  
*(Requires Authorized Authentication)*

---

## Key Features

### Public Portfolio
Features visible and accessible to the public:
- **Hero & About Profile:** Professional summary and introduction.
- **Skills & Projects Showcase:** Dynamic categorization of technical proficiencies and portfolio items.
- **Certifications & Journey:** Timeline-based professional experience and credentials.
- **Contact Integration:** Direct communication form powered by EmailJS.
- **Theme & Language:** Interactive dark/light mode toggling and English/Arabic language switching.

### AdminOS (CMS)
Features restricted to authenticated administrators:
- **Dashboard Overview:** High-level metrics and quick actions.
- **Content Managers:** Full CRUD interfaces for Projects, Skills, Certifications, Journey, Hero, About, Navbar, and Contact sections.
- **Media Library:** Centralized asset management integrating Cloudinary uploads with Firestore metadata.
- **User Management:** Internal role delegation (Owner, Admin, Editor, Viewer).
- **Platform Settings:** Global configuration for UI themes and active languages.

---

## Architecture & Data Flow

The platform operates on a decoupled serverless architecture. Content updates in AdminOS trigger immediate changes in the Public Portfolio via Firestore real-time snapshot listeners.

```mermaid
flowchart TD
    Admin((Authorized Admin)) -->|Login| Auth[Firebase Authentication]
    Admin -->|CRUD Operations| AdminOS[AdminOS Frontend]
    AdminOS -->|Writes Content| Firestore[(Cloud Firestore)]
    AdminOS -->|Uploads Media| Cloudinary[Cloudinary CDN]
    
    Firestore -->|Real-time Sync| PublicUI[Public React Portfolio]
    Cloudinary -->|Serves Assets| PublicUI
    
    Visitor((Public Visitor)) -->|Views| PublicUI
    Visitor -->|Submits Contact| EmailJS[EmailJS API]
```

---

## Tech Stack

Derived directly from the project's package dependencies and architecture:

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **GSAP** & **Framer Motion**

### Data & Authentication
- **Firebase Authentication**
- **Cloud Firestore**
- **Firebase Admin SDK** (Node.js API Route)

### Cloud / Infrastructure
- **Vercel** (Hosting, Serverless API functions)
- **Cloudinary** (Media CDN)
- **EmailJS** (Contact form delivery)

---

## Security Implementation

The project utilizes verified security hardening practices across the database, client, and serverless API layers:

- **Authentication & Protected Routes:** AdminOS routes rigorously verify Firebase Auth states and user roles prior to rendering (`ProtectedRoute.jsx`).
- **Role-Based Access Control (RBAC):** Strict hierarchy (Owner, Admin, Editor, Viewer) backed by an `admins/{uid}` Firestore collection.
- **Server-Side Token Verification:** The Vercel Serverless API (`api/admin/users.js`) decodes Bearer tokens independently, verifying user roles server-side to prevent client spoofing.
- **Firestore Security Rules:** Strict field-level schema enforcement directly within `firestore.rules`.
- **Application Security:**
  - Dynamic URLs supplied via the CMS are filtered through a strict `safeUrl` utility, rejecting executable schemes.
  - Security Headers enforced via `vercel.json` (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`).
  - Production API routes explicitly restrict allowed CORS origins.
- **Credential Safety:** Server-side secrets are cleanly isolated in Vercel environment variables. All credentials, including historical instances of `users.json`, have been purged from Git history.

---

## Responsive & UX

- **Responsive Layouts:** Tailwind CSS utility classes ensure cross-device compatibility from mobile viewports to ultrawide displays.
- **Responsive AdminOS:** The complex data tables and CMS modals adjust gracefully to smaller screens.
- **Animations:** Scroll-linked animations and page transitions powered by GSAP and Framer Motion.

---

## Getting Started

Ensure you have **Node.js (v18+)** installed.

```bash
# 1. Clone the repository
git clone https://github.com/AbdelrahmanElbahnsy/Abdelrahman-Portfolio-main.git

# 2. Navigate to the project directory
cd Abdelrahman-Portfolio-main

# 3. Install dependencies
npm install

# 4. Set up environment variables (see below)
# Create a .env file and populate it with your configuration

# 5. Start the Vite development server
npm run dev
```

---

## Environment Variables

Create a `.env` file at the repository root. 

> **WARNING:** Never commit real credentials to Git.

### Client-Side Configuration (Publicly Exposed)
These variables are safe to expose to the Vite bundler and must be prefixed with `VITE_`.
```env
# EmailJS
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Firebase Client
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

### Server-Side Configuration (Vercel Only)
These variables must be added securely to your Vercel Production Environment and **must never** be prefixed with `VITE_`.
```env
# Firebase Admin 
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Security Configuration
OWNER_EMAILS=your.email@example.com,second.email@example.com
```

---

## Project Structure

```text
├── api/                  # Vercel Serverless API routes (users.js)
├── public/               # Static assets and icons
├── src/
│   ├── cms/              # Firebase CRUD hooks and logic
│   ├── components/
│   │   ├── Dashboard/    # AdminOS interface and CMS modules
│   │   ├── sections/     # Public portfolio UI components
│   │   └── ui/           # Shared micro-components
│   ├── context/          # React Context providers (Appearance, Visitor)
│   ├── hooks/            # Custom React hooks (Auth, Upload)
│   ├── routes/           # Routing configuration and ProtectedRoute logic
│   ├── services/         # Integrations (Firebase init, Analytics, safeUrl)
│   └── styles/           # Global PostCSS / Tailwind configurations
├── firestore.rules       # Firebase security rules
├── vercel.json           # Vercel routing and security headers
├── package.json          # Dependency definitions
└── vite.config.js        # Vite build configuration
```

---

## Future Roadmap

Verified technical areas identified for future maintenance and expansion:
- **Firebase App Check:** Enforcement integration via the Firebase Console and application initialization.
- **Dependency Maintenance:** A planned major migration to `firebase-admin` v14+ to permanently resolve nested `uuid` deprecations.
- **Rate Limiting:** Shifting the `Contact` form submission cooldown from client-side `localStorage` to a server-side Edge function.

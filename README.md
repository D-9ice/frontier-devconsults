# Frontier DevConsults - Official Website

**Developed by:** Frontier DevConsults  
**Version:** 1.0.0  
**Last Updated:** November 24, 2025

## About

This is the official website for Frontier DevConsults - a professional software development company specializing in mobile apps, web platforms, and AI-powered solutions.

**Building Digital Excellence**

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel
- **Features:** 
  - Progressive Web App (PWA)
  - SEO Optimized
  - Admin Dashboard
  - Contact Forms
  - Project Showcase
  - App Store

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
frontier-devconsults/
├── app/                  # Next.js app directory
│   ├── about/           # About page
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── app-store/       # App store page
│   ├── contact/         # Contact page
│   ├── pricing/         # Pricing page
│   ├── projects/        # Projects showcase
│   └── ...
├── components/          # Reusable components
├── public/              # Static assets
│   └── logos/          # Project logos
└── ...
```

## Admin Access

- **URL:** `/admin`
- **Keyboard Shortcut:** Ctrl+Shift+A (Cmd+Shift+A on Mac)
- **Default Password:** See ADMIN_README.md

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Features

- 📱 Responsive design for all devices
- 🚀 Fast page loads with Next.js optimization
- 🔒 Secure admin dashboard
- 📧 Contact form with email integration
- 🎨 Modern UI with Tailwind CSS
- 📱 PWA support for mobile installation
- 🔍 SEO optimized with metadata
- 📊 Project portfolio showcase
- 🏪 App store for mobile applications
- 🌍 International USD/GHS pricing presentation
- 🧰 Searchable Apps & Solutions and evidence-based case-study routes
- 🔒 Contact-free Upwork portfolio rendering
- 🤖 First-party OpenAI Responses API assistant (server-side key only)

## Upgrade configuration

Apply `supabase/migrations/202608300010_application_presentation_metadata.sql` before using the extended application editor. The migration is additive; legacy records remain compatible and the existing uploader stays the only application input path. Roll back application code first if needed and leave the added columns intact to avoid deleting owner-entered metadata.

Configure the assistant with `OPENAI_API_KEY`; it defaults to `gpt-5.6-luna`, low reasoning effort, a 500-token output cap, and 12 requests per ten-minute in-memory window. Configure project budget and spend alerts in the OpenAI project. Conversations are not persisted by this application and message text is not sent to website analytics.

Set `UPWORK_PROFILE_URL` only to the owner-approved HTTPS Upwork profile. The CTA stays hidden when it is missing or invalid. The Upwork portfolio itself remains usable and contact-free.

Before production deployment, the owner must approve surface visibility, commercial modes, pricing, the current USD/GHS rate and date, product media, founder wording, legal terms, and downloadable release metadata. Production deployment is a separate authorization.

## Contact

**Frontier DevConsults**  
Email: info@frontier-devconsults.com  
Phone: +233 249 078 976  
Website: https://www.frontier-devconsults.com

---

© 2024-2025 Frontier DevConsults. All rights reserved.

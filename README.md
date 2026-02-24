# EduVerse LMS — Virtual Homeschool Learning Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel" />
</div>

---

## 📖 Overview

**EduVerse LMS** is a production-ready, cloud-based Learning Management System built for Kenyan virtual homeschools. It supports both:

- 🇬🇧 **IGCSE** (International General Certificate of Secondary Education)
- 🇰🇪 **CBC** (Competency-Based Curriculum — Kenya)

### 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Role-based Auth | Admin, Teacher, Student roles with JWT sessions |
| 📝 Notes Management | Upload, categorize, and download study notes |
| 📋 Assignments | Create, submit, and grade assignments |
| 🎥 Virtual Classes | Schedule and join Zoom/Google Meet sessions |
| 🏆 Grading | Grade submissions with feedback |
| 🤖 AI Features | Quiz generation, note summarization, feedback assistance |
| 📢 Announcements | System-wide messaging to roles |
| 📱 Responsive | Works on mobile, tablet, and desktop |

### 🎨 Design

- **Primary**: Purple (`#7C3AED`)
- **Accent**: Light Green (`#22C55E`)
- **Background**: White (`#FFFFFF`)
- Modern, minimal, and accessible (WCAG considerations)

---

## 🏗 Tech Stack

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
UI:        Radix UI Primitives + Custom Components
State:     Zustand + React Hook Form
Backend:   Next.js API Routes
ORM:       Prisma 5
Database:  PostgreSQL (Neon / Supabase)
Auth:      NextAuth v4 (Credentials + JWT)
Storage:   Cloudinary (file uploads)
AI:        OpenAI API (GPT-4o-mini)
Testing:   Jest + Testing Library
Deploy:    Vercel
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or Supabase recommended)
- Cloudinary account
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eduverse-lms.git
cd eduverse-lms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"    # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
```

### 4. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔑 Demo Access

After seeding the database, contact the system administrator for login credentials. The seed script creates accounts for Admin, Teacher, and Student roles.

---

## 📁 Project Structure

```
eduverse-lms/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login page
│   │   ├── (dashboard)/
│   │   │   ├── admin/         # Admin dashboards
│   │   │   ├── teacher/       # Teacher dashboards
│   │   │   └── student/       # Student dashboards
│   │   ├── api/               # REST API routes
│   │   │   ├── auth/          # NextAuth routes
│   │   │   ├── users/         # User CRUD
│   │   │   ├── classes/       # Class management
│   │   │   ├── subjects/      # Subject management
│   │   │   ├── notes/         # Notes CRUD
│   │   │   ├── assignments/   # Assignment CRUD
│   │   │   ├── submissions/   # Submission handling
│   │   │   ├── grades/        # Grading system
│   │   │   ├── meetings/      # Virtual meetings
│   │   │   ├── announcements/ # Announcements
│   │   │   ├── upload/        # Cloudinary upload
│   │   │   └── ai/            # AI features
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── providers.tsx      # Context providers
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Sidebar, Header
│   │   ├── shared/            # Reusable components
│   │   ├── admin/             # Admin-specific
│   │   ├── teacher/           # Teacher-specific
│   │   └── student/           # Student-specific
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── cloudinary.ts      # File upload
│   │   ├── openai.ts          # AI integration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   ├── middleware.ts          # Route protection
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄 Database Schema

```
User ──────────────────── Class
  │                         │
  ├── (STUDENT) classId ────┤
  ├── (TEACHER) ClassTeacher┤
  │                         │
  ├── Note ─────── Subject ─┤── ClassSubject
  ├── Assignment ─────────  │
  │       │                 │
  │   Submission ──── Grade │
  ├── Meeting               │
  └── Announcement
```

---

## 🤖 AI Features

Powered by **OpenAI API** (GPT-4o-mini):

| Feature | Who | Where |
|---------|-----|-------|
| **Quiz Generator** | Students | Notes page — generate MCQ quizzes from notes |
| **Note Summarizer** | Students | Notes page — get key points instantly |
| **Feedback Assistant** | Teachers | Grading modal — AI suggests feedback & score |

> Set `OPENAI_API_KEY` in `.env.local`. AI features gracefully degrade if not configured.

---

## 🔐 Security

- ✅ Passwords hashed with `bcrypt` (12 rounds)
- ✅ JWT sessions via NextAuth
- ✅ Role-based middleware protection
- ✅ Input validation with Zod
- ✅ Rate limiting on API routes
- ✅ File upload validation (type + size)
- ✅ CSRF protection via NextAuth
- ✅ Secure headers via Next.js

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run tests |

---

## 🚀 Deployment on Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial EduVerse LMS setup"
git branch -M main
git remote add origin https://github.com/your-org/eduverse-lms.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project** → Import from GitHub
3. Select `eduverse-lms` repository
4. Framework: **Next.js** (auto-detected)

### Step 3: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add all variables from `.env.example`:

```
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-project.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
OPENAI_API_KEY=...
```

### Step 4: Set Up Database (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project → Get connection string
3. Set as `DATABASE_URL` in Vercel
4. After first deploy, run:

```bash
npx prisma db push
npx prisma db seed
```

Or use Vercel's build command: `prisma generate && prisma db push && next build`

### Step 5: Deploy

Click **Deploy** in Vercel. Your app is live!

---

## 🌐 Production Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random value
- [ ] `NEXTAUTH_URL` matches your Vercel domain
- [ ] `DATABASE_URL` is the production Neon connection string
- [ ] Cloudinary credentials are production keys
- [ ] OpenAI API key has sufficient credits
- [ ] `NODE_ENV` is `production`
- [ ] Database migrations/push run after deploy
- [ ] Database seeded (or admin user manually created)

---

## 🛠 Development Tips

### Reset Database
```bash
npm run db:reset  # ⚠️ Deletes all data!
npm run db:seed   # Re-seed
```

### View Database GUI
```bash
npm run db:studio
```

### Generate Prisma Client After Schema Changes
```bash
npx prisma generate
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

<div align="center">
  <p>Built with ❤️ for Kenyan Students</p>
  <p><strong>EduVerse LMS</strong> — Empowering Virtual Learning</p>
</div>

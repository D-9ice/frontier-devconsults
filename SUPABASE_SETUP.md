# Supabase Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Enter:
   - **Name:** `frontier-devconsults`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users (e.g., US East)
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (safe to use in frontend)

### Step 3: Add to Environment Variables

#### For Local Development:
Create `.env.local` file in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=YourSecurePasswordHere
```

#### For Vercel Deployment:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `ADMIN_PASSWORD` = your admin password

### Step 4: Create Database Tables

In Supabase Dashboard → **SQL Editor**, run these SQL commands:

```sql
-- 1. Contact Form Submissions
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded BOOLEAN DEFAULT FALSE
);

-- 2. Build Request Submissions
CREATE TABLE build_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  project_type VARCHAR(100) NOT NULL,
  budget VARCHAR(100),
  timeline VARCHAR(100),
  description TEXT NOT NULL,
  features TEXT,
  reference_links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded BOOLEAN DEFAULT FALSE
);

-- 3. Visitor Tracking
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(500) NOT NULL,
  referrer VARCHAR(500),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Apps (for App Store)
CREATE TABLE apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  size VARCHAR(50),
  rating DECIMAL(2,1),
  downloads VARCHAR(50),
  description TEXT NOT NULL,
  features TEXT[],
  requirements TEXT[],
  icon_url VARCHAR(500),
  play_store_link VARCHAR(500),
  download_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Projects (optional - for dynamic project management)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[],
  features TEXT[],
  logo_url VARCHAR(500),
  live_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_build_requests_created_at ON build_requests(created_at DESC);
CREATE INDEX idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX idx_visitors_page ON visitors(page);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_projects_status ON projects(status);
```

### Step 5: Enable Row Level Security (RLS)

For each table, run in SQL Editor:

```sql
-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for forms and visitor tracking)
CREATE POLICY "Allow public inserts" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON build_requests
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON visitors
  FOR INSERT TO anon WITH CHECK (true);

-- Allow public reads for apps and projects
CREATE POLICY "Allow public reads" ON apps
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow public reads" ON projects
  FOR SELECT TO anon USING (true);
```

### Step 6: Test the Connection

Run your dev server:
```bash
npm run dev
```

Try submitting a contact form or visiting pages - data should now save to Supabase!

---

## 📊 View Your Data

In Supabase Dashboard:
- **Table Editor** → See all your data in a spreadsheet-like view
- **SQL Editor** → Run custom queries
- **Database** → See table structures

---

## 🔧 Useful Queries

### Get today's visitor count:
```sql
SELECT COUNT(*) FROM visitors 
WHERE created_at >= CURRENT_DATE;
```

### Get total submissions:
```sql
SELECT 
  (SELECT COUNT(*) FROM contact_submissions) as contact_forms,
  (SELECT COUNT(*) FROM build_requests) as build_requests;
```

### Get unresponded submissions:
```sql
SELECT * FROM contact_submissions 
WHERE responded = false 
ORDER BY created_at DESC;
```

---

## ✅ You're All Set!

Your Frontier DevConsults website is now connected to Supabase! 🎉

**What's working:**
- ✅ Contact form submissions saved to database
- ✅ Build requests tracked
- ✅ Visitor analytics
- ✅ Real-time stats in admin dashboard

**Next steps:**
1. Deploy to Vercel with environment variables
2. Test all forms and features
3. Monitor data in Supabase dashboard
4. Set up email notifications for new submissions (optional)

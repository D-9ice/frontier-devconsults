# Frontier DevConsults - Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)
- Domain name (optional, Vercel provides free subdomain)

### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Frontier DevConsults website"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/frontier-devconsults.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Environment Variables
Add these in Vercel dashboard under Settings → Environment Variables:

```env
# Email Service (choose one)
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_api_key
# OR SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Dashboard
ADMIN_PASSWORD=YourSecurePasswordHere

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code
```

### Step 4: Custom Domain Setup
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain: `www.frontier-devconsults.com`
3. Update DNS records with your domain registrar:

#### For Cloudflare/Namecheap/GoDaddy:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (can take up to 48 hours)

### Step 5: SSL Certificate
- Vercel automatically provisions SSL certificates
- Your site will be accessible via HTTPS

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to Vercel environment variables: `RESEND_API_KEY`
4. Verify your domain in Resend dashboard

### Option 2: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key with "Mail Send" permissions
3. Add to Vercel: `SENDGRID_API_KEY`
4. Verify sender email

### Option 3: SMTP (Gmail)
1. Enable 2FA on your Google account
2. Generate App Password
3. Add credentials to Vercel environment variables

---

## 🔧 Post-Deployment Checklist

### Required Actions:
- [ ] Add logo images to `/public`:
  - `logo.png` (256x256px+)
  - `icon-192.png` (192x192px)
  - `icon-512.png` (512x512px)
  - `og-image.png` (1200x630px)

- [ ] Add project logos to `/public/logos`:
  - `macsunny-logo.png`
  - `lotto-logo.png`
  - `czan-logo.png`

- [ ] Test contact form submission
- [ ] Test request build form
- [ ] Verify WhatsApp button works
- [ ] Test all navigation links
- [ ] Verify mobile responsiveness
- [ ] Check PWA installation on mobile

### SEO Setup:
- [ ] Submit sitemap to Google Search Console: `https://www.frontier-devconsults.com/sitemap.xml`
- [ ] Add Google Analytics tracking (if desired)
- [ ] Verify Open Graph tags work (share on social media)
- [ ] Test site speed with [PageSpeed Insights](https://pagespeed.web.dev/)

### Security:
- [ ] Update `ADMIN_PASSWORD` in environment variables
- [ ] Enable Vercel's Edge Config for rate limiting (optional)
- [ ] Set up Vercel Analytics for monitoring

---

## 🌐 Alternative Deployment Options

### Deploy to Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

### Deploy to Your Own Server
```bash
# Build the project
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "frontier-devconsults" -- start
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔍 Troubleshooting

### Build Failures
- Clear Vercel cache: Settings → General → Clear Build Cache
- Check Node.js version (use 18.x or higher)
- Verify all dependencies are in `package.json`

### Email Not Sending
- Check environment variables are set correctly
- Verify API keys are active
- Check Vercel function logs for errors

### Images Not Loading
- Ensure images are in `/public` directory
- Check file names match exactly (case-sensitive)
- Verify image formats (PNG/JPEG/WebP)

### PWA Not Installing
- Ensure HTTPS is enabled
- Check service worker registration in browser DevTools
- Verify manifest.json is accessible

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable in Project Settings → Analytics
- View real-time traffic and performance metrics

### Google Analytics
1. Create GA4 property
2. Add tracking ID to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Deploy changes

---

## 🆘 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Test locally: `npm run dev`
4. Contact support: info@frontier-devconsults.com

---

## ✅ Deployment Complete!

Your Frontier DevConsults website should now be live at:
- Production: https://www.frontier-devconsults.com
- Vercel URL: https://frontier-devconsults.vercel.app

**Next Steps:**
1. Monitor form submissions in admin dashboard
2. Respond to client inquiries within 24-48 hours
3. Update projects as new ones are completed
4. Keep dependencies up to date: `npm update`

---

**Last Updated:** November 24, 2025  
**Version:** 1.0.0

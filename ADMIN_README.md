# Admin Access

## Login Credentials

**Admin Portal URL:** `/admin`

**Default Password:** `FrontierAdmin2024!`

## Keyboard Shortcut

Press **Ctrl + Shift + A** (or **Cmd + Shift + A** on Mac) from anywhere on the website to quickly access the admin login page.

## Security Notes

⚠️ **IMPORTANT:** For production use, you should:

1. **Change the password** by setting the `ADMIN_PASSWORD` environment variable in your deployment (Vercel):
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `ADMIN_PASSWORD` = `your-secure-password`

2. **Use strong authentication** - Consider implementing:
   - NextAuth.js for proper session management
   - Password hashing with bcrypt
   - JWT tokens for API authentication
   - Two-factor authentication (2FA)

3. **Add database integration** to store:
   - Form submissions
   - Contact requests
   - User activity logs

## Current Features

- ✅ Password-protected login
- ✅ Basic dashboard with stats
- ✅ Quick action buttons
- ✅ Logout functionality
- ✅ Keyboard shortcut access (Ctrl+Shift+A)

## Next Steps for Production

To make the admin dashboard fully functional:

1. Set up a database (PostgreSQL + Prisma recommended)
2. Create API endpoints for data management
3. Implement proper authentication system
4. Add pages for managing submissions and projects
5. Connect contact forms to database storage

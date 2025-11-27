# PWA (Progressive Web App) Testing Guide

## 🚀 How to Test the PWA Feature

### **Option 1: Test on Mobile (Recommended)**

#### **For Android:**

1. **Deploy to Vercel** (or use your live site)
   - PWA only works on HTTPS (not localhost on mobile)
   - After deploying, open your site: `https://www.frontier-devconsults.com`

2. **Open in Chrome/Edge on Android**
   - Navigate to your website
   - Look for the install prompt that appears at the bottom
   - **OR** tap the three dots menu (⋮) → "Install app" or "Add to Home screen"

3. **Install the PWA**
   - Tap "Install" or "Add"
   - The app icon will appear on your home screen

4. **Launch the App**
   - Tap the Frontier DevConsults icon on your home screen
   - It opens like a native app (no browser UI!)
   - Works offline with cached content

#### **For iPhone/iPad:**

1. **Open in Safari** (must be Safari on iOS)
   - Navigate to `https://www.frontier-devconsults.com`

2. **Install via Share Menu**
   - Tap the Share button (box with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Edit the name if desired
   - Tap "Add"

3. **Launch the App**
   - Tap the icon on your home screen
   - Opens in standalone mode

---

### **Option 2: Test on Desktop**

#### **Chrome/Edge:**

1. **Visit Your Live Site**
   - Go to `https://www.frontier-devconsults.com`
   - Look for the install icon in the address bar (⊕ or computer icon)

2. **Install**
   - Click the install icon
   - Or go to Menu (⋮) → "Install Frontier DevConsults"
   - Click "Install"

3. **Launch**
   - The app opens in its own window (no browser tabs!)
   - Access from your desktop/taskbar

#### **Alternative Desktop Testing:**

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Check:**
   - **Manifest:** See your app details (name, icons, theme color)
   - **Service Workers:** Should show as "activated and running"
   - **Cache Storage:** See cached resources

4. **Test Install:**
   - Click "Manifest" → "Add to home screen" link at bottom

---

### **Option 3: Test Locally (Desktop Only)**

1. **Run Dev Server with HTTPS:**
   ```bash
   npm run dev
   ```

2. **Visit** `http://localhost:3000`

3. **Note:** On localhost, some PWA features work differently:
   - Install prompt may not show
   - But service worker still registers
   - Check in DevTools → Application tab

---

## ✅ What to Test

### **Installation:**
- [ ] Install prompt appears on mobile
- [ ] App installs successfully
- [ ] Icon appears on home screen/desktop
- [ ] Icon matches your logo

### **App Experience:**
- [ ] Opens in standalone mode (no browser UI)
- [ ] Splash screen shows (on mobile)
- [ ] Theme color matches (blue for Frontier DevConsults)
- [ ] Navigation works smoothly
- [ ] All pages load correctly

### **Offline Functionality:**
- [ ] Turn off WiFi/Data
- [ ] Visit a previously loaded page
- [ ] Should show content (cached)
- [ ] Visit /offline for custom offline page

### **Updates:**
- [ ] Make a change to the site
- [ ] Deploy
- [ ] Reload the PWA
- [ ] Should prompt to update or auto-update

---

## 🔍 PWA Features Already Configured

✅ **Web App Manifest** (`/app/manifest.ts`)
- App name: "Frontier DevConsults"
- Theme color: Blue (#2563eb)
- Icons: 192x192 and 512x512
- Display: Standalone (fullscreen app mode)
- Start URL: /

✅ **Service Worker** (`/public/sw.js`)
- Caches static assets
- Enables offline viewing
- Custom offline page

✅ **Metadata** (in layout.tsx)
- Apple touch icons
- Theme colors
- Viewport settings

✅ **PWA Installer Component**
- Custom install prompt
- Better UX than browser default

---

## 📱 Current PWA Status

**Your Frontier DevConsults website is PWA-ready!**

All you need:
1. Icons (add these to `/public/`):
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `apple-touch-icon.png` (180x180px)

2. Deploy to Vercel (HTTPS required)

3. Test on mobile device!

---

## 🎨 Adding PWA Icons

### Quick Option:
Use your existing `frontier-logo.png`:

```bash
# Resize to 192x192
cd public/logos
sips -s format png -Z 192 frontier-logo.png --out ../icon-192.png

# Resize to 512x512
sips -s format png -Z 512 frontier-logo.png --out ../icon-512.png

# For Apple (180x180)
sips -s format png -Z 180 frontier-logo.png --out ../apple-touch-icon.png
```

### Or use online tools:
- [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)
- Upload your logo, download all sizes

---

## 🚀 After Adding Icons

1. Commit and push to GitHub
2. Vercel auto-deploys
3. Visit site on mobile
4. Install the PWA!

---

## ✨ PWA Benefits for Users

✅ **Install like a native app** - One tap from home screen
✅ **Offline access** - View cached content without internet
✅ **Fast loading** - Pre-cached resources
✅ **Native feel** - Fullscreen, no browser UI
✅ **Push notifications** (can add later)
✅ **Auto updates** - Always latest version

---

## 🔧 Troubleshooting

**Install button not showing?**
- Ensure site is HTTPS (works on Vercel)
- Check icons exist and are correct sizes
- Clear browser cache and reload
- On iOS, must use Safari

**Service worker not registering?**
- Check browser console for errors
- Verify `/public/sw.js` exists
- Try hard reload (Ctrl+Shift+R)

**Offline page not working?**
- Visit `/offline` while online first
- Then turn off internet and try again

---

**Your PWA is ready to go! Just add icons and deploy!** 🎉

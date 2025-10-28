# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

### 🚨 Error: ENOENT routes-manifest.json / Module Not Found

**Symptoms:**
```
Error: ENOENT: no such file or directory, open '.next/routes-manifest.json'
Cannot find module './vendor-chunks/...'
GET / 500 errors
```

**Cause:** Corrupted Next.js build cache

**Solution:**
```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
npm run dev
```

**Alternative (if above doesn't work):**
```bash
# Clean everything and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

### 🔑 Token/Authentication Issues

**Symptoms:**
- "Refresh token not found"
- "Invalid token"
- Unexpected logouts

**Solution 1: Clear Browser Storage**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh page and login again
```

**Solution 2: Check Token in LocalStorage**
```javascript
// In browser console:
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

---

### 💳 Payment Flow Issues

**Symptoms:**
- "Payment reference not found"
- Stuck on callback page
- Payment completed but request not created

**Solution 1: Check LocalStorage**
```javascript
// In browser console:
console.log('Pending Payment:', localStorage.getItem('pendingPaymentReference'));
console.log('Pending Request:', localStorage.getItem('pendingServiceRequest'));
```

**Solution 2: Clear Payment Data and Retry**
```javascript
// In browser console:
localStorage.removeItem('pendingPaymentReference');
localStorage.removeItem('pendingServiceRequest');
// Then try booking again
```

---

### 🌐 API Connection Issues

**Symptoms:**
- "Network Error"
- "Cannot connect to server"
- CORS errors

**Check Backend Server:**
```bash
# Ensure backend is running on port 8000
curl http://localhost:8000/api/
# or
curl https://serviceman-backend.onrender.com/api/
```

**Check API Base URL:**
```javascript
// In browser console:
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
```

---

### 📝 Form Submission Errors

**Symptoms:**
- Field validation errors
- "This field is required"
- Form not submitting

**Check Console:**
```javascript
// Form data should be logged:
📤 [Booking] Request data prepared: {...}
```

**Common Issues:**
- Date not formatted correctly (must be YYYY-MM-DD)
- Address too short (minimum 10 characters)
- Description too short (minimum 20 characters)
- Category not selected

---

### 🔄 Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Old code still running
- Need to refresh manually

**Solution:**
```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

---

### 📦 Package/Dependency Issues

**Symptoms:**
- Module not found errors
- Import errors
- TypeScript errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### 🎨 CSS/Styling Issues

**Symptoms:**
- Styles not applying
- Bootstrap not working
- Icons not showing

**Check Bootstrap:**
```html
<!-- Should be in layout.tsx or page -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

**Check Bootstrap Icons:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
```

---

### 🐛 TypeScript Errors

**Symptoms:**
- Red underlines in IDE
- Build fails with type errors

**Solution 1: Check Types**
```bash
npx tsc --noEmit
```

**Solution 2: Restart TS Server**
- In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

**Solution 3: Regenerate Types**
```bash
npm run build
```

---

### 📱 Mobile/Responsive Issues

**Symptoms:**
- Layout broken on mobile
- Buttons not clickable
- Text overflow

**Check in Browser DevTools:**
- Toggle device toolbar (F12 → Ctrl+Shift+M)
- Test various screen sizes
- Check for z-index issues

---

## Quick Fixes

### Nuclear Option (Clean Everything):
```bash
# Stop all servers
# Delete everything and start fresh
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Check Everything is Running:
```bash
# Backend should be on port 8000
curl http://localhost:8000/api/

# Frontend should be on port 3000
curl http://localhost:3000/
```

### Reset Database (Backend):
```bash
# In backend directory
python manage.py migrate
python manage.py createsuperuser
```

---

## Debug Checklist

Before asking for help, check:

- [ ] Is the backend server running?
- [ ] Is the frontend dev server running?
- [ ] Are there any errors in browser console?
- [ ] Are there any errors in terminal?
- [ ] Have you cleared browser cache/storage?
- [ ] Have you tried deleting .next folder?
- [ ] Are you logged in with the correct user type?
- [ ] Is your internet connection working?

---

## Useful Commands

### Development:
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Debugging:
```bash
rm -rf .next         # Clear build cache
rm -rf node_modules  # Remove dependencies
npm install          # Reinstall dependencies
npx tsc --noEmit     # Check TypeScript errors
```

### Browser Console:
```javascript
// Check tokens
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')

// Clear storage
localStorage.clear()
sessionStorage.clear()

// Check API calls
// Open Network tab in DevTools (F12)
```

---

## Getting Help

If you're still stuck:

1. **Check the error message carefully**
   - Copy the exact error
   - Note which page/action causes it

2. **Check browser console**
   - F12 → Console tab
   - Look for red error messages

3. **Check terminal output**
   - Look for error messages
   - Note the exact endpoint/request

4. **Provide details:**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Any error messages?
   - Browser and OS?

---

## Prevention Tips

✅ **Always:**
- Keep dev server running while coding
- Check console for warnings
- Test changes in browser
- Commit working code

❌ **Avoid:**
- Editing files while server is building
- Ignoring TypeScript errors
- Skipping git commits
- Deleting important files

---

**Most Common Solution:** Delete `.next` folder and restart! 🔄


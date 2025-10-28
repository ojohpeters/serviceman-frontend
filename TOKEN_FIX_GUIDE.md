# 🔧 Token/Login Issues - Quick Fix Guide

## Problem: "Refresh Token Not Found" Error

### Symptoms:
- Users can't login or get logged out immediately
- "No refresh token available" error in console
- Automatic logout after login

---

## 🎯 Quick Fixes

### Fix 1: Clear Browser Storage & Login Again

**Steps:**
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Close and reopen browser
4. Login again

### Fix 2: Use Token Debugger

**Steps:**
1. After logging in, click the **"Debug"** button (bottom right corner)
2. Check if both tokens are present:
   - ✅ Access Token: Should show "Present"
   - ✅ Refresh Token: Should show "Present"
3. If either is missing, click "Clear Tokens" and login again

### Fix 3: Check Browser Console Logs

After login, you should see:
```
🔐 [Auth] Login successful
🔑 [Auth] Access token received: Yes ✅
🔄 [Auth] Refresh token received: Yes ✅
💾 [Auth] Access token stored: Yes ✅
💾 [Auth] Refresh token stored: Yes ✅
```

If you see any ❌, that's the problem!

---

## 🐛 Common Causes

### 1. Backend Not Returning Refresh Token
**Check:** Backend login response should include both `access` and `refresh` tokens

**Test in console:**
```javascript
fetch('https://serviceman-backend.onrender.com/api/users/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Backend response:', data);
  console.log('Has access token:', !!data.access);
  console.log('Has refresh token:', !!data.refresh);
});
```

### 2. LocalStorage Not Working
**Check:** Browser privacy settings might block localStorage

**Test:**
```javascript
// In console
localStorage.setItem('test', 'value');
console.log('Test value:', localStorage.getItem('test'));
localStorage.removeItem('test');
```

### 3. Too Fast Redirect
**Problem:** Page redirects before tokens are saved

**Solution:** Already implemented with verification logging

---

## ✅ Implemented Fixes

### 1. Enhanced Login Logging
- ✅ Logs every step of token storage
- ✅ Validates tokens before storing
- ✅ Verifies tokens after storing
- ✅ Shows detailed error messages

### 2. Token Debugger Component
- ✅ Visual token status display
- ✅ Real-time token monitoring
- ✅ Clear tokens button
- ✅ LocalStorage keys viewer

### 3. Better Error Handling
- ✅ Detailed console logs
- ✅ Smart redirect (admin → /admin/login, others → /auth/login)
- ✅ Prevents loops

---

## 📋 Debug Checklist

When a user reports login issues:

1. ☐ Ask them to open browser console (F12)
2. ☐ Have them try logging in
3. ☐ Check for these console messages:
   - 🔐 Login successful?
   - 🔑 Tokens received?
   - 💾 Tokens stored?
4. ☐ Use Token Debugger to verify token presence
5. ☐ If tokens missing, clear localStorage and retry
6. ☐ If still failing, check backend logs

---

## 🔍 Testing Token Flow

### Test Script:
```javascript
// Run in console BEFORE login
console.log('=== BEFORE LOGIN ===');
console.log('Tokens:', localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'));

// Then login through UI

// After login, check again
console.log('=== AFTER LOGIN ===');
console.log('Access:', localStorage.getItem('accessToken') ? 'Present ✅' : 'Missing ❌');
console.log('Refresh:', localStorage.getItem('refreshToken') ? 'Present ✅' : 'Missing ❌');
```

---

## 🚀 For Developers

### How Token Flow Works:

1. **Login** → Backend returns { access, refresh }
2. **Store** → Both tokens saved to localStorage
3. **Use** → Access token attached to all API requests
4. **Expire** → When access token expires (401 error)
5. **Refresh** → System uses refresh token to get new access token
6. **Continue** → Request retried with new access token

### Where Tokens Are Used:

- **Login**: `auth.ts` → stores tokens
- **API Calls**: `api.ts` → attaches access token
- **Refresh**: `api.ts` interceptor → uses refresh token
- **Logout**: `auth.ts` → clears both tokens

---

## ⚡ Quick Solutions

### Solution 1: Force Clear & Re-login
```javascript
// Run in console
localStorage.clear();
sessionStorage.clear();
window.location.href = '/auth/login';
```

### Solution 2: Manual Token Check
```javascript
// Check what's actually stored
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### Solution 3: Test Token Refresh
```javascript
// Test if refresh token works
fetch('https://serviceman-backend.onrender.com/api/users/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh: localStorage.getItem('refreshToken')
  })
})
.then(res => res.json())
.then(data => console.log('Refresh result:', data))
.catch(err => console.error('Refresh failed:', err));
```

---

## 📞 If Still Not Working

### Contact Backend Team:
- Verify `/api/users/token/` returns both `access` AND `refresh` tokens
- Check token expiration times
- Verify `/api/users/token/refresh/` endpoint works
- Check CORS settings

### Frontend Checklist:
- ✅ Tokens being stored? (Check with debugger)
- ✅ Tokens being retrieved? (Check console logs)
- ✅ Refresh endpoint being called? (Check Network tab)
- ✅ LocalStorage working? (Test with test key)

---

## 🎉 With New Enhancements

You now have:
- ✅ Detailed login logging
- ✅ Token validation
- ✅ Visual token debugger
- ✅ Better error messages
- ✅ Smart redirects

**Users should be able to login successfully now!**

If the issue persists, use the Token Debugger to see exactly what's happening with the tokens.


# 🐛 Category Creation Debug Guide

## Issue: Internal Server Error (500)

### Quick Fixes to Try:

#### 1. **Leave Icon URL Empty**
The icon_url field might be causing issues. Try creating a category WITHOUT an icon URL first.

#### 2. **Check Your Admin Status**
Run this in browser console:
```javascript
fetch('https://serviceman-backend.onrender.com/api/users/me/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(res => res.json())
.then(data => console.log('Your user:', data));
```

Make sure it shows `user_type: "ADMIN"`

#### 3. **Test Direct API Call**
```javascript
fetch('https://serviceman-backend.onrender.com/api/services/categories/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  body: JSON.stringify({
    name: 'Test Category',
    description: 'Test Description'
  })
})
.then(async res => {
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
  return data;
})
.catch(err => console.error('Error:', err));
```

#### 4. **Try Alternative Endpoint**
The backend might use `/api/categories/` instead:
```javascript
fetch('https://serviceman-backend.onrender.com/api/categories/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  body: JSON.stringify({
    name: 'Test Category 2',
    description: 'Test Description 2'
  })
})
.then(async res => {
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
})
.catch(err => console.error('Error:', err));
```

### What to Look For:

1. **Console Logs** - Check what error details are shown
2. **Network Tab** - Look at the actual request/response
3. **Backend Response** - Look for specific error messages like:
   - "Field X is required"
   - "Invalid data format"
   - Database errors

### If Still Failing:

The 500 error is on the backend. You need to:
1. Check backend server logs
2. Verify database is working
3. Check if the endpoint actually exists
4. Verify admin permissions in backend

### Contact Backend Team With:
- The exact request body you're sending
- Your user ID and user_type
- The error response from backend
- Backend logs if accessible


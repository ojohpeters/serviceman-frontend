# 🔴 Backend API Fixes Required

## Critical Issue: Serviceman Profile Endpoints Not Returning User Object

### Problem
The public serviceman profile endpoint `/api/users/servicemen/<id>/` is currently returning `user` as just an ID number instead of a full user object.

**Current Response (❌ INCORRECT):**
```json
{
  "user": 42,  // ❌ Just an ID
  "category": 1,
  "skills": [],
  "rating": "4.70",
  "bio": "...",
  "years_of_experience": 12
}
```

**Expected Response (✅ CORRECT - per API documentation v2.0):**
```json
{
  "user": {
    "id": 42,
    "username": "john_plumber",
    "email": "john@example.com",
    "full_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "SERVICEMAN",
    "is_email_verified": true
  },
  "category": {
    "id": 1,
    "name": "Plumbing",
    "icon": "🔧"
  },
  "skills": [...],
  "rating": "4.70",
  "bio": "...",
  "years_of_experience": 12
}
```

### Impact
- ❌ Serviceman names show as "Service Professional" (fallback) on public profile pages
- ❌ Cannot display real serviceman names on `/servicemen/<id>` pages
- ❌ Poor user experience - users can't see who they're booking

### Affected Endpoints
1. **`GET /api/users/servicemen/<id>/`** (Public - most critical)
2. **`GET /api/users/servicemen/`** (Public listing)
3. **`GET /api/users/admin/pending-servicemen/`** (Admin view)

### Django Backend Fix

**File:** `your_django_project/users/serializers.py`

```python
from rest_framework import serializers
from .models import ServicemanProfile, User

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer for user info in serviceman profiles"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'first_name', 'last_name', 'user_type', 'is_email_verified']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Return full name or username as fallback"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username

class ServicemanProfileSerializer(serializers.ModelSerializer):
    # ✅ CRITICAL: Expand user object instead of just showing ID
    user = UserBasicSerializer(read_only=True)
    
    # ✅ Also expand category
    category = CategoryBasicSerializer(read_only=True)
    
    class Meta:
        model = ServicemanProfile
        fields = [
            'id', 'user', 'category', 'skills', 'rating',
            'total_jobs_completed', 'active_jobs_count',
            'bio', 'years_of_experience', 'phone_number',
            'is_approved', 'is_available',
            'availability_status', 'created_at', 'updated_at',
            'approved_at', 'approved_by', 'rejection_reason'
        ]
```

**File:** `your_django_project/users/views.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import ServicemanProfile
from .serializers import ServicemanProfileSerializer

@api_view(['GET'])
@permission_classes([AllowAny])  # Public endpoint
def get_serviceman_by_id(request, pk):
    """
    Get public serviceman profile by ID
    ✅ CRITICAL: Use select_related to fetch user in same query
    """
    try:
        serviceman = ServicemanProfile.objects.select_related(
            'user',        # ✅ Fetch user object (not just ID)
            'category'     # ✅ Fetch category object
        ).prefetch_related(
            'skills'       # ✅ Fetch skills
        ).get(pk=pk, is_approved=True)
        
        serializer = ServicemanProfileSerializer(serviceman)
        return Response(serializer.data)
    except ServicemanProfile.DoesNotExist:
        return Response(
            {"detail": "Serviceman not found or not approved"},
            status=404
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_pending_servicemen(request):
    """
    Get all pending serviceman applications (Admin)
    ✅ Optimized with select_related
    """
    servicemen = ServicemanProfile.objects.select_related(
        'user',           # ✅ Fetch user
        'category',       # ✅ Fetch category
        'approved_by'
    ).prefetch_related(
        'skills'
    ).filter(is_approved=False).order_by('-created_at')
    
    serializer = ServicemanProfileSerializer(servicemen, many=True)
    return Response(serializer.data)
```

### How to Verify Fix

1. **Deploy Backend Changes**
2. **Test Endpoints:**
   ```bash
   # Test public profile endpoint
   curl http://localhost:8000/api/users/servicemen/22/
   
   # Should return user as object, not just ID:
   # "user": { "id": 22, "username": "...", "full_name": "..." }
   ```

3. **Frontend Verification:**
   - Visit `/servicemen/22` in frontend
   - ✅ **PASS:** Real serviceman name shows (not "Service Professional")
   - ✅ **PASS:** Years of experience displays correctly
   - ✅ **PASS:** Red warning banner at top should **disappear**

4. **Admin Panel Verification:**
   - Visit `/admin/servicemen` in frontend
   - ✅ **PASS:** Serviceman names show (not "User #ID")
   - ✅ **PASS:** Emails display correctly (not "N/A")
   - ✅ **PASS:** Yellow warning banner should **disappear**

### Performance Benefit

Using `select_related('user', 'category')` reduces database queries:

**Before (N+1 problem):**
```
1 query to get serviceman
1 query to get user (per serviceman)
1 query to get category (per serviceman)
= 3 queries per serviceman (15 servicemen = 45 queries!)
```

**After (Optimized):**
```
1 query to get all servicemen with user and category
= 1-2 queries total regardless of count
```

### Priority: 🔴 **CRITICAL**

This issue affects core functionality and user experience. Users cannot see serviceman names or make informed booking decisions.

---

## Frontend Workaround (Temporary)

The frontend has implemented graceful handling:
- Shows "Service Professional" as fallback when `user` is just an ID
- Displays prominent warning banners to alert developers
- Comprehensive console logging for debugging
- All features work, but with degraded UX

**However, this is a temporary workaround. Backend fix is still required for proper functionality.**

---

**Last Updated:** November 5, 2025  
**Reported By:** Frontend Team  
**Status:** 🔴 Awaiting Backend Fix




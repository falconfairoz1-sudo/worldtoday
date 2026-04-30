# Authentication System Troubleshooting Guide

## Current Status
✅ **Backend Authentication System**: Fully implemented and configured
✅ **Frontend Authentication System**: Properly structured with React Context
✅ **API Endpoints**: All auth endpoints are available and working
✅ **CORS Configuration**: Properly configured for Vercel deployment
✅ **JWT Token System**: Implemented with proper validation
✅ **User Model**: Complete with password hashing and validation

## Authentication Flow
1. **Registration**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Profile**: `GET /api/auth/me` (requires JWT token)
4. **Bookmarks**: `GET /api/user/bookmarks` (requires JWT token)

## Common Issues and Solutions

### 1. "Login/Register not working"
**Possible Causes:**
- Backend server not responding
- Network connectivity issues
- CORS issues
- Invalid credentials
- Frontend-backend communication problems

**Solutions:**
- Check if backend is running: https://worldtoday.onrender.com/health
- Verify network connection
- Check browser console for errors
- Try with different credentials

### 2. "Token not being saved"
**Possible Causes:**
- localStorage issues
- Token not being returned from backend
- JWT secret mismatch

**Solutions:**
- Check browser localStorage for 'token' key
- Verify JWT_SECRET is set in backend environment
- Check network tab for API responses

### 3. "User not staying logged in"
**Possible Causes:**
- Token expiration
- AuthContext not loading user properly
- API interceptor issues

**Solutions:**
- Check token expiration (30 days default)
- Verify AuthContext loadUser function
- Check API interceptors for token attachment

## Testing the Authentication System

### Manual Testing Steps:
1. Go to https://worldtoday.vercel.app/register
2. Fill out registration form with valid data
3. Check if user is redirected to home page
4. Verify user appears in navbar (should show name)
5. Try logging out and logging back in
6. Test bookmark functionality

### API Testing:
```bash
# Test registration
curl -X POST https://worldtoday.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123","country":"us","language":"en"}'

# Test login
curl -X POST https://worldtoday.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## Debug Components Added
- **AuthStatus Component**: Shows current authentication state and allows testing
- **Enhanced API Logging**: Detailed console logs for API requests
- **Better Error Handling**: Comprehensive error messages and debugging info

## Environment Variables Required
```
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
```

## Files Modified for Authentication Fix
- `client/src/utils/api.js` - Enhanced error handling and logging
- `client/src/context/AuthContext.js` - Better debugging and error handling
- `client/src/pages/Login.js` - Improved error messages
- `client/src/pages/Register.js` - Improved error messages
- `client/src/components/AuthStatus.js` - Debug component for testing
- `client/src/components/Navbar.js` - Auth status indicator

## Next Steps if Issues Persist
1. Check browser console for JavaScript errors
2. Check network tab for failed API requests
3. Verify backend logs for authentication errors
4. Test with different browsers/devices
5. Check if ad blockers are interfering
6. Verify environment variables are set correctly

## Backend Health Check
Always verify backend is running: https://worldtoday.onrender.com/health

## Contact Information
If authentication issues persist, check:
- Backend logs on Render dashboard
- Frontend console errors
- Network connectivity
- Environment variable configuration
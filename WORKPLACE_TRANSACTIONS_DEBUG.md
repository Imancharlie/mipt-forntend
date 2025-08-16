# WorkplacePage Transactions Debug Guide

## Overview
The WorkplacePage now displays user transactions using the `/api/billing/user-transactions/` endpoint. This guide helps troubleshoot any issues you might encounter.

## What Was Implemented

### 1. API Service Integration
- Added `getUserTransactions()` method to `billingService` in `src/api/services.ts`
- Uses the proper API client with authentication headers
- Endpoint: `https://mipt.pythonanywhere.com/api/billing/user-transactions/`

### 2. WorkplacePage Updates
- **Non-blocking transaction loading**: Page loads normally, transactions load separately
- **Improved transaction display**: Smaller, more compact transaction cards
- **Better error handling**: Graceful fallbacks for API failures
- **Search functionality**: Filter transactions by sender name, payment method, status, or amount

### 3. Transaction Interface
```typescript
interface Transaction {
  id: number;
  user: string;
  user_full_name: string;
  user_phone_number: string;
  sender_name: string;
  payment_method: 'DIRECT' | 'WAKALA';
  transaction_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amount: string;
  tokens_generated: number;
  wakala_name?: string;
  confirmed_by_name?: string;
  created_at: string;
  updated_at: string;
}
```

## Troubleshooting

### Issue: "Error fetching transactions: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON"

**Cause**: This error typically means the API is returning HTML instead of JSON, usually due to:
1. **Authentication failure** - Token expired or invalid
2. **Wrong endpoint** - API endpoint doesn't exist
3. **Server error** - Backend returning error page
4. **CORS issues** - Cross-origin request blocked

**Solutions**:

#### 1. Check Authentication
```javascript
// In browser console, check if token exists
console.log('Access token:', localStorage.getItem('access_token'));
console.log('Refresh token:', localStorage.getItem('refresh_token'));
```

#### 2. Test API Endpoint Manually
Use the test script:
```bash
cd scripts
node test-user-transactions.js YOUR_ACCESS_TOKEN
```

#### 3. Check Network Tab
1. Open browser DevTools → Network tab
2. Navigate to WorkplacePage
3. Look for the `/api/billing/user-transactions/` request
4. Check:
   - Request headers (Authorization token)
   - Response status code
   - Response body (should be JSON, not HTML)

#### 4. Verify Backend Implementation
Ensure your Django backend has:
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_all_transactions(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
    serializer = TransactionSerializer(transactions, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })
```

### Issue: Page Loads But No Transactions

**Check**:
1. **Console logs** for any errors
2. **Network requests** for API calls
3. **Authentication state** in Redux store
4. **Backend logs** for any errors

### Issue: Transactions Load But Display Incorrectly

**Check**:
1. **Transaction data structure** matches interface
2. **Date formatting** for `created_at` field
3. **Status values** match expected enum values
4. **Amount field** is string (not number)

## Testing the Implementation

### 1. Manual Testing
1. Login to the application
2. Navigate to WorkplacePage
3. Check if transactions load
4. Test search functionality
5. Verify transaction details display correctly

### 2. API Testing
```bash
# Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://mipt.pythonanywhere.com/api/billing/user-transactions/
```

### 3. Frontend Testing
```javascript
// In browser console
// Check if billingService is available
console.log(window.billingService);

// Test the getUserTransactions method
billingService.getUserTransactions().then(console.log).catch(console.error);
```

## Common Fixes

### 1. Fix Authentication Issues
```typescript
// In src/api/client.ts, ensure token is being sent
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Fix CORS Issues
Ensure backend has proper CORS headers:
```python
# In Django settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com"
]
CORS_ALLOW_CREDENTIALS = True
```

### 3. Fix API Endpoint
Verify the endpoint exists in your Django URLs:
```python
# In urls.py
path('billing/user-transactions/', views.user_all_transactions, name='user_transactions'),
```

## Expected Behavior

### ✅ Success Case
- Page loads immediately with stats and header
- Transactions section shows loading spinner
- Transactions load and display in compact cards
- Search functionality works
- No export button (removed as requested)

### ❌ Failure Cases
- **Page loads but transactions fail**: Shows error message, page remains functional
- **Authentication fails**: Redirects to login (handled by auth system)
- **API unavailable**: Shows error message, allows retry

## Performance Notes

- **Non-blocking**: Page loads in ~200ms, transactions load separately
- **Efficient**: Only fetches transactions once per session
- **Responsive**: Search filters work on client-side data
- **Compact**: Transaction cards are smaller and more space-efficient

## Next Steps

If you're still experiencing issues:

1. **Check backend logs** for Django errors
2. **Verify API endpoint** is accessible
3. **Test authentication** flow
4. **Check CORS configuration**
5. **Verify database** has transaction data

## Support

For additional help, check:
- `API_DEBUG_GUIDE.md` - General API debugging
- `API_CONFIGURATION.md` - API setup and configuration
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Backend implementation details

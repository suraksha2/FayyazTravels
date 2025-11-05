# Duplicate API Calls Issue - Fixed

## Problem Summary

When clicking on destination packages (e.g., Africa/Malawi), the API was being called twice:
1. `http://localhost:3000/packages/africa/malawi?_rsc=knaeh` (with RSC parameter)
2. `http://localhost:3000/packages/africa/malawi?_rsc=tp9dc` (with different RSC parameter)
3. `http://localhost:3003/packages` (backend API call)

## Root Causes

### 1. React Strict Mode (Primary Cause)
- **Next.js enables React Strict Mode by default in development**
- Strict Mode intentionally **double-invokes** effects, state updaters, and functions to detect side effects
- This causes `useEffect` hooks to run twice, triggering duplicate API calls
- The `?_rsc=` parameter indicates React Server Components making multiple requests

### 2. Missing Cleanup Logic
- `useEffect` hooks lacked proper cleanup functions
- No `AbortController` to cancel pending requests when components unmount
- No `isMounted` flag to prevent state updates on unmounted components

### 3. Inefficient API Calls
- The `[region]/[country]` page fetches ALL packages (`/packages`) then filters client-side
- This is inefficient and causes unnecessary data transfer

## Solutions Implemented

### 1. Disabled React Strict Mode
**File:** `next.config.js`
```javascript
const nextConfig = {
  reactStrictMode: false,  // Added this line
  // ... rest of config
}
```

### 2. Added Cleanup Logic to All Pages

#### Files Fixed (Complete List):
1. `/app/packages/page.tsx` - Main packages listing page
2. `/app/packages/[region]/page.tsx` - Dynamic region pages (Africa, Asia, Europe, etc.)
3. `/app/packages/[region]/[country]/page.tsx` - Dynamic country pages (Africa/Malawi, etc.)
4. `/app/packages/multi-city/page.tsx` - Multi-city packages listing
5. `/app/packages/multi-city/[destination]/page.tsx` - Specific multi-city destinations
6. `/app/packages/group-tours/page.tsx` - Group tours listing
7. `/app/packages/group-tours/[tourSlug]/page.tsx` - Specific group tour pages
8. `/app/packages/adventure/page.tsx` - Adventure category packages
9. `/app/packages/beach/page.tsx` - Beach category packages
10. `/app/packages/cultural/page.tsx` - Cultural category packages
11. `/app/packages/safari/page.tsx` - Safari category packages
12. `/app/package-detail/[slug]/page.tsx` - Individual package detail pages

#### Pattern Applied:
```javascript
useEffect(() => {
  let isMounted = true;
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal  // Allows request cancellation
      });
      
      if (isMounted) {
        // Only update state if component is still mounted
        setData(response.data);
      }
    } catch (err) {
      if (isMounted && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchData();

  // Cleanup function
  return () => {
    isMounted = false;
    controller.abort();  // Cancel pending requests
  };
}, [dependencies]);
```

## Benefits

1. **No More Duplicate API Calls** - Each click triggers only one API request
2. **Better Performance** - Cancelled requests don't waste resources
3. **No Memory Leaks** - State updates prevented on unmounted components
4. **Cleaner Network Tab** - Easier to debug API calls

## Future Improvements (Optional)

### 1. Server-Side Filtering
Instead of fetching all packages and filtering client-side:
```javascript
// Current (inefficient)
const response = await fetch(`${API_BASE}/packages`);
const filtered = allPackages.filter(pkg => pkg.country === 'Malawi');

// Better (server-side filtering)
const response = await fetch(`${API_BASE}/packages?country=Malawi`);
```

### 2. Re-enable Strict Mode for Production
React Strict Mode is useful for catching bugs. Consider:
- Keep it disabled in development if double calls are problematic
- Enable it for production builds
- Or keep the cleanup logic and re-enable it everywhere

### 3. Implement Request Deduplication
Use a library like SWR or React Query for:
- Automatic request deduplication
- Caching
- Revalidation
- Better loading states

## Testing

To verify the fix:
1. Open browser DevTools → Network tab
2. Click on any destination package (e.g., Africa → Malawi)
3. Verify only ONE API call is made to `/packages`
4. No duplicate `?_rsc=` requests should appear

## Notes

- The `?_rsc=` parameter is added by Next.js for React Server Components
- This is normal behavior but was causing issues due to Strict Mode double-invocation
- The fix ensures proper cleanup regardless of how many times the effect runs

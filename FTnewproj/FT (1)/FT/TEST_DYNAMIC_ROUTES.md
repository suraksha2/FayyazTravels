# Testing Dynamic Routes

## Quick Test URLs

Once your development server is running, test these URLs:

### Region Pages (Should work immediately)
- http://localhost:3000/packages-dynamic/asia
- http://localhost:3000/packages-dynamic/africa

### Country Pages (Should work immediately)
- http://localhost:3000/packages-dynamic/asia/uzbekistan
- http://localhost:3000/packages-dynamic/asia/sri-lanka
- http://localhost:3000/packages-dynamic/asia/japan
- http://localhost:3000/packages-dynamic/africa/egypt
- http://localhost:3000/packages-dynamic/africa/kenya

## What to Verify

### ✅ Region Page Should Show:
1. Large hero section with region name (e.g., "ASIA")
2. Region description
3. "Enquire Now" button
4. Horizontal scrollable list of countries
5. Grid of packages for that region
6. Newsletter signup section

### ✅ Country Page Should Show:
1. Large hero section with country name (e.g., "UZBEKISTAN")
2. Country description
3. "Enquire Now" button
4. Grid of packages for that country
5. Newsletter signup section

### ✅ Functionality to Test:
- [ ] Clicking on a country card navigates to country page
- [ ] Clicking on a package card navigates to package details
- [ ] "Enquire Now" button opens enquiry modal
- [ ] Heart icon on packages doesn't trigger navigation
- [ ] "Book Now" button navigates to booking page
- [ ] Newsletter email input works
- [ ] Loading spinner shows while fetching data
- [ ] Error message shows if API fails
- [ ] "No packages" message shows if no data

## Expected API Calls

### For Region Page (e.g., /packages-dynamic/asia):
```
GET http://localhost:3003/packages/asia
```

### For Country Page (e.g., /packages-dynamic/asia/uzbekistan):
```
GET http://localhost:3003/destination/asia/asia-uzbekistan
```

## Common Issues & Solutions

### Issue: "Region not found"
**Solution:** Check that the region slug in URL matches a slug in `regions-config.ts`

### Issue: "Country not found"  
**Solution:** Check that the country slug exists under the correct region in `regions-config.ts`

### Issue: No packages loading
**Solution:** 
1. Check browser console for API errors
2. Verify backend is running on port 3003
3. Check API endpoint in `regions-config.ts` matches backend routes

### Issue: Images not loading
**Solution:** 
1. Check image URLs in `regions-config.ts`
2. Verify API_BASE environment variable
3. Check browser console for CORS errors

## Next Steps After Testing

1. **If tests pass:** Add remaining regions to `regions-config.ts`
2. **If tests fail:** Check console errors and fix issues
3. **After all regions added:** Update navigation links throughout the app
4. **Final step:** Rename `/packages-dynamic/` to `/packages/` and remove old files

## Performance Check

Open browser DevTools → Network tab and verify:
- [ ] Only ONE API call per page (not multiple)
- [ ] Images load efficiently
- [ ] No unnecessary re-renders
- [ ] Page loads in < 2 seconds

## Mobile Testing

Test on mobile viewport:
- [ ] Hero text is readable
- [ ] Country cards scroll horizontally
- [ ] Package grid stacks vertically
- [ ] Buttons are tappable
- [ ] Newsletter form is usable

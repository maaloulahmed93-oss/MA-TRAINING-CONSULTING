# URL Field Persistence Debugging

## Issue
URL field shows in the form but doesn't persist to the database or appear on the public website.

## Data Flow Trace

### 1. Frontend Form (Admin Panel)
- ✅ URL input field exists and is properly bound to `courseFormData.url`
- ✅ `handleUpdateCourse()` sends URL to API
- ✅ Logging added to verify URL is in form data

### 2. API Request (Admin Panel → Backend)
- ✅ `updateCourse()` method sends URL in request body
- ✅ Logging added to verify URL is sent in request
- ✅ Request body includes: `{ title, description, url }`

### 3. Backend Route (PUT /admin/courses/:id)
- ✅ Route receives URL in request body
- ✅ Logging added to verify URL is received
- ✅ Creates updateData object with URL field
- ✅ Calls `Course.findOneAndUpdate()` with updateData

### 4. MongoDB Update
- ⚠️ **POTENTIAL ISSUE**: URL might not be persisting to database
- Need to verify: Is Mongoose actually saving the URL field?

### 5. Backend Response
- ✅ Route returns updated course object
- ✅ Logging added to verify URL in response

### 6. Frontend Data Reload
- ✅ `loadData()` is called after update
- ✅ `fetchCoursesForDomain()` retrieves courses from API
- ✅ URL field is included in course object

### 7. Public API (GET /domains)
- ✅ Backend returns URL field in response
- ✅ Logging added to verify URL is in database

### 8. Public Website
- ✅ `getDomains()` receives data from API
- ✅ Logging added to verify URL is received
- ✅ `handleCourseAccess()` checks for URL
- ⚠️ **ISSUE**: URL is undefined, so alert shows "No URL configured"

## Hypothesis

The URL field is likely **NOT being saved to MongoDB** because:

1. The Mongoose schema has `url` field defined
2. The update operation includes the URL
3. But the URL might be empty in the database

## Verification Steps

### Check 1: Verify URL is in courseFormData
```javascript
// In handleUpdateCourse, before API call
console.log('URL value:', courseFormData.url);
console.log('URL type:', typeof courseFormData.url);
console.log('URL length:', courseFormData.url?.length);
```

### Check 2: Verify URL is sent in API request
```javascript
// In updateCourse method
console.log('Request body:', { title, description, url });
```

### Check 3: Verify URL is received by backend
```javascript
// In PUT /admin/courses/:id route
console.log('Received URL:', url);
console.log('URL type:', typeof url);
console.log('URL is empty:', !url || url.trim() === '');
```

### Check 4: Verify URL is saved to MongoDB
```javascript
// After findOneAndUpdate
console.log('Saved URL:', course.url);
console.log('URL in DB:', course.toObject().url);
```

### Check 5: Verify URL is returned in GET /domains
```javascript
// In GET /domains route
console.log('Course URL from DB:', course.url);
console.log('URL in response:', { ...course, url: course.url });
```

## Possible Solutions

### Solution 1: Ensure URL is not empty string
```javascript
// In backend update route
const updateData = {
  title: title.trim(),
  description: description.trim(),
  url: url && url.trim() ? url.trim() : null  // Use null instead of empty string
};
```

### Solution 2: Force Mongoose to update the field
```javascript
// Use $set operator explicitly
const course = await Course.findOneAndUpdate(
  { courseId: id },
  { $set: updateData },
  { new: true, runValidators: true }
);
```

### Solution 3: Verify field is not being overwritten
```javascript
// Check if there's any middleware or hook overwriting the URL
// In Course.js schema, check pre/post hooks
```

## Next Steps

1. Check browser console logs when updating a course
2. Check backend server logs to see what URL is being received and saved
3. Verify the exact value being stored in MongoDB
4. If URL is empty in DB, check why it's not being sent from frontend
5. If URL is saved but not returned, check the GET /domains response

## Logging Added

✅ Frontend: `handleUpdateCourse()` - logs courseFormData
✅ Frontend: `updateCourse()` - logs request data and response
✅ Backend: `PUT /admin/courses/:id` - logs received data and saved data
✅ Backend: `GET /admin/courses` - logs all courses with URLs
✅ Backend: `GET /domains` - logs all courses with URLs
✅ Frontend: `getDomains()` - logs received courses with URLs
✅ Frontend: `handleCourseAccess()` - logs course object with URL

## Status

⏳ **AWAITING VERIFICATION**: Need to check console logs to see where URL is being lost

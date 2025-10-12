@echo off
echo ========================================
echo      MATC Quick Test & Verification
echo ========================================
echo.

echo Testing Backend Health...
curl -i https://matc-backend.onrender.com/api/health
echo.
echo ========================================
echo.

echo Testing Programs Endpoint...
curl -i https://matc-backend.onrender.com/api/programs
echo.
echo ========================================
echo.

echo Testing CORS for Admin Panel...
curl -i -X OPTIONS https://matc-backend.onrender.com/api/programs -H "Origin: https://admine-lake.vercel.app" -H "Access-Control-Request-Method: GET"
echo.
echo ========================================
echo.

echo Testing CORS for Frontend...
curl -i -X OPTIONS https://matc-backend.onrender.com/api/programs -H "Origin: https://matrainingconsulting.vercel.app" -H "Access-Control-Request-Method: GET"
echo.
echo ========================================
echo.

echo Opening test pages...
start vercel-deployment-test.html
start qa-connectivity-test.html

echo.
echo ✅ Quick tests completed!
echo Check the curl outputs above and the test pages that opened.
echo.
pause

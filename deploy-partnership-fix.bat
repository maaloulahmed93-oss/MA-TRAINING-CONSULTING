@echo off
echo ========================================
echo   نشر إصلاح مزامنة الشراكة
echo ========================================
echo.

echo [1/4] إضافة الملفات المعدلة...
git add backend/models/SiteConfig.js
git add backend/routes/partnerships.js
git add admin-panel/src/pages/FinancePage.tsx
git add test-partnership-email-fix.html
git add test-partnership-sync-fix.html
git add PARTNERSHIP_EMAIL_FIX.md
git add PARTNERSHIP_SYNC_FIX_AR.md
git add deploy-partnership-fix.bat

echo.
echo [2/4] إنشاء commit...
git commit -m "Fix: Partnership email persistence and backend sync issues

- Add partnershipEmail field to SiteConfig model for MongoDB persistence
- Update partnerships routes to use database instead of memory
- Add backend status check in FinancePage
- Create comprehensive test pages for sync verification
- Add Arabic and English documentation

Fixes:
- Email mismatch between admin panel and public website
- 'Vérification du Backend...' message stuck
- Data not syncing between admin panel and website"

echo.
echo [3/4] دفع التغييرات إلى GitHub...
git push

echo.
echo [4/4] ✅ تم النشر بنجاح!
echo.
echo الخطوات التالية:
echo 1. انتظر اكتمال نشر Backend على Render (~2-3 دقائق)
echo 2. انتظر اكتمال نشر Admin Panel على Vercel (~1-2 دقيقة)
echo 3. افتح test-partnership-sync-fix.html للاختبار
echo 4. حدّث البريد في لوحة التحكم
echo.
pause

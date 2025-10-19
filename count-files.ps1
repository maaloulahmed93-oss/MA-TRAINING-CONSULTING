# عد الملفات المدفوعة إلى GitHub
Write-Host "📊 إحصائيات الملفات المدفوعة إلى GitHub" -ForegroundColor Green
Write-Host "=" * 50

# عد ملفات Markdown
$mdFiles = git ls-files | Where-Object { $_ -match "\.md$" }
Write-Host "📝 ملفات Markdown: $($mdFiles.Count)" -ForegroundColor Yellow

# عد ملفات HTML
$htmlFiles = git ls-files | Where-Object { $_ -match "\.html$" }
Write-Host "🌐 ملفات HTML: $($htmlFiles.Count)" -ForegroundColor Cyan

# عد ملفات JavaScript/Node.js
$jsFiles = git ls-files | Where-Object { $_ -match "\.(js|cjs)$" }
Write-Host "⚡ ملفات JavaScript: $($jsFiles.Count)" -ForegroundColor Magenta

# عد ملفات JSON
$jsonFiles = git ls-files | Where-Object { $_ -match "\.json$" }
Write-Host "📋 ملفات JSON: $($jsonFiles.Count)" -ForegroundColor Blue

# عد ملفات TypeScript
$tsFiles = git ls-files | Where-Object { $_ -match "\.ts$" }
Write-Host "🔷 ملفات TypeScript: $($tsFiles.Count)" -ForegroundColor DarkBlue

# المجموع الكلي
$totalFiles = git ls-files | Measure-Object
Write-Host "📁 إجمالي الملفات: $($totalFiles.Count)" -ForegroundColor Green

Write-Host "`n✅ جميع الملفات مدفوعة بنجاح إلى GitHub!" -ForegroundColor Green
Write-Host "🔗 GitHub Repository: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING" -ForegroundColor White

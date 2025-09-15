# PowerShell script to create a test program via API
$uri = "http://localhost:3001/api/programs"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    title = "برنامج تجريبي - تطوير المواقع"
    description = "برنامج تجريبي لتعلم تطوير المواقع باستخدام React و Node.js"
    category = "Technologies"
    level = "Débutant"
    price = 299
    duration = "4 أسابيع"
    maxParticipants = 20
    sessionsPerYear = 4
    modules = @(
        @{ title = "مقدمة في HTML و CSS" }
        @{ title = "JavaScript الأساسي" }
    )
    sessions = @(
        @{ title = "الجلسة الأولى"; date = "2024-02-15" }
        @{ title = "الجلسة الثانية"; date = "2024-02-22" }
    )
    isActive = $true
} | ConvertTo-Json -Depth 3

Write-Host "🚀 إرسال برنامج تجريبي..." -ForegroundColor Yellow
Write-Host "📤 البيانات: $body" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ تم إنشاء البرنامج بنجاح!" -ForegroundColor Green
    Write-Host "🆔 معرف البرنامج: $($response.data._id)" -ForegroundColor Green
    Write-Host "📚 العنوان: $($response.data.title)" -ForegroundColor Green
    
    # الآن نتحقق من البرامج الموجودة
    Write-Host "`n🔍 التحقق من البرامج الموجودة..." -ForegroundColor Yellow
    $getResponse = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "📊 عدد البرامج: $($getResponse.count)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ خطأ في إنشاء البرنامج:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

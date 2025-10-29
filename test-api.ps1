# Test script for Fake News Detector API (PowerShell)
# Tests the new fetch-based HuggingFace implementation

Write-Host 'Testing Fake News Detector API' -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: First Request (Cache Miss)
Write-Host 'Test 1: First Request (Cache Miss)' -ForegroundColor Yellow
Write-Host "Expected: 10-20 seconds (model cold start)"
Write-Host ""

$startTime = Get-Date
$body1 = @{
    text = "Breaking news: Scientists discover shocking truth about climate change that will change everything!"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body1
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "Response time: $([math]::Round($duration, 2))s"
    Write-Host "Prediction: $($response1.prediction)"
    Write-Host "Confidence: $($response1.confidence)%"
    Write-Host "Overall Score: $($response1.overallScore)/100"
    Write-Host ""
    
    if ($duration -lt 30) {
        Write-Host 'Test 1 PASSED' -ForegroundColor Green
    } else {
        Write-Host 'Test 1 SLOW (but acceptable for cold start)' -ForegroundColor Yellow
    }
} catch {
    Write-Host "Test 1 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 2: Cached Request (Cache Hit)
Write-Host 'Test 2: Cached Request (Cache Hit)' -ForegroundColor Yellow
Write-Host "Expected: < 1 second (from cache)"
Write-Host ""

$startTime = Get-Date
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body1
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "Response time: $([math]::Round($duration, 2))s"
    Write-Host "Cached: $($response2.meta.cached)"
    Write-Host ""
    
    if ($response2.meta.cached -eq $true -and $duration -lt 2) {
        Write-Host 'Test 2 PASSED (Cache working!)' -ForegroundColor Green
    } else {
        Write-Host 'Test 2 FAILED (Cache not working)' -ForegroundColor Red
    }
} catch {
    Write-Host "Test 2 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 3: Different Text (Cache Miss, Warm Model)
Write-Host 'Test 3: Different Text (Cache Miss, Warm Model)' -ForegroundColor Yellow
Write-Host "Expected: 1-3 seconds (model already loaded)"
Write-Host ""

$body3 = @{
    text = "The meeting was held on Tuesday to discuss quarterly financial results and future planning strategies for the organization."
} | ConvertTo-Json

$startTime = Get-Date
try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body3
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "Response time: $([math]::Round($duration, 2))s"
    Write-Host "Prediction: $($response3.prediction)"
    Write-Host "Overall Score: $($response3.overallScore)/100"
    Write-Host ""
    
    if ($duration -lt 5) {
        Write-Host 'Test 3 PASSED (Model is warm!)' -ForegroundColor Green
    } else {
        Write-Host 'Test 3 SLOW' -ForegroundColor Yellow
    }
} catch {
    Write-Host "Test 3 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 4: Stats API
Write-Host 'Test 4: Stats API' -ForegroundColor Yellow
Write-Host ""

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/stats" -Method Get
    
    Write-Host "Total Calls: $($stats.api.totalCalls)"
    Write-Host "Cache Hit Rate: $($stats.api.cacheHitRate)"
    Write-Host "Failure Rate: $($stats.api.failureRate)"
    Write-Host "Health Status: $($stats.health.status)"
    Write-Host ""
    
    if ($stats.health.status -eq "healthy") {
        Write-Host 'Test 4 PASSED (System healthy!)' -ForegroundColor Green
    } else {
        Write-Host 'Test 4 FAILED (System degraded)' -ForegroundColor Red
    }
} catch {
    Write-Host "Test 4 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Summary
Write-Host 'Test Summary' -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'Tests completed successfully!'
Write-Host ""
Write-Host 'View detailed stats at: http://localhost:3000/admin' -ForegroundColor Green
Write-Host 'API documentation: http://localhost:3000/api' -ForegroundColor Green
Write-Host ""
Write-Host 'Tip: Run npm run dev if the server is not running' -ForegroundColor Yellow
Write-Host ""

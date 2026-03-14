# Test Classification System

Write-Host "`n=== Testing ML Classification System ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET | ConvertTo-Json -Depth 5

# Test 2: Pothole (PUBLIC_WORKS)
Write-Host "`n2. Test: Pothole on main road" -ForegroundColor Yellow
$body1 = @{ text = "Pothole on main road" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body1 | ConvertTo-Json -Depth 5

# Test 3: Water leak (WATER_SUPPLY)
Write-Host "`n3. Test: Water leak in my house" -ForegroundColor Yellow
$body2 = @{ text = "Water leak in my house" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body2 | ConvertTo-Json -Depth 5

# Test 4: Street light (ELECTRICITY)
Write-Host "`n4. Test: Street light not working" -ForegroundColor Yellow
$body3 = @{ text = "Street light not working" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body3 | ConvertTo-Json -Depth 5

# Test 5: Garbage (SANITATION)
Write-Host "`n5. Test: Garbage not collected for 3 days" -ForegroundColor Yellow
$body4 = @{ text = "Garbage not collected for 3 days" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body4 | ConvertTo-Json -Depth 5

# Test 6: Hospital (HEALTH)
Write-Host "`n6. Test: Ambulance service needed" -ForegroundColor Yellow
$body5 = @{ text = "Ambulance service needed urgently" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body5 | ConvertTo-Json -Depth 5

# Test 7: School (EDUCATION)
Write-Host "`n7. Test: School building needs repair" -ForegroundColor Yellow
$body6 = @{ text = "School building needs repair" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $body6 | ConvertTo-Json -Depth 5

Write-Host "`n=== Tests Complete ===" -ForegroundColor Green

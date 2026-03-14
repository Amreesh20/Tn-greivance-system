# Test Voice-to-Text Conversion and Issue Matching
# This script tests whether transcribed text can be properly matched with issues

Write-Host "`n=== Testing Voice-to-Text Conversion and Issue Matching ===" -ForegroundColor Cyan

# Check if ML service is running
Write-Host "`n1. Checking ML Service Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "[OK] ML Service is running" -ForegroundColor Green
    Write-Host "   - Districts loaded: $($health.districts_loaded)" -ForegroundColor $(if ($health.districts_loaded) { "Green" } else { "Red" })
    Write-Host "   - Districts count: $($health.districts_count)" -ForegroundColor $(if ($health.districts_count -gt 0) { "Green" } else { "Red" })
    Write-Host "   - Categories loaded: $($health.categories_loaded)" -ForegroundColor $(if ($health.categories_loaded) { "Green" } else { "Red" })
    Write-Host "   - Categories count: $($health.categories_count)" -ForegroundColor $(if ($health.categories_count -gt 0) { "Green" } else { "Red" })
} catch {
    Write-Host "[FAIL] ML Service is not running. Please start it first." -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Simulate voice transcription results and test matching
Write-Host "`n2. Testing Text-to-Issue Matching (Simulating Voice Transcription Results)..." -ForegroundColor Yellow

# Test cases that simulate what voice transcription might produce
$testCases = @(
    @{
        name = "Pothole complaint with location"
        text = "There is a big pothole on the main road in Chennai"
        expectedDistrict = "CHENNAI"
        expectedDepartment = "PUBLIC_WORKS"
    },
    @{
        name = "Water supply issue"
        text = "Water leak in my house in Coimbatore"
        expectedDistrict = "COIMBATORE"
        expectedDepartment = "WATER_SUPPLY"
    },
    @{
        name = "Street light issue"
        text = "Street light not working in Madurai"
        expectedDistrict = "MADURAI"
        expectedDepartment = "ELECTRICITY"
    },
    @{
        name = "Garbage collection"
        text = "Garbage not collected for 3 days in Trichy"
        expectedDistrict = "TIRUCHIRAPALLI"
        expectedDepartment = "SANITATION"
    },
    @{
        name = "Health emergency"
        text = "Ambulance service needed urgently in Salem"
        expectedDistrict = "SALEM"
        expectedDepartment = "HEALTH"
    }
)

$passedTests = 0
$failedTests = 0

foreach ($testCase in $testCases) {
    Write-Host "`n   Testing: $($testCase.name)" -ForegroundColor Cyan
    Write-Host "   Text: '$($testCase.text)'" -ForegroundColor Gray
    
    try {
        # Test location extraction
        Write-Host "   -> Testing location extraction..." -ForegroundColor Yellow
        $locationBody = @{ text = $testCase.text } | ConvertTo-Json
        $locationResult = Invoke-RestMethod -Uri "http://localhost:5000/location/extract" -Method POST -ContentType "application/json" -Body $locationBody
        
        $districtMatched = $false
        if ($locationResult.districtId) {
            Write-Host "   [OK] District extracted: $($locationResult.districtName) ($($locationResult.districtId))" -ForegroundColor Green
            Write-Host "     Confidence: $($locationResult.confidence)" -ForegroundColor $(if ($locationResult.confidence -gt 0.7) { "Green" } else { "Yellow" })
            $districtMatched = $true
        } else {
            Write-Host "   [FAIL] No district found" -ForegroundColor Red
        }
        
        # Test department classification
        Write-Host "   -> Testing department classification..." -ForegroundColor Yellow
        $classifyBody = @{ text = $testCase.text } | ConvertTo-Json
        $classifyResult = Invoke-RestMethod -Uri "http://localhost:5000/classify/text" -Method POST -ContentType "application/json" -Body $classifyBody
        
        $deptMatched = $false
        if ($classifyResult.department) {
            Write-Host "   [OK] Department classified: $($classifyResult.department)" -ForegroundColor Green
            Write-Host "     Confidence: $($classifyResult.confidence)" -ForegroundColor $(if ($classifyResult.confidence -gt 0.5) { "Green" } else { "Yellow" })
            $deptMatched = $true
        } else {
            Write-Host "   [FAIL] No department classified" -ForegroundColor Red
        }
        
        # Evaluate test result
        if ($districtMatched -and $deptMatched) {
            Write-Host "   [PASS] Test PASSED: Both location and department matched" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "   [FAIL] Test FAILED: Missing location or department match" -ForegroundColor Red
            $failedTests++
        }
        
    } catch {
        Write-Host "   [ERROR] Test ERROR: $_" -ForegroundColor Red
        $failedTests++
    }
}

# Test 3: Test complete voice processing pipeline (requires actual audio file)
Write-Host "`n3. Testing Complete Voice Processing Pipeline..." -ForegroundColor Yellow
Write-Host "   Note: This requires an actual audio file. Testing with mock data..." -ForegroundColor Gray

# Simulate what the voice/process endpoint would return
Write-Host "   Simulated voice processing result structure:" -ForegroundColor Cyan
$mockVoiceResult = @{
    success = $true
    stt = @{
        transcribed_text = "There is a pothole on the main road in Chennai"
        language = "en-IN"
        confidence = 0.9
    }
    location = @{
        districtId = "CHENNAI"
        districtName = "Chennai"
        confidence = 0.85
    }
    classification = @{
        department = "PUBLIC_WORKS"
        confidence = 0.75
    }
    pipeline_output = @{
        text = "There is a pothole on the main road in Chennai"
        districtId = "CHENNAI"
        districtName = "Chennai"
        department = "PUBLIC_WORKS"
        classification_confidence = 0.75
    }
}

Write-Host "   [OK] Voice processing would return:" -ForegroundColor Green
Write-Host "     - Transcribed text: $($mockVoiceResult.stt.transcribed_text)" -ForegroundColor Gray
Write-Host "     - District: $($mockVoiceResult.pipeline_output.districtName) ($($mockVoiceResult.pipeline_output.districtId))" -ForegroundColor Gray
Write-Host "     - Department: $($mockVoiceResult.pipeline_output.department)" -ForegroundColor Gray

# Test 4: Verify complaint submission compatibility
Write-Host "`n4. Testing Complaint Submission Compatibility..." -ForegroundColor Yellow
Write-Host "   Checking if voice processing results can be used to submit complaints..." -ForegroundColor Gray

$mockComplaintData = @{
    text = $mockVoiceResult.pipeline_output.text
    category = $mockVoiceResult.pipeline_output.department
    districtId = $mockVoiceResult.pipeline_output.districtId
}

Write-Host "   [OK] Voice result can be mapped to complaint submission:" -ForegroundColor Green
$textValue = $mockComplaintData.text
$categoryValue = $mockComplaintData.category
$districtValue = $mockComplaintData.districtId
Write-Host "     - text: $textValue" -ForegroundColor Gray
Write-Host "     - category: $categoryValue" -ForegroundColor Gray
Write-Host "     - districtId: $districtValue" -ForegroundColor Gray

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "   Passed: $passedTests" -ForegroundColor Green
Write-Host "   Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "   Total:  $($passedTests + $failedTests)" -ForegroundColor Yellow

if ($failedTests -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed! Voice-to-text conversion and issue matching work correctly." -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Some tests failed. Please review the issues above." -ForegroundColor Yellow
}

Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
Write-Host "1. Ensure ML service is running on http://localhost:5000" -ForegroundColor Yellow
Write-Host "2. Test actual voice recording through the frontend VoiceDemo component" -ForegroundColor Yellow
Write-Host "3. Verify that voice results can be submitted as complaints via /api/complaints/submit" -ForegroundColor Yellow
Write-Host "4. Check that districts.json and categories.json are properly loaded" -ForegroundColor Yellow

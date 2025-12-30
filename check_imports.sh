echo "Checking for missing imports in Results.js..."
grep -n "import.*from" src/pages/Results.js

echo -e "\nChecking for missing imports in Settings.js..."
grep -n "import.*from" src/pages/Settings.js

echo -e "\nChecking for missing imports in ManageAffiliate.js..."
grep -n "import.*from" src/pages/ManageAffiliate.js

echo -e "\nChecking if services exist..."
echo "openaiService:" $(ls -la src/services/openaiService.js 2>/dev/null || echo "Not found")
echo "productSearchService:" $(ls -la src/services/productSearchService.js 2>/dev/null || echo "Not found")
echo "productService:" $(ls -la src/services/productService.js 2>/dev/null || echo "Not found")
echo "affiliateService:" $(ls -la src/services/affiliateService.js 2>/dev/null || echo "Not found")
echo "settingsService:" $(ls -la src/services/settingsService.js 2>/dev/null || echo "Not found")
echo "tiktokService:" $(ls -la src/services/tiktokService.js 2>/dev/null || echo "Not found")

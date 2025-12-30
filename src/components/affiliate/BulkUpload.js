import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";

// Replace Base44 imports with your own services
import { createAffiliateLinkInSupabase, findAffiliateLinkByBrandModel } from "../../services/affiliateService";

export default function BulkUpload({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [file, setFile] = useState(null);

  const csvTemplate = `brand,model,original_url,affiliate_url,price,availability,notes
Apple,iPhone 16 Pro,https://shopee.sg/product-url,https://s.shopee.sg/xyz123,"$1299 - $1499",In Stock,Latest model
Samsung,Galaxy S24 Ultra,https://shopee.sg/product-url-2,https://s.shopee.sg/abc456,"$1199 - $1399",In Stock,Premium flagship
Sony,WH-1000XM5,https://shopee.sg/headphones-url,https://s.shopee.sg/def789,"$349 - $399",Limited Stock,Best noise cancelling`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopee_affiliate_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const row = {};
      
      for (let j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = values[j] ? values[j].trim().replace(/^"(.*)"$/, '$1') : '';
      }
      
      results.push(row);
    }
    
    return results;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Read and parse the CSV file
      const text = await file.text();
      const csvData = parseCSV(text);

      if (!Array.isArray(csvData) || csvData.length === 0) {
        setUploadResult({
          success: false,
          message: "No valid data found in CSV file",
          data: null
        });
        return;
      }

      // Process and insert the records
      const results = {
        successful: [],
        failed: [],
        skipped: []
      };

      for (const row of csvData) {
        try {
          // Validate required fields
          if (!row.brand || !row.model || !row.affiliate_url) {
            results.failed.push({
              row: row,
              error: "Missing required fields (brand, model, affiliate_url)"
            });
            continue;
          }

          // Check if this brand/model combination already exists
          const existing = await findAffiliateLinkByBrandModel(row.brand, row.model);
          
          if (existing) {
            results.skipped.push({
              row: row,
              reason: "Already exists"
            });
            continue;
          }

          // Create the affiliate link record
          const linkData = {
            brand: row.brand.trim(),
            model: row.model.trim(),
            original_url: row.original_url?.trim() || "",
            affiliate_url: row.affiliate_url.trim(),
            price: row.price?.trim() || "",
            availability: row.availability?.trim() || "In Stock",
            notes: row.notes?.trim() || "",
            is_active: true
          };

          await createAffiliateLinkInSupabase(linkData);
          results.successful.push(row);

        } catch (error) {
          results.failed.push({
            row: row,
            error: error.message || "Unknown error"
          });
        }
      }

      setUploadResult({
        success: true,
        message: `Upload completed: ${results.successful.length} added, ${results.skipped.length} skipped, ${results.failed.length} failed`,
        data: results
      });

      // Notify parent component to refresh the list
      if (results.successful.length > 0) {
        onUploadComplete();
      }

    } catch (error) {
      setUploadResult({
        success: false,
        message: `Upload failed: ${error.message}`,
        data: null
      });
    }

    setIsUploading(false);
  };

  return (
    <Card className="revolut-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" />
          Bulk Upload Affiliate Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="space-y-3">
          <h4 className="font-medium text-white">Step 1: Download Template</h4>
          <p className="text-sm text-gray-400">
            Download the CSV template, fill in your affiliate links, and upload it back.
          </p>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <h4 className="font-medium text-white">Step 2: Upload Your CSV</h4>
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="revolut-button"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Results */}
        {uploadResult && (
          <Alert variant={uploadResult.success ? 'default' : 'destructive'} 
                className={uploadResult.success ? 'bg-green-900/50 border-green-500/50 text-white' : 'bg-red-900/50 border-red-500/50 text-white'}>
            <div className="flex items-center gap-2">
              {uploadResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <AlertDescription>{uploadResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Detailed Results */}
        {uploadResult?.data && (
          <div className="space-y-4">
            {uploadResult.data.successful.length > 0 && (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h5 className="font-medium text-green-400 mb-2">
                  ✅ Successfully Added ({uploadResult.data.successful.length})
                </h5>
                <div className="space-y-1 text-sm text-gray-300">
                  {uploadResult.data.successful.slice(0, 5).map((item, index) => (
                    <div key={index}>• {item.brand} {item.model}</div>
                  ))}
                  {uploadResult.data.successful.length > 5 && (
                    <div className="text-gray-400">... and {uploadResult.data.successful.length - 5} more</div>
                  )}
                </div>
              </div>
            )}

            {uploadResult.data.skipped.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h5 className="font-medium text-yellow-400 mb-2">
                  ⚠️ Skipped ({uploadResult.data.skipped.length})
                </h5>
                <div className="space-y-1 text-sm text-gray-300">
                  {uploadResult.data.skipped.slice(0, 3).map((item, index) => (
                    <div key={index}>• {item.row.brand} {item.row.model} - {item.reason}</div>
                  ))}
                  {uploadResult.data.skipped.length > 3 && (
                    <div className="text-gray-400">... and {uploadResult.data.skipped.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {uploadResult.data.failed.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <h5 className="font-medium text-red-400 mb-2">
                  ❌ Failed ({uploadResult.data.failed.length})
                </h5>
                <div className="space-y-1 text-sm text-gray-300">
                  {uploadResult.data.failed.slice(0, 3).map((item, index) => (
                    <div key={index}>• {item.row.brand || 'Unknown'} {item.row.model || 'Unknown'} - {item.error}</div>
                  ))}
                  {uploadResult.data.failed.length > 3 && (
                    <div className="text-gray-400">... and {uploadResult.data.failed.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-white mb-2">CSV Format Requirements:</h5>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>brand</strong>, <strong>model</strong>, <strong>affiliate_url</strong> are required</li>
            <li>• original_url, price, availability, notes are optional</li>
            <li>• Duplicate brand/model combinations will be skipped</li>
            <li>• Use UTF-8 encoding for special characters</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
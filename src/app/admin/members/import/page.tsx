'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImportMembersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/members/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully imported ${data.imported} members`,
          data: data,
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during import',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = `fullName,email,hireDate,currentClient,category,location
John Doe,john.doe@example.com,2023-01-15,Acme Corp,Builder,New York
Jane Smith,jane.smith@example.com,2023-02-20,Tech Solutions,Solver,San Francisco`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Members</h1>
            <p className="text-gray-600 mt-2">Import team members from Excel or CSV files</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/members"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Members
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
              <CardDescription>
                Follow these steps to import your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <h3 className="font-medium">Download Template</h3>
                    <p className="text-sm text-gray-600">
                      Download our CSV template to ensure your data is formatted correctly.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Download CSV Template
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <h3 className="font-medium">Prepare Your Data</h3>
                    <p className="text-sm text-gray-600">
                      Fill in the template with your team member data. Required fields: fullName, email, hireDate, category.
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Categories:</strong> Starter, Builder, Solver, Wizard
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <h3 className="font-medium">Upload File</h3>
                    <p className="text-sm text-gray-600">
                      Upload your completed CSV or Excel file using the form below.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Select a CSV or Excel file to import team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>

                {file && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">📄</span>
                      <span className="text-sm font-medium text-blue-800">{file.name}</span>
                      <span className="text-sm text-blue-600">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Importing...' : 'Import Members'}
                </button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className={`mt-6 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
              <CardContent className="pt-6">
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </span>
                  </div>
                  {result.success && result.data && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Imported: {result.data.imported} members</p>
                      {result.data.skipped > 0 && (
                        <p>Skipped: {result.data.skipped} members (duplicates or errors)</p>
                      )}
                    </div>
                  )}
                  {result.success && (
                    <Link
                      href="/admin/members"
                      className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      View Members
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sample Data Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">fullName</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">email</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">hireDate</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">category</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">currentClient</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">John Doe</td>
                      <td className="border border-gray-300 px-3 py-2">john.doe@example.com</td>
                      <td className="border border-gray-300 px-3 py-2">2023-01-15</td>
                      <td className="border border-gray-300 px-3 py-2">Builder</td>
                      <td className="border border-gray-300 px-3 py-2">Acme Corp</td>
                      <td className="border border-gray-300 px-3 py-2">New York</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Jane Smith</td>
                      <td className="border border-gray-300 px-3 py-2">jane.smith@example.com</td>
                      <td className="border border-gray-300 px-3 py-2">2023-02-20</td>
                      <td className="border border-gray-300 px-3 py-2">Solver</td>
                      <td className="border border-gray-300 px-3 py-2">Tech Solutions</td>
                      <td className="border border-gray-300 px-3 py-2">San Francisco</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
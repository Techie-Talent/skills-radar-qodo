'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SidebarLayout from '@/components/layout/sidebar-layout';
import PermissionGuard from '@/components/auth/permission-guard';

export default function ImportMembersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean; 
    message: string; 
    data?: {
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
      totalErrors: number;
      summary: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
      };
    };
  } | null>(null);

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
        const totalProcessed = data.imported + data.updated;
        let message = '';
        
        if (data.imported > 0 && data.updated > 0) {
          message = `Successfully processed ${totalProcessed} members (${data.imported} new, ${data.updated} updated)`;
        } else if (data.imported > 0) {
          message = `Successfully imported ${data.imported} new members`;
        } else if (data.updated > 0) {
          message = `Successfully updated ${data.updated} existing members`;
        } else {
          message = 'No members were processed';
        }

        setResult({
          success: true,
          message,
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
    // Create a simplified CSV template with required fields first
    const csvContent = `email,category,fullName,hireDate,currentClient,location
john.doe@example.com,Builder,John Doe,2023-01-15,Acme Corp,New York
jane.smith@techietalent.net,Solver,,2023-02-20,Tech Solutions,San Francisco
mike.johnson@example.com,Starter,Mike Johnson,2022-11-10,StartupXYZ,Remote
sarah.wilson@techietalent.net,Wizard,,2021-08-05,Enterprise Inc,London`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
    <PermissionGuard permission="members.write">
      <SidebarLayout breadcrumbs={[
        { label: 'Home', href: '/' }, 
        { label: 'Team Members', href: '/admin/members' }, 
        { label: 'Import Members' }
      ]}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Import Members</h1>
              <p className="text-muted-foreground mt-2">Import team members from Excel or CSV files</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
              <CardDescription>
                Follow these steps to import your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <h3 className="font-medium">Download Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Download our CSV template to ensure your data is formatted correctly.
                    </p>
                    <Button
                      variant="link"
                      onClick={downloadTemplate}
                      className="mt-2 h-auto p-0 text-sm"
                    >
                      Download CSV Template
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <h3 className="font-medium">Prepare Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill in the template with your team member data. Required fields: email, category.
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Required:</strong> email, category<br/>
                      <strong>Optional:</strong> fullName (auto-inferred if empty), hireDate, currentClient, location<br/>
                      <strong>Categories:</strong> Starter, Builder, Solver, Wizard<br/>
                      <strong>Date Format:</strong> YYYY-MM-DD (e.g., 2023-01-15)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <h3 className="font-medium">Upload File</h3>
                    <p className="text-sm text-muted-foreground">
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
                  <label htmlFor="file-input" className="block text-sm font-medium text-foreground mb-2">
                    Choose File
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>

                {file && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">📄</span>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-400">{file.name}</span>
                      <span className="text-sm text-blue-600">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import Members'}
                </Button>
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
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                          <div className="font-medium text-green-800 dark:text-green-400">New Members</div>
                          <div className="text-green-600">{result.data.imported}</div>
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <div className="font-medium text-blue-800 dark:text-blue-400">Updated</div>
                          <div className="text-blue-600">{result.data.updated}</div>
                        </div>
                        <div className="bg-yellow-100 p-2 rounded">
                          <div className="font-medium text-yellow-800">Skipped</div>
                          <div className="text-yellow-600">{result.data.skipped}</div>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <div className="font-medium text-foreground">Total Rows</div>
                          <div className="text-muted-foreground">{result.data.summary.totalRows}</div>
                        </div>
                      </div>
                      
                      {result.data.errors.length > 0 && (
                        <div className="mt-3">
                          <details className="bg-red-50 border border-red-200 rounded p-3">
                            <summary className="cursor-pointer font-medium text-red-800">
                              View Errors ({result.data.totalErrors})
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                              {result.data.errors.map((error, index) => (
                                <div key={index} className="font-mono text-xs bg-red-100 p-1 rounded">
                                  {error}
                                </div>
                              ))}
                              {result.data.totalErrors > result.data.errors.length && (
                                <div className="text-red-600 italic">
                                  ... and {result.data.totalErrors - result.data.errors.length} more errors
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                  {result.success && (
                    <Button asChild className="mt-3">
                      <Link href="/admin/members">
                        View Members
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sample Data Format</CardTitle>
              <CardDescription>
                Required CSV format for member import. Only email and category are mandatory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-3 py-2 text-left">email <span className="text-red-500">*</span></th>
                      <th className="border border-border px-3 py-2 text-left">category <span className="text-red-500">*</span></th>
                      <th className="border border-border px-3 py-2 text-left">fullName</th>
                      <th className="border border-border px-3 py-2 text-left">hireDate</th>
                      <th className="border border-border px-3 py-2 text-left">currentClient</th>
                      <th className="border border-border px-3 py-2 text-left">location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-3 py-2">john.doe@example.com</td>
                      <td className="border border-border px-3 py-2">Builder</td>
                      <td className="border border-border px-3 py-2">John Doe</td>
                      <td className="border border-border px-3 py-2">2023-01-15</td>
                      <td className="border border-border px-3 py-2">Acme Corp</td>
                      <td className="border border-border px-3 py-2">New York</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">jane.smith@techietalent.net</td>
                      <td className="border border-border px-3 py-2">Solver</td>
                      <td className="border border-border px-3 py-2 text-muted-foreground italic">(auto-inferred)</td>
                      <td className="border border-border px-3 py-2">2023-02-20</td>
                      <td className="border border-border px-3 py-2">Tech Solutions</td>
                      <td className="border border-border px-3 py-2">San Francisco</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">mike.johnson@example.com</td>
                      <td className="border border-border px-3 py-2">Starter</td>
                      <td className="border border-border px-3 py-2">Mike Johnson</td>
                      <td className="border border-border px-3 py-2">2022-11-10</td>
                      <td className="border border-border px-3 py-2">StartupXYZ</td>
                      <td className="border border-border px-3 py-2">Remote</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h4 className="font-medium text-amber-800 mb-2">Required Fields</h4>
                  <div className="text-sm text-amber-700 space-y-1">
                    <div>• <strong>email</strong>: Valid email address (used as unique identifier)</div>
                    <div>• <strong>category</strong>: Must be one of: Starter, Builder, Solver, Wizard</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Optional Fields & Auto-Inference</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• <strong>fullName</strong>: If empty, automatically inferred from email (e.g., john.doe@company.com → "John Doe")</div>
                    <div>• <strong>hireDate</strong>: Use YYYY-MM-DD format (e.g., 2023-01-15)</div>
                    <div>• <strong>currentClient</strong>: Current client assignment</div>
                    <div>• <strong>location</strong>: Work location or office</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Column Order Flexibility</h4>
                  <div className="text-sm text-green-700">
                    The import system supports flexible column ordering and various header names. You can use alternative headers like "name" for fullName, "hire_date" for hireDate, etc.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </SidebarLayout>
    </PermissionGuard>
  );
}
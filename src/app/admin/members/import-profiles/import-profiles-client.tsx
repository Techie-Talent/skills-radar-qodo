'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Users
} from 'lucide-react';

interface ImportResult {
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
}

interface MemberStats {
  totalMembers: number;
  membersWithProfiles: number;
  membersWithoutProfiles: number;
}

interface ImportProfilesClientProps {
  memberStats: MemberStats;
}

export default function ImportProfilesClient({ memberStats }: ImportProfilesClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/members/import-profiles', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch {
      setError('Failed to import profiles. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `email,assignments,teamRoles,clientAppreciations,feedback,talentPoolPeriods
john.doe@example.com,"Project Alpha - Lead Developer, Project Beta - Backend Developer","Tech Lead, Mentor","Client praised technical expertise and problem-solving skills","Excellent performance in Q3 review, recommended for senior role","Jan 2023 - Mar 2023: Available for new projects"
jane.smith@example.com,"Project Gamma - Frontend Developer","Scrum Master, UI/UX Specialist","Outstanding user interface design appreciated by client","Strong collaboration skills, helps team productivity","Jun 2023 - Aug 2023: Talent pool during project transition"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_profiles_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Import Member Profiles</h1>
          <p className="text-muted-foreground mt-2">
            Bulk import detailed profile information for team members
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/imports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Imports
          </Link>
        </Button>
      </div>

      {/* Current Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Complete Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{memberStats.membersWithProfiles}</div>
            <p className="text-xs text-muted-foreground">
              {memberStats.totalMembers > 0 
                ? `${Math.round((memberStats.membersWithProfiles / memberStats.totalMembers) * 100)}% complete`
                : '0% complete'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incomplete Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{memberStats.membersWithoutProfiles}</div>
            <p className="text-xs text-muted-foreground">
              Need profile data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to import member profile data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Required CSV Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>email</strong> - Member email (must match existing member)</li>
                <li>• <strong>assignments</strong> - Project assignments and roles</li>
                <li>• <strong>teamRoles</strong> - Team roles and leadership positions</li>
                <li>• <strong>clientAppreciations</strong> - Client feedback and appreciations</li>
                <li>• <strong>feedback</strong> - Internal feedback and performance notes</li>
                <li>• <strong>talentPoolPeriods</strong> - Talent pool availability periods</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Important Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Email must match an existing member in the system</li>
                <li>• All profile fields are optional except email</li>
                <li>• Use quotes for fields containing commas</li>
                <li>• Existing profiles will be updated with new data</li>
                <li>• Empty fields will clear existing data</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button variant="outline" asChild>
              <Link href="/members/talent-search">
                <Users className="h-4 w-4 mr-2" />
                View Members
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Profile Data</CardTitle>
          <CardDescription>
            Select a CSV file containing member profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={importing}
            />
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={!file || importing}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing Profiles...' : 'Import Profiles'}
          </Button>
          
          {importing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing profile data...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.totalErrors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            <Separator />

            {/* Detailed Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Rows</div>
                <div className="text-muted-foreground">{result.summary.totalRows}</div>
              </div>
              <div>
                <div className="font-medium">Valid Rows</div>
                <div className="text-muted-foreground">{result.summary.validRows}</div>
              </div>
              <div>
                <div className="font-medium">Invalid Rows</div>
                <div className="text-muted-foreground">{result.summary.invalidRows}</div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Import Errors
                </h4>
                <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild>
                <Link href="/members/talent-search">
                  <Users className="h-4 w-4 mr-2" />
                  View Members
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setError(null);
                }}
              >
                Import More Profiles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
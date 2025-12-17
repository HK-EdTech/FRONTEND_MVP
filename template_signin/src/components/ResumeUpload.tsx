import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  X,
  Eye,
  Download,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  atsScore?: number;
  uploadDate: string;
}

export function ResumeUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'john_doe_resume.pdf',
      size: '2.4 MB',
      status: 'completed',
      progress: 100,
      atsScore: 85,
      uploadDate: '2024-01-15 10:30',
    },
    {
      id: '2',
      name: 'sarah_smith_cv.docx',
      size: '1.8 MB',
      status: 'processing',
      progress: 60,
      uploadDate: '2024-01-15 10:28',
    },
    {
      id: '3',
      name: 'mike_johnson_resume.pdf',
      size: '3.1 MB',
      status: 'completed',
      progress: 100,
      atsScore: 92,
      uploadDate: '2024-01-15 10:25',
    },
    {
      id: '4',
      name: 'invalid_file.txt',
      size: '0.5 MB',
      status: 'error',
      progress: 0,
      uploadDate: '2024-01-15 10:20',
    },
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'uploading' as const,
      progress: 0,
      uploadDate: new Date().toLocaleString(),
    }));

    setUploadedFiles(prev => [...newFiles, ...prev]);

    // Simulate upload progress
    newFiles.forEach((file) => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            
            // Simulate processing
            setTimeout(() => {
              setUploadedFiles(prev => prev.map(f => {
                if (f.id === fileId) {
                  return {
                    ...f,
                    status: 'processing' as const,
                    progress: 0,
                  };
                }
                return f;
              }));

              // Simulate processing completion
              const processingInterval = setInterval(() => {
                setUploadedFiles(prev => prev.map(f => {
                  if (f.id === fileId) {
                    const newProgress = Math.min(f.progress + Math.random() * 15, 100);
                    
                    if (newProgress >= 100) {
                      clearInterval(processingInterval);
                      return {
                        ...f,
                        status: 'completed' as const,
                        progress: 100,
                        atsScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
                      };
                    }
                    
                    return { ...f, progress: newProgress };
                  }
                  return f;
                }));
              }, 300);
            }, 1000);
            
            return { ...file, status: 'uploading' as const, progress: 100 };
          }
          
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const variants = {
      uploading: { variant: 'secondary' as const, label: 'Uploading' },
      processing: { variant: 'secondary' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      error: { variant: 'destructive' as const, label: 'Error' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">Upload Resumes</h1>
        <p className="text-gray-600 mt-1">Upload and analyze resumes for ATS compatibility</p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-8">
          <div
            className={`text-center space-y-4 transition-colors ${
              isDragOver ? 'bg-blue-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Drop your resume files here</h3>
              <p className="text-gray-600">or click to browse and upload</p>
            </div>
            <div className="flex justify-center">
              <Button className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                Choose Files
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX • Maximum size: 10MB per file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files Table */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              Track the progress and results of your uploaded resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>ATS Score</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        {getStatusBadge(file.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="space-y-1">
                          <Progress value={file.progress} className="w-20" />
                          <span className="text-xs text-gray-500">{Math.round(file.progress)}%</span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <span className="text-green-600">Complete</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-red-600">Failed</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {file.atsScore && (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getScoreColor(file.atsScore)}`}>
                          {file.atsScore}
                        </div>
                      )}
                      {file.status === 'processing' && (
                        <span className="text-gray-500">Processing...</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-red-600">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{file.uploadDate}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={file.status !== 'completed'}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={file.status !== 'completed'}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
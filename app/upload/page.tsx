'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user) return;
    
    setUploading(true);
    
    try {
      const results = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const result = await response.json();
        results.push({ file: file.name, success: result.success, error: result.error });
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      setFiles([]);
      
      if (failed === 0) {
        alert(`Successfully uploaded ${successful} file(s). AI processing has started and will complete shortly.`);
      } else {
        alert(`Uploaded ${successful} file(s) successfully. ${failed} file(s) failed to upload.`);
      }
    } catch (error) {
      alert('Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-2">
            Upload PDF, DOCX, or TXT files for AI processing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop files here
              </p>
              <p className="text-gray-600 mb-4">
                or click to select files
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select Files
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF, DOCX, TXT (Max 10MB per file)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Selected Files</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="min-w-[120px]"
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Upload Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Maximum file size: 10MB per file</li>
              <li>• Supported formats: PDF, DOCX, TXT</li>
              <li>• Files are automatically scanned for malware</li>
              <li>• Processing typically takes 1-3 minutes per document</li>
              <li>• You will be notified when processing is complete</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
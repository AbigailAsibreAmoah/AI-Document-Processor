'use client';

import { useEffect, useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') ?? '';

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.success) setDocuments(data.data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const total = documents.length;
  const processing = documents.filter(d => d.status === 'PROCESSING').length;
  const completed = documents.filter(d => d.status === 'COMPLETED').length;
  const failed = documents.filter(d => d.status === 'FAILED').length;

  const recent = [...documents]
    .filter(d => d.status === 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const queue = documents.filter(d => d.status === 'PROCESSING');

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your document processing activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : total}</div>
              <p className="text-xs text-muted-foreground">Uploaded to your account</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : processing}</div>
              <p className="text-xs text-muted-foreground">Currently being processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : completed}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '—' : failed}</div>
              <p className="text-xs text-muted-foreground">Processing failures</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent + Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : recent.length === 0 ? (
                <p className="text-sm text-gray-400">No completed documents yet.</p>
              ) : (
                <div className="space-y-4">
                  {recent.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">Processed {timeAgo(doc.updatedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : queue.length === 0 ? (
                <p className="text-sm text-gray-400">No documents in queue.</p>
              ) : (
                <div className="space-y-4">
                  {queue.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">Processing... {timeAgo(doc.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
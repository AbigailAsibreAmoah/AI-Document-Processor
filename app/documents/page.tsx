'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Eye, Trash2, Share2, Link, Mail, FileDown, X, Check } from 'lucide-react';
import { Document } from '../../types';

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'PROCESSING':
      return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    case 'FAILED':
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Uploaded</Badge>;
  }
}

interface ShareMenuProps {
  doc: Document;
  onClose: () => void;
}

function ShareMenu({ doc, onClose }: ShareMenuProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/documents/${doc.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Shared document: ${doc.originalName}`);
    const body = encodeURIComponent(
      `I'm sharing a document with you: ${doc.originalName}\n\nView it here: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onClose();
  };

  const exportPDF = () => {
    window.open(`/api/files/${doc.filePath}`, '_blank');
    onClose();
  };

  return (
    <div
      className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      style={{ top: '100%' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-1.5 space-y-0.5">
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          ) : (
            <Link className="h-4 w-4 text-indigo-500 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              {copied ? 'Link copied!' : 'Copy link'}
            </p>
            <p className="text-xs text-gray-400">Share a direct link</p>
          </div>
        </button>

        <button
          onClick={shareEmail}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Share via email</p>
            <p className="text-xs text-gray-400">Open in mail client</p>
          </div>
        </button>

        <button
          onClick={exportPDF}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <FileDown className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Export / Download</p>
            <p className="text-xs text-gray-400">Save original file</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMenuDoc, setShareMenuDoc] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  // Close share menu on outside click
  useEffect(() => {
    const handleClick = () => setShareMenuDoc(null);
    if (shareMenuDoc) {
      setTimeout(() => window.addEventListener('click', handleClick), 0);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [shareMenuDoc]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      } else {
        alert('Failed to delete document');
      }
    } catch {
      alert('Error deleting document');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading documents...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-2">Manage and view your uploaded documents</p>
          </div>
          <Button onClick={() => window.location.href = '/upload'}>
            Upload New Document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No documents uploaded yet.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/upload'}>
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.originalName}</p>
                              <p className="text-sm text-gray-500">{doc.mimeType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/documents/${doc.id}`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/files/${doc.filePath}`, '_blank')}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            {/* Share button */}
                            <div
                              className="relative"
                              onClick={e => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Share"
                                onClick={() => setShareMenuDoc(shareMenuDoc === doc.id ? null : doc.id)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              {shareMenuDoc === doc.id && (
                                <ShareMenu
                                  doc={doc}
                                  onClose={() => setShareMenuDoc(null)}
                                />
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
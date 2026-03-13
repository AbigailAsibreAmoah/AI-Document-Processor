'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Download, Eye, Trash2, Share2, Link, Mail,
  FileDown, X, Check, Search, GitCompare, Loader2,
  Sparkles, ChevronRight
} from 'lucide-react';
import { Document } from '../../types';

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'PROCESSING': return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    case 'FAILED': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default: return <Badge className="bg-gray-100 text-gray-800">Uploaded</Badge>;
  }
}

interface ShareMenuProps { doc: Document; onClose: () => void; }

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
    const body = encodeURIComponent(`I'm sharing a document with you: ${doc.originalName}\n\nView it here: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onClose();
  };

  const exportPDF = () => {
    window.open(`/api/files/${doc.filePath}`, '_blank');
    onClose();
  };

  return (
    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden" style={{ top: '100%' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="p-1.5 space-y-0.5">
        <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
          {copied ? <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> : <Link className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
          <div>
            <p className="text-sm font-medium text-gray-700">{copied ? 'Link copied!' : 'Copy link'}</p>
            <p className="text-xs text-gray-400">Share a direct link</p>
          </div>
        </button>
        <button onClick={shareEmail} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Share via email</p>
            <p className="text-xs text-gray-400">Open in mail client</p>
          </div>
        </button>
        <button onClick={exportPDF} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
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

interface CompareModalProps {
  doc1: Document;
  doc2: Document;
  onClose: () => void;
}

function CompareModal({ doc1, doc2, onClose }: CompareModalProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const compare = async () => {
      try {
        const res = await fetch('/api/documents/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ docId1: doc1.id, docId2: doc2.id }),
        });
        const data = await res.json();
        if (data.success) setResult(data.data);
        else setError(data.error || 'Comparison failed');
      } catch {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    compare();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <GitCompare className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Document Comparison</h3>
              <p className="text-xs text-gray-500">{doc1.originalName} vs {doc2.originalName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-gray-500 text-sm">Comparing documents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : result ? (
            <div className="space-y-6">
              {/* Doc headers */}
              <div className="grid grid-cols-2 gap-4">
                {[doc1, doc2].map((doc, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs text-indigo-400 uppercase tracking-wide mb-1">Document {i + 1}</p>
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.originalName}</p>
                  </div>
                ))}
              </div>

              {/* Similarities */}
              {result.similarities?.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3">Similarities</h4>
                  <ul className="space-y-2">
                    {result.similarities.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differences */}
              {result.differences?.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-orange-700 mb-3">Differences</h4>
                  <ul className="space-y-2">
                    {result.differences.map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advantages */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: `${doc1.originalName} advantages`, items: result.doc1Advantages, color: 'green' },
                  { label: `${doc2.originalName} advantages`, items: result.doc2Advantages, color: 'purple' },
                ].map(({ label, items, color }, i) => (
                  items?.length > 0 && (
                    <div key={i} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4`}>
                      <h4 className={`text-xs font-semibold text-${color}-700 mb-2 truncate`}>{label}</h4>
                      <ul className="space-y-1.5">
                        {items.map((item: string, j: number) => (
                          <li key={j} className={`flex items-start gap-2 text-xs text-${color}-800`}>
                            <span className={`w-1.5 h-1.5 bg-${color}-400 rounded-full mt-1.5 flex-shrink-0`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-800">{result.recommendation}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface SemanticResult {
  id: string;
  content: string;
  documentId: string;
  originalName: string;
  similarity: number;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMenuDoc, setShareMenuDoc] = useState<string | null>(null);

  // Semantic search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SemanticResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Compare
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

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
      if (res.ok) setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      else alert('Failed to delete document');
    } catch { alert('Error deleting document'); }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchMode(false); setSearchResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      setSearchMode(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (data.success) setSearchResults(data.data);
      } catch { console.error('Search failed'); }
      finally { setSearching(false); }
    }, 500);
  };

  const toggleCompareDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : prev.length < 2 ? [...prev, docId] : prev
    );
  };

  const compareDoc1 = documents.find(d => d.id === selectedDocs[0]);
  const compareDoc2 = documents.find(d => d.id === selectedDocs[1]);

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

        {/* Search + Compare toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 animate-spin" />}
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by meaning — e.g. 'contracts with payment terms'"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCompareMode(v => !v); setSelectedDocs([]); }}
            className={compareMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {compareMode ? 'Cancel Compare' : 'Compare Docs'}
          </Button>
          {compareMode && selectedDocs.length === 2 && (
            <Button
              size="sm"
              onClick={() => setShowCompare(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Compare Now
            </Button>
          )}
          {compareMode && (
            <span className="text-sm text-gray-500">
              {selectedDocs.length}/2 selected
            </span>
          )}
        </div>

        {/* Semantic search results */}
        {searchMode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Semantic Search Results
                {searchResults.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">— {searchResults.length} matches</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searching ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching across your documents...
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-gray-500 py-4">No matches found. Try different keywords.</p>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/documents/${r.documentId}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-indigo-600 truncate">{r.originalName}</span>
                          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                            {(r.similarity * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{r.content}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents table */}
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
                      {compareMode && <th className="py-3 px-4 w-10" />}
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Document</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const isSelected = selectedDocs.includes(doc.id);
                      return (
                        <tr
                          key={doc.id}
                          className={`border-b transition-colors ${
                            compareMode && isSelected
                              ? 'bg-indigo-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {compareMode && (
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCompareDoc(doc.id)}
                                disabled={!isSelected && selectedDocs.length >= 2}
                                className="w-4 h-4 accent-indigo-600 cursor-pointer"
                              />
                            </td>
                          )}
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
                              <Button variant="ghost" size="sm" onClick={() => window.location.href = `/documents/${doc.id}`} title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => window.open(`/api/files/${doc.filePath}`, '_blank')} title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <div className="relative" onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" title="Share" onClick={() => setShareMenuDoc(shareMenuDoc === doc.id ? null : doc.id)}>
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                {shareMenuDoc === doc.id && <ShareMenu doc={doc} onClose={() => setShareMenuDoc(null)} />}
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compare modal */}
      {showCompare && compareDoc1 && compareDoc2 && (
        <CompareModal
          doc1={compareDoc1}
          doc2={compareDoc2}
          onClose={() => { setShowCompare(false); setSelectedDocs([]); setCompareMode(false); }}
        />
      )}
    </Layout>
  );
}
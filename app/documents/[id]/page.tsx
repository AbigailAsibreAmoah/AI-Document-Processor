'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { Layout } from '../../../components/layout';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  ArrowLeft, Download, Clock, CheckCircle, AlertTriangle,
  Shield, HelpCircle, Lightbulb, Tag, Users, Calendar,
  DollarSign, MessageSquare, Table2, Image
} from 'lucide-react';
import { Document, ProcessingResult, TableData, FigureData } from '../../../types';

function friendlyMimeType(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/msword': 'Word Document',
    'text/plain': 'Text File',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
  };
  return map[mime] ?? mime;
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setDocumentId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (user && documentId) fetchDocumentDetails();
  }, [user, documentId]);

  const fetchDocumentDetails = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setDocument(data.data.document);
        setResult(data.data.processingResult);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const openHakunaWithDoc = () => {
    if (document) localStorage.setItem('hakuna_preselect_doc', document.originalName);
    window.dispatchEvent(new CustomEvent('hakuna:open', {
      detail: { documentName: document?.originalName }
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading document...
          </div>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Document not found</div>
        </div>
      </Layout>
    );
  }

  const tags: string[] = Array.isArray(result?.tags) ? result!.tags! : result?.tags ? JSON.parse(result.tags as unknown as string) : [];
  const risks: string[] = Array.isArray(result?.clauses?.risks) ? result!.clauses!.risks! : [];
  const protections: string[] = Array.isArray(result?.clauses?.protections) ? result!.clauses!.protections! : [];
  const ambiguities: string[] = Array.isArray(result?.clauses?.ambiguities) ? result!.clauses!.ambiguities! : [];
  const parties: string[] = Array.isArray(result?.keyData?.parties) ? result!.keyData!.parties! : [];
  const dates: string[] = Array.isArray(result?.keyData?.dates) ? result!.keyData!.dates! : [];
  const amounts: string[] = Array.isArray(result?.keyData?.amounts) ? result!.keyData!.amounts! : [];
  const obligations: string[] = Array.isArray(result?.keyData?.obligations) ? result!.keyData!.obligations! : [];
  const tables: TableData[] = Array.isArray(result?.tables) ? result!.tables! : [];
  const figures: FigureData[] = Array.isArray(result?.figures) ? result!.figures! : [];

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mt-1">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{document.originalName}</h1>
                <Badge className={document.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700'}>
                  {document.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {document.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Uploaded {new Date(document.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {result?.confidence && (
                  <span className="ml-3 text-indigo-600 font-medium">{(result.confidence * 100).toFixed(0)}% confidence</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {document.status === 'COMPLETED' && (
              <Button size="sm" onClick={openHakunaWithDoc} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />Ask Hakuna
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/files/${document.filePath}`, '_blank')}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        </div>

        {result ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Document Type + Tags */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    {result.documentType && <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Document Type</span>}
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{result.documentType ?? 'Document'}</h2>
                    {result.category && (
                      <span className="inline-block mt-1 text-sm text-indigo-600 font-medium bg-indigo-100 px-3 py-0.5 rounded-full">{result.category}</span>
                    )}
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    {tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                <div className="mt-4 flex items-center text-xs text-gray-400 gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Processed {new Date(result.processedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Recommendation</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{result.recommendation}</p>
                </div>
              )}

              {/* Risks */}
              {risks.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-base font-semibold text-red-700">Risks & Watch Out For</h3>
                  </div>
                  <ul className="space-y-2">
                    {risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />{risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Protections */}
              {protections.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <h3 className="text-base font-semibold text-green-700">Protections</h3>
                  </div>
                  <ul className="space-y-2">
                    {protections.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ambiguities */}
              {ambiguities.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="h-4 w-4 text-yellow-600" />
                    <h3 className="text-base font-semibold text-yellow-700">Ambiguities & Unclear Terms</h3>
                  </div>
                  <ul className="space-y-2">
                    {ambiguities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Tables */}
              {tables.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Table2 className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-base font-semibold text-gray-900">
                      Extracted Tables
                      <span className="ml-2 text-sm font-normal text-gray-400">({tables.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {tables.map((table, i) => (
                      <div key={i}>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Table {i + 1} — {table.rowCount} rows × {table.colCount} columns</p>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-indigo-50">
                                {table.headers.map((h, j) => (
                                  <th key={j} className="px-3 py-2 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-100">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.map((row, j) => (
                                <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  {row.map((cell, k) => (
                                    <td key={k} className="px-3 py-2 text-gray-700 border-b border-gray-100">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Figures */}
              {figures.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Image className="h-4 w-4 text-purple-500" />
                    <h3 className="text-base font-semibold text-gray-900">
                      Detected Figures
                      <span className="ml-2 text-sm font-normal text-gray-400">({figures.length})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {figures.map((fig, i) => (
                      <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-600 mb-1">{fig.label}</p>
                        <p className="text-xs text-gray-600 line-clamp-3">{fig.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — unchanged */}
            <div className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Document Info</h3>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">File Type</p>
                  <p className="text-sm text-gray-700 mt-0.5">{friendlyMimeType(document.mimeType)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">File Size</p>
                  <p className="text-sm text-gray-700 mt-0.5">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              {parties.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Parties Involved</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parties.map((party, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg">{party}</span>
                    ))}
                  </div>
                </div>
              )}

              {dates.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Key Dates</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dates.map((date, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-lg">{date}</span>
                    ))}
                  </div>
                </div>
              )}

              {amounts.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Amounts</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {amounts.map((amount, i) => (
                      <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-lg">{amount}</span>
                    ))}
                  </div>
                </div>
              )}

              {obligations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Obligations</h3>
                  </div>
                  <ul className="space-y-2">
                    {obligations.map((ob, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />{ob}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Processing results not available yet. Check back shortly.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
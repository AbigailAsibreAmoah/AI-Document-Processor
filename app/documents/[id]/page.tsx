'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { Layout } from '../../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { FileText, Download, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { Document, ProcessingResult } from '../../../types';

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
    if (user && documentId) {
      fetchDocumentDetails();
    }
  }, [user, documentId]);

  const fetchDocumentDetails = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading document...</div>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Document not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.originalName}</h1>
              <p className="text-gray-600 mt-1">
                Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={document.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {document.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
              {document.status}
            </Badge>
            <Button variant="outline" onClick={() => window.open(`/api/files/${document.filePath}`, '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {result ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {result.summary}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Processed on {new Date(result.processedAt).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    Confidence: {result.confidence ? (result.confidence * 100).toFixed(0) : 'N/A'}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Clauses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.clauses?.paymentTerms && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                      <ul className="space-y-1">
                        {result.clauses.paymentTerms.map((term, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.clauses?.obligations && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Obligations</h4>
                      <ul className="space-y-1">
                        {result.clauses.obligations.map((obligation, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {obligation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.clauses?.deadlines && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Deadlines</h4>
                      <ul className="space-y-1">
                        {result.clauses.deadlines.map((deadline, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {deadline}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">File Type</p>
                      <p className="text-sm text-gray-600">{document.mimeType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-gray-300 rounded"></div>
                    <div>
                      <p className="text-sm font-medium">File Size</p>
                      <p className="text-sm text-gray-600">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extracted Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.keyData?.parties && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Parties</h4>
                      <div className="space-y-1">
                        {result.keyData.parties.map((party, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {party}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.keyData?.dates && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Dates</h4>
                      <div className="space-y-1">
                        {result.keyData.dates.map((date, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.keyData?.amounts && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Amounts</h4>
                      <div className="space-y-1">
                        {result.keyData.amounts.map((amount, index) => (
                          <span key={index} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Processing results not available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
import { Layout } from '../../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { FileText, Download, ArrowLeft, Clock, CheckCircle } from 'lucide-react';

// Mock data - in real app, fetch from API
const mockDocument = {
  id: '1',
  name: 'Contract_Agreement.pdf',
  status: 'COMPLETED',
  uploadedAt: '2024-01-15T10:30:00Z',
  processedAt: '2024-01-15T10:33:00Z',
  size: '2.4 MB',
  type: 'PDF'
};

const mockProcessingResult = {
  summary: 'This is a comprehensive service agreement between Company A and Company B for software development services. The contract outlines payment terms, deliverables, timelines, and intellectual property rights.',
  keyData: {
    parties: ['Company A Inc.', 'Company B LLC'],
    dates: ['2024-01-01', '2024-12-31', '2024-02-15'],
    amounts: ['$50,000', '$10,000', '$5,000'],
    obligations: ['Deliver software within 6 months', 'Provide monthly progress reports', 'Maintain confidentiality']
  },
  clauses: {
    paymentTerms: ['Net 30 payment terms', 'Late payment penalty of 1.5% per month'],
    obligations: ['Client must provide requirements within 30 days', 'Contractor must deliver milestones on time'],
    deadlines: ['Project completion by December 31, 2024', 'First milestone due February 15, 2024']
  },
  confidence: 0.92
};

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{mockDocument.name}</h1>
              <p className="text-gray-600 mt-1">
                Uploaded on {new Date(mockDocument.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {mockProcessingResult.summary}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Processed in 3 minutes
                  <span className="mx-2">•</span>
                  Confidence: {(mockProcessingResult.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Clauses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                  <ul className="space-y-1">
                    {mockProcessingResult.clauses.paymentTerms.map((term, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Obligations</h4>
                  <ul className="space-y-1">
                    {mockProcessingResult.clauses.obligations.map((obligation, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {obligation}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deadlines</h4>
                  <ul className="space-y-1">
                    {mockProcessingResult.clauses.deadlines.map((deadline, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {deadline}
                      </li>
                    ))}
                  </ul>
                </div>
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
                    <p className="text-sm text-gray-600">{mockDocument.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  <div>
                    <p className="text-sm font-medium">File Size</p>
                    <p className="text-sm text-gray-600">{mockDocument.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-gray-600">3 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Parties</h4>
                  <div className="space-y-1">
                    {mockProcessingResult.keyData.parties.map((party, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {party}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Dates</h4>
                  <div className="space-y-1">
                    {mockProcessingResult.keyData.dates.map((date, index) => (
                      <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Amounts</h4>
                  <div className="space-y-1">
                    {mockProcessingResult.keyData.amounts.map((amount, index) => (
                      <span key={index} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {amount}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
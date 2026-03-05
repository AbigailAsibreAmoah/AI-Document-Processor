import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';

const mockDocuments = [
  {
    id: '1',
    name: 'Contract_Agreement.pdf',
    status: 'COMPLETED',
    uploadedAt: '2024-01-15T10:30:00Z',
    size: '2.4 MB',
    type: 'PDF'
  },
  {
    id: '2',
    name: 'Legal_Document.docx',
    status: 'PROCESSING',
    uploadedAt: '2024-01-15T09:15:00Z',
    size: '1.8 MB',
    type: 'DOCX'
  },
  {
    id: '3',
    name: 'Terms_Conditions.txt',
    status: 'COMPLETED',
    uploadedAt: '2024-01-14T16:45:00Z',
    size: '0.5 MB',
    type: 'TXT'
  },
  {
    id: '4',
    name: 'Privacy_Policy.pdf',
    status: 'FAILED',
    uploadedAt: '2024-01-14T14:20:00Z',
    size: '3.1 MB',
    type: 'PDF'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'PROCESSING':
      return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    case 'FAILED':
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
  }
}

export default function DocumentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-2">
              Manage and view your uploaded documents
            </p>
          </div>
          <Button>
            Upload New Document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Document
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Uploaded
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {doc.size}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
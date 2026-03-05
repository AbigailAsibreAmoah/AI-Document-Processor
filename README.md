# DocuMind AI - Document Processor

A production-ready AI-powered document processing web application built with Next.js 15, TypeScript, and modern web technologies.

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files with drag-and-drop interface
- **AI Processing**: Automated text extraction, summarization, and clause detection using OpenAI GPT-3.5-turbo
- **Smart Fallback**: Pattern-matching AI when OpenAI API is unavailable
- **Professional UI**: Clean, slate-themed corporate interface with responsive design
- **Secure Architecture**: JWT authentication, file validation, and secure storage
- **Scalable Backend**: Next.js 15 API routes with Prisma ORM and SQLite
- **Real-time Processing**: Asynchronous document processing with status tracking

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI**: OpenAI GPT-3.5-turbo with intelligent fallback
- **Storage**: Local filesystem with S3 abstraction layer
- **Authentication**: JWT with bcrypt password hashing
- **Document Processing**: pdf-parse, mammoth (DOCX), native text parsing

## Quick Start

### Prerequisites

- Node.js 18 or higher
- OpenAI API key (optional - falls back to pattern matching)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key (optional)
   ```

4. **Setup database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Visit**: http://localhost:3000

### First Time Setup

1. Register a new account at `/register`
2. Login at `/login`
3. Upload documents at `/upload`
4. View processed documents at `/documents`

## Project Structure

```
├── app/                    # Next.js 15 app router
│   ├── api/               # API route handlers
│   │   ├── auth/         # Authentication endpoints
│   │   ├── documents/    # Document management
│   │   ├── upload/       # File upload handler
│   │   └── files/        # File serving
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── dashboard/        # Dashboard page
│   ├── upload/           # Upload page
│   ├── documents/        # Documents list & detail pages
│   └── layout.tsx        # Root layout with auth provider
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── layout.tsx       # Main layout with sidebar
│   ├── sidebar.tsx      # Navigation sidebar
│   └── header.tsx       # Top header bar
├── services/            # Business logic layer
│   ├── auth.ts         # Authentication service
│   ├── document.ts     # Document processing service
│   └── storage.ts      # File storage service
├── ai/                 # AI processing logic
│   └── index.ts        # OpenAI integration with fallback
├── lib/                # Shared utilities
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
├── prisma/             # Database schema & migrations
│   └── schema.prisma   # Prisma schema (SQLite)
├── uploads/            # Local file storage
└── .env                # Environment variables
```

## Architecture

### Separation of Concerns

- **Presentation Layer**: React components and pages
- **Application Layer**: Next.js API routes (orchestration only)
- **Service Layer**: Business logic in `/services`
- **Data Layer**: Prisma ORM and database models
- **Infrastructure Layer**: Storage, AI, and external services

### Key Services

- **DocumentService**: File upload, text extraction (PDF/DOCX/TXT), AI processing, and document management
- **AuthService**: JWT-based authentication with bcrypt password hashing
- **AIService**: OpenAI GPT-3.5-turbo integration with intelligent pattern-matching fallback
- **StorageService**: Local file storage with S3-ready abstraction layer

## AI Processing

### OpenAI Integration (Recommended)

When configured with a valid OpenAI API key, the system uses GPT-3.5-turbo for:
- **Document Summarization**: Intelligent 2-3 sentence summaries
- **Key Data Extraction**: Parties, dates, amounts, obligations
- **Clause Detection**: Payment terms, obligations, deadlines

### Pattern Matching Fallback

When OpenAI is unavailable, the system uses enhanced pattern matching:
- Document type detection (contracts, invoices, legal docs, reports)
- Regex-based entity extraction
- Keyword frequency analysis
- Clause identification using linguistic patterns

### Configuration

```bash
# .env file
OPENAI_API_KEY="sk-your-actual-api-key"  # Use real AI
# or
OPENAI_API_KEY="your-openai-api-key"     # Use fallback
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/register` - User registration with password hashing
- `GET /api/auth/verify` - Verify JWT token validity

### Documents
- `GET /api/documents` - List user's documents with status
- `POST /api/upload` - Upload document (PDF/DOCX/TXT, max 10MB)
- `GET /api/documents/[id]` - Get document details and AI processing results
- `DELETE /api/documents` - Delete document and associated files
- `GET /api/files/[filename]` - Download/view document file

## Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:pass@localhost:5432/db"  # PostgreSQL for production

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# AI Processing (Optional - uses fallback if not set)
OPENAI_API_KEY="sk-your-openai-api-key"

# Storage
STORAGE_TYPE="local"  # local | s3

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# File Upload Limits
MAX_FILE_SIZE="10485760"  # 10MB in bytes
ALLOWED_FILE_TYPES="pdf,docx,txt"
```

## Troubleshooting

### Common Issues

**File upload button not working?**
- Clear browser cache and reload
- Check browser console for errors

**AI processing stuck?**
- Check server console logs for errors
- Verify OpenAI API key is valid (if using OpenAI)
- System automatically falls back to pattern matching if OpenAI fails

**Database errors?**
```bash
npx prisma db push --force-reset  # Reset database
npx prisma generate               # Regenerate client
```

**Memory allocation errors?**
- File size limit is 10MB per file
- Large PDFs may take longer to process
- Check available system memory

## Deployment

### Production Checklist

1. **Update environment variables**:
   - Set strong `JWT_SECRET`
   - Add production `DATABASE_URL` (PostgreSQL recommended)
   - Configure `OPENAI_API_KEY` for real AI processing
   - Set `NODE_ENV="production"`

2. **Database migration**:
   ```bash
   # Switch from SQLite to PostgreSQL
   # Update DATABASE_URL in .env
   npx prisma db push
   ```

3. **Build application**:
   ```bash
   npm run build
   npm start
   ```

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Note: Use PostgreSQL (Vercel Postgres) instead of SQLite
```

### Docker Deployment

```bash
# Build image
docker build -t documind-ai .

# Run container
docker run -p 3000:3000 --env-file .env documind-ai
```

### Cloud Deployment

**Vercel** (Easiest):
- Connect GitHub repository
- Auto-deploy on push
- Add Vercel Postgres database
- Set environment variables

**AWS / Azure / GCP**:
- Use container services (ECS, Container Apps, Cloud Run)
- Configure PostgreSQL database
- Set up file storage (S3, Azure Blob, GCS)
- Configure environment variables

## Performance & Scaling

### Current Limits
- Max file size: 10MB per file
- File serving limit: 50MB (prevents memory issues)
- Supported formats: PDF, DOCX, TXT
- Processing: Asynchronous (non-blocking)

### Optimization Tips
- Use PostgreSQL for production (better than SQLite)
- Enable OpenAI API for better AI results
- Consider Redis for session storage at scale
- Use S3/CDN for file storage in production
- Implement rate limiting for API endpoints

## Security Features

- ✅ JWT token authentication with httpOnly cookies
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ File type validation (PDF, DOCX, TXT only)
- ✅ File size validation (10MB limit)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ Environment variable security
- ✅ User-specific document access control
- ⚠️ Rate limiting (ready to implement)
- ⚠️ CSRF protection (recommended for production)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check this README documentation
2. Review the troubleshooting section
3. Check server console logs
4. Create a GitHub issue with detailed information

---

**Built with ❤️ using Next.js 15, TypeScript, and OpenAI**
# AI Document Processor

A production-ready AI-powered document processing web application built with Next.js, TypeScript, and modern web technologies.

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files with drag-and-drop interface
- **AI Processing**: Automated text extraction, summarization, and clause detection
- **Professional UI**: Clean, corporate-style interface with responsive design
- **Secure Architecture**: JWT authentication, file validation, and secure storage
- **Scalable Backend**: Next.js API routes with Prisma ORM and PostgreSQL
- **Container Ready**: Docker support for easy deployment

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (SQLite for development)
- **AI**: OpenAI GPT integration
- **Storage**: Local filesystem with S3 abstraction layer
- **Authentication**: JWT with bcrypt password hashing
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- OpenAI API key

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ai-document-processor
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other settings
   ```

3. **Start development**:
   ```bash
   ./scripts/dev.sh
   ```

4. **Visit**: http://localhost:3000

## Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Start database
docker-compose -f docker-compose.dev.yml up -d

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API route handlers
│   ├── dashboard/         # Dashboard page
│   ├── upload/           # Upload page
│   ├── documents/        # Documents list page
│   └── settings/         # Settings page
├── components/           # Reusable UI components
│   └── ui/              # Base UI components
├── services/            # Business logic layer
├── database/           # Database configuration
├── ai/                # AI processing logic
├── lib/               # Shared utilities
├── types/             # TypeScript type definitions
├── scripts/           # Automation scripts
├── prisma/           # Database schema
└── docker-compose.yml # Container configuration
```

## Architecture

### Separation of Concerns

- **Presentation Layer**: React components and pages
- **Application Layer**: Next.js API routes (orchestration only)
- **Service Layer**: Business logic in `/services`
- **Data Layer**: Prisma ORM and database models
- **Infrastructure Layer**: Storage, AI, and external services

### Key Services

- **DocumentService**: File upload, processing, and management
- **AuthService**: User authentication and authorization
- **AIService**: OpenAI integration for document analysis
- **StorageService**: File storage with provider abstraction

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Documents
- `GET /api/documents` - List user documents
- `POST /api/upload` - Upload new document
- `GET /api/documents/[id]` - Get document details
- `DELETE /api/documents` - Delete document

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Authentication
JWT_SECRET="your-secret-key"

# AI Processing
OPENAI_API_KEY="your-openai-key"

# Storage (optional)
STORAGE_TYPE="local" # or "s3"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment

### Docker Deployment

1. **Production build**:
   ```bash
   ./scripts/docker-start.sh
   ```

2. **Manual Docker**:
   ```bash
   docker-compose up --build -d
   ```

### Cloud Deployment

#### AWS ECS/EC2
```bash
# Build and push to ECR
docker build -t ai-document-processor .
docker tag ai-document-processor:latest <ecr-uri>
docker push <ecr-uri>

# Deploy using ECS task definition
```

#### Azure Container Apps
```bash
# Build and push to ACR
az acr build --registry <registry> --image ai-document-processor .

# Deploy to Container Apps
az containerapp create --resource-group <rg> --name ai-doc-processor --image <acr-uri>
```

#### Google Cloud Run
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/<project>/ai-document-processor

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/<project>/ai-document-processor --platform managed
```

## Scaling Considerations

### Horizontal Scaling
- Stateless application design
- External session storage (Redis)
- Load balancer compatible

### Storage Scaling
- S3-compatible storage abstraction
- CDN integration ready
- File processing queue system

### Database Scaling
- Read replicas support
- Connection pooling
- Database migrations with Prisma

### Performance Optimization
- Next.js static generation
- Image optimization
- API response caching
- File upload streaming

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- File type and size validation
- SQL injection prevention (Prisma)
- XSS protection
- Rate limiting ready
- Environment variable security

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `./scripts/setup.sh` - Initial project setup
- `./scripts/dev.sh` - Start development environment

### Testing
```bash
# Add your testing framework
npm install --save-dev jest @testing-library/react
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This is a production-ready template. Customize according to your specific requirements and security policies.
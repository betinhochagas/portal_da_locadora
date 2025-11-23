# Cloud Storage Configuration Guide

## Overview

The Portal da Locadora implements a flexible storage adapter pattern that allows seamless switching between local file storage and cloud storage (AWS S3) without modifying application code.

## Architecture

### Storage Adapter Pattern

The system uses the **Adapter Pattern** to abstract storage operations:

```
StorageAdapter (Interface)
    ├── LocalStorageAdapter (Local disk storage)
    └── S3StorageAdapter (AWS S3 cloud storage)
```

### Benefits

- ✅ **Flexibility**: Switch between local and cloud storage via environment variable
- ✅ **Backward Compatibility**: Existing local storage continues to work
- ✅ **No Code Changes**: Change storage without modifying application code
- ✅ **Production Ready**: Cloud storage for scalability, backups, and CDN
- ✅ **Development Friendly**: Local storage for development without AWS costs

---

## Configuration

### Environment Variables

The storage type is controlled by the `STORAGE_TYPE` environment variable:

**For Local Storage (Development):**
```env
STORAGE_TYPE=local
```

**For AWS S3 (Production):**
```env
STORAGE_TYPE=s3

# AWS Credentials (required when STORAGE_TYPE=s3)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET=portal-locadora-uploads
```

---

## Local Storage Setup

### Configuration

Local storage is the default option and requires no additional setup.

**Environment Variables:**
```env
STORAGE_TYPE=local  # or omit this variable (defaults to local)
```

**Storage Location:**
- Files are stored in: `backend/uploads/`
- Files are served at: `http://localhost:3000/uploads/:filename`

**Advantages:**
- ✅ No cloud service costs
- ✅ No internet connection required
- ✅ Instant setup for development
- ✅ Full control over files

**Limitations:**
- ⚠️ No built-in backups
- ⚠️ No CDN for fast global delivery
- ⚠️ Limited scalability
- ⚠️ Files lost if server crashes without backups

---

## AWS S3 Setup

### Prerequisites

1. AWS Account ([Create one](https://aws.amazon.com/))
2. IAM User with S3 permissions
3. S3 Bucket created

### Step 1: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add users**
3. Username: `portal-locadora-s3`
4. Access type: **Programmatic access**
5. Click **Next: Permissions**

### Step 2: Set Permissions

Create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:HeadObject"
      ],
      "Resource": [
        "arn:aws:s3:::portal-locadora-uploads",
        "arn:aws:s3:::portal-locadora-uploads/*"
      ]
    }
  ]
}
```

### Step 3: Create S3 Bucket

1. Go to [S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Bucket name: `portal-locadora-uploads` (must be globally unique)
4. Region: `us-east-1` (or your preferred region)
5. **Block Public Access Settings:**
   - ✅ Block all public access (recommended for security)
   - Files will be accessed via presigned URLs
6. **Versioning:** Enable (optional, for file recovery)
7. **Encryption:** Enable server-side encryption (recommended)
8. Click **Create bucket**

### Step 4: Configure CORS (if needed)

If your frontend is on a different domain, configure CORS:

1. Go to your bucket → **Permissions** → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourfrontend.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 5: Configure Environment Variables

Update your `.env` file:

```env
STORAGE_TYPE=s3

AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET=portal-locadora-uploads
```

### Step 6: Test Upload

1. Restart the backend server
2. Upload a document through the application
3. Verify in S3 Console that the file appears in your bucket

**File URLs:**
- S3 provides presigned URLs valid for 1 hour
- Files are not publicly accessible (security best practice)

---

## Storage Adapter Implementation

### Interface

All storage adapters implement the `StorageAdapter` interface:

```typescript
export interface StorageAdapter {
  // Save a file and return its URL
  saveFile(file: Express.Multer.File, filename: string): Promise<string>;
  
  // Get the file path or presigned URL
  getFilePath(filename: string): Promise<string>;
  
  // Delete a file from storage
  deleteFile(filename: string): Promise<void>;
  
  // Check if a file exists
  fileExists(filename: string): Promise<boolean>;
}
```

### Local Storage Adapter

**Location:** `backend/src/modules/storage/adapters/local-storage.adapter.ts`

**How it works:**
- Saves files to `backend/uploads/` directory
- Returns local URLs like `/uploads/filename.jpg`
- Uses Node.js `fs` module for file operations

### S3 Storage Adapter

**Location:** `backend/src/modules/storage/adapters/s3-storage.adapter.ts`

**How it works:**
- Uses AWS SDK v3 (`@aws-sdk/client-s3`)
- Uploads files to configured S3 bucket
- Returns full S3 URLs
- Generates presigned URLs for secure file access (1-hour expiration)
- Handles file deletion and existence checks

---

## Migration Guide

### From Local to S3 (Production Deployment)

When migrating existing files from local storage to S3:

**Option 1: Manual Upload**
1. Download all files from `backend/uploads/` directory
2. Upload them to S3 bucket using AWS Console or CLI:
   ```bash
   aws s3 sync ./uploads/ s3://portal-locadora-uploads/
   ```
3. Update environment variable: `STORAGE_TYPE=s3`
4. Restart application

**Option 2: Keep Local Files (Hybrid)**
- Keep local files for backward compatibility
- New uploads go to S3
- Update database URLs to point to S3 for migrated files

**Note:** Consider writing a migration script if you have many files.

---

## Best Practices

### Development
- ✅ Use `STORAGE_TYPE=local` for development
- ✅ Add `backend/uploads/` to `.gitignore`
- ✅ Don't commit uploaded files to Git

### Production
- ✅ Use `STORAGE_TYPE=s3` for production
- ✅ Enable S3 bucket versioning for file recovery
- ✅ Enable S3 encryption at rest
- ✅ Set up S3 lifecycle policies to archive old files
- ✅ Use CloudFront CDN for better performance (optional)
- ✅ Set up automated S3 backups
- ✅ Monitor S3 costs and usage
- ✅ Use IAM roles instead of access keys when deploying on AWS (EC2, ECS, Lambda)

### Security
- ✅ Never commit AWS credentials to Git
- ✅ Use environment variables for all secrets
- ✅ Block public access to S3 bucket
- ✅ Use presigned URLs for file access
- ✅ Rotate AWS access keys regularly
- ✅ Enable AWS CloudTrail for audit logging
- ✅ Set appropriate IAM permissions (principle of least privilege)

---

## Troubleshooting

### Error: "AWS_BUCKET environment variable is required"

**Cause:** S3 storage is selected but bucket name is not configured

**Solution:** Add `AWS_BUCKET=your-bucket-name` to `.env`

### Error: "Access Denied" when uploading to S3

**Causes:**
1. Invalid AWS credentials
2. IAM user lacks S3 permissions
3. Bucket policy blocks access

**Solutions:**
1. Verify credentials in `.env` are correct
2. Check IAM user has PutObject permission
3. Review bucket policy and CORS settings

### Error: "Arquivo não encontrado no servidor"

**Cause:** File was deleted or never uploaded

**Solutions:**
1. Check if file exists in S3 Console
2. Verify storage adapter is correctly configured
3. Check database for correct filename

### Files not appearing after switching to S3

**Cause:** Old local files are not in S3

**Solution:** Run migration script or manually upload files to S3

---

## Cost Estimation (AWS S3)

### S3 Pricing (us-east-1)
- **Storage:** $0.023 per GB/month (first 50 TB)
- **PUT requests:** $0.005 per 1,000 requests
- **GET requests:** $0.0004 per 1,000 requests

### Example Monthly Cost
**Scenario:** 10,000 documents, average 500 KB each

- Storage: 5 GB × $0.023 = $0.12/month
- Uploads: 10,000 PUT requests = $0.05/month
- Downloads: 50,000 GET requests = $0.02/month

**Total:** ~$0.20/month (incredibly affordable!)

### Cost Optimization Tips
- ✅ Use S3 Intelligent-Tiering for automatic cost optimization
- ✅ Set up lifecycle policies to move old files to S3 Glacier
- ✅ Enable compression for PDFs when possible
- ✅ Use CloudFront CDN to reduce GET request costs

---

## Alternative Cloud Storage Providers

While this implementation uses AWS S3, the adapter pattern makes it easy to add support for other providers:

### Cloudflare R2
- S3-compatible API
- No egress fees
- Similar implementation to S3StorageAdapter

### Google Cloud Storage
- Competitive pricing
- Global CDN
- Requires different SDK (`@google-cloud/storage`)

### Azure Blob Storage
- Microsoft's cloud storage
- Good for .NET environments
- Requires Azure SDK

**To add support:** Create a new adapter class implementing `StorageAdapter` interface.

---

## Monitoring and Maintenance

### S3 Monitoring
1. **AWS CloudWatch:** Monitor S3 metrics
   - Number of objects
   - Storage size
   - Request rates
   - Error rates

2. **S3 Bucket Metrics:** Enable in S3 Console
   - Storage analytics
   - Access logs
   - Inventory reports

3. **Cost Monitoring:**
   - Set up AWS Budgets
   - Enable Cost Explorer
   - Review monthly AWS bills

### Backup Strategy
1. **S3 Versioning:** Keep file history
2. **S3 Replication:** Copy to another region
3. **Database Backups:** Include file metadata
4. **Disaster Recovery:** Test restore procedures

---

## Testing

### Testing Local Storage
```bash
# 1. Set environment
STORAGE_TYPE=local

# 2. Upload a test file via API
curl -X POST http://localhost:3000/uploads \
  -F "file=@test.jpg" \
  -F "tipo=FOTO_PERFIL" \
  -F "motoristaId=123"

# 3. Verify file exists in backend/uploads/
```

### Testing S3 Storage
```bash
# 1. Set environment
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET=portal-locadora-uploads

# 2. Upload a test file via API
curl -X POST http://localhost:3000/uploads \
  -F "file=@test.jpg" \
  -F "tipo=FOTO_PERFIL" \
  -F "motoristaId=123"

# 3. Verify file exists in S3 Console
# 4. Test download with presigned URL
```

---

## References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Design Patterns: Adapter Pattern](https://refactoring.guru/design-patterns/adapter)

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review application logs
3. Check AWS CloudWatch logs (for S3 issues)
4. Contact development team

---

**Last Updated:** November 2025  
**Version:** 1.0.0

# ============================================================================
# S3 — Lưu tài liệu thô (raw documents) trước khi embedding vào Vector DB
# ============================================================================

resource "aws_s3_bucket" "raw_docs" {
  bucket        = local.raw_docs_bucket_name
  force_destroy = var.s3_force_destroy
  tags          = local.tags
}

resource "aws_s3_bucket_versioning" "raw_docs" {
  bucket = aws_s3_bucket.raw_docs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "raw_docs" {
  bucket = aws_s3_bucket.raw_docs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "raw_docs" {
  bucket = aws_s3_bucket.raw_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "raw_docs" {
  bucket = aws_s3_bucket.raw_docs.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

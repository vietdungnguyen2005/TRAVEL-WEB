# ============================================================================
# Amazon Bedrock — IAM Role (IRSA) + VPC Endpoint (PHASE 5)
# ============================================================================
# 1) IRSA: Kubernetes ServiceAccount "ai-agent-sa" in namespace "ai-platform"
#    assumes this IAM role to call Bedrock InvokeModel.
# 2) VPC Interface Endpoint: Pods in private subnets reach Bedrock without
#    traversing the NAT Gateway, cutting latency and egress cost.
# ============================================================================

# ---------------------------------------------------------------------------
# Data: OIDC provider from EKS
# ---------------------------------------------------------------------------
data "aws_iam_openid_connect_provider" "eks" {
  url = module.eks.cluster_oidc_issuer_url
}

locals {
  oidc_provider_arn = data.aws_iam_openid_connect_provider.eks.arn
  oidc_issuer       = replace(module.eks.cluster_oidc_issuer_url, "https://", "")
  bedrock_namespace  = "ai-platform"
  bedrock_sa_name    = "ai-agent-sa"
}

# ---------------------------------------------------------------------------
# IAM Role — trust policy scoped to the specific SA
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ai_agent_bedrock" {
  name = "${local.name}-ai-agent-bedrock-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
            "${local.oidc_issuer}:sub" = "system:serviceaccount:${local.bedrock_namespace}:${local.bedrock_sa_name}"
          }
        }
      }
    ]
  })

  tags = local.tags
}

# ---------------------------------------------------------------------------
# IAM Policy — invoke Bedrock models only
# ---------------------------------------------------------------------------
resource "aws_iam_policy" "bedrock_invoke" {
  name        = "${local.name}-bedrock-invoke"
  description = "Allow invoking Bedrock models for AI agent"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "BedrockInvoke"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "ai_agent_bedrock" {
  role       = aws_iam_role.ai_agent_bedrock.name
  policy_arn = aws_iam_policy.bedrock_invoke.arn
}

# ---------------------------------------------------------------------------
# VPC Interface Endpoint — Bedrock Runtime
# Pods in private subnets reach Bedrock without NAT, cutting latency & cost.
# ---------------------------------------------------------------------------
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "${local.name}-vpce-"
  description = "Security group for VPC Interface Endpoints"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-vpce-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "vpce_from_vpc" {
  security_group_id = aws_security_group.vpc_endpoints.id
  description       = "HTTPS from VPC"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = var.vpc_cidr
}

resource "aws_vpc_security_group_egress_rule" "vpce_all_out" {
  security_group_id = aws_security_group.vpc_endpoints.id
  description       = "All outbound"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_endpoint" "bedrock_runtime" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.bedrock-runtime"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(local.tags, {
    Name = "${local.name}-bedrock-endpoint"
  })
}

# S3 Gateway Endpoint — free, no NAT traffic cost for S3 access
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids

  tags = merge(local.tags, {
    Name = "${local.name}-s3-endpoint"
  })
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "bedrock_role_arn" {
  value       = aws_iam_role.ai_agent_bedrock.arn
  description = "IAM Role ARN for AI Agent pods (annotate K8s ServiceAccount)"
}

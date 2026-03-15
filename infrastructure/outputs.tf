# ============================================================================
# Outputs — Thông tin quan trọng sau khi terraform apply
# ============================================================================

# --- VPC ---

output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "VPC ID"
}

output "vpc_cidr" {
  value       = module.vpc.vpc_cidr_block
  description = "VPC CIDR block"
}

output "public_subnet_ids" {
  value       = module.vpc.public_subnets
  description = "Public subnet IDs"
}

output "private_subnet_ids" {
  value       = module.vpc.private_subnets
  description = "Private subnet IDs"
}

output "nat_gateway_ids" {
  value       = module.vpc.natgw_ids
  description = "NAT Gateway IDs"
}

output "availability_zones" {
  value       = local.azs
  description = "Availability Zones being used"
}

# --- Security Groups ---

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "ALB Security Group ID"
}

output "backend_security_group_id" {
  value       = aws_security_group.backend.id
  description = "Backend Security Group ID"
}

output "frontend_security_group_id" {
  value       = aws_security_group.frontend.id
  description = "Frontend Security Group ID"
}

output "monitoring_security_group_id" {
  value       = aws_security_group.monitoring.id
  description = "Monitoring Security Group ID"
}

# --- ECR ---

output "ecr_backend_repository_url" {
  value       = aws_ecr_repository.backend_repo.repository_url
  description = "ECR URL for backend-agent image"
}

output "ecr_frontend_repository_url" {
  value       = aws_ecr_repository.frontend_repo.repository_url
  description = "ECR URL for frontend-ui image"
}

# --- S3 ---

output "raw_docs_bucket_name" {
  value       = aws_s3_bucket.raw_docs.bucket
  description = "S3 bucket for raw documents"
}

# --- EKS ---

output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "EKS cluster name"
}

output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "EKS cluster API endpoint"
}

output "eks_cluster_certificate_authority" {
  value       = module.eks.cluster_certificate_authority_data
  description = "Base64 encoded CA cert for EKS"
  sensitive   = true
}

output "eks_node_security_group_id" {
  value       = module.eks.node_security_group_id
  description = "Security group ID attached to EKS worker nodes"
}

output "kubectl_config_command" {
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
  description = "Command to configure kubectl for this cluster"
}

# --- RDS ---

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS PostgreSQL endpoint (host:port)"
}

output "rds_hostname" {
  value       = aws_db_instance.postgres.address
  description = "RDS PostgreSQL hostname"
}

output "rds_port" {
  value       = aws_db_instance.postgres.port
  description = "RDS PostgreSQL port"
}

output "rds_database_name" {
  value       = aws_db_instance.postgres.db_name
  description = "RDS database name"
}

output "rds_security_group_id" {
  value       = aws_security_group.rds.id
  description = "RDS Security Group ID"
}

# --- ArgoCD ---

output "argocd_namespace" {
  value       = kubernetes_namespace.argocd.metadata[0].name
  description = "Namespace where ArgoCD is installed"
}

output "argocd_port_forward_command" {
  value       = "kubectl port-forward svc/argocd-server -n argocd 8080:443"
  description = "Command to access ArgoCD UI via localhost:8080"
}

output "argocd_initial_admin_password" {
  value       = "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
  description = "Command to retrieve ArgoCD admin password"
}

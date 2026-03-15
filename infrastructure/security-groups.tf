# ============================================================================
# Security Groups — Tường lửa cho các dịch vụ
# Cho phép các dịch vụ nói chuyện với nhau nội bộ, chặn truy cập trái phép
# ============================================================================

# ---------------------------------------------------------------------------
# ALB / Load Balancer — Cổng vào duy nhất từ Internet
# ---------------------------------------------------------------------------
resource "aws_security_group" "alb" {
  name_prefix = "${local.name}-alb-"
  description = "Security group for Application Load Balancer"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-alb-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from internet"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from internet"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_all_out" {
  security_group_id = aws_security_group.alb.id
  description       = "All outbound to VPC"
  ip_protocol       = "-1"
  cidr_ipv4         = var.vpc_cidr
}

# ---------------------------------------------------------------------------
# Frontend (Streamlit) — Chỉ nhận traffic từ ALB
# ---------------------------------------------------------------------------
resource "aws_security_group" "frontend" {
  name_prefix = "${local.name}-frontend-"
  description = "Security group for Frontend UI (Streamlit)"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-frontend-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "frontend_from_alb" {
  security_group_id            = aws_security_group.frontend.id
  description                  = "Streamlit port from ALB"
  from_port                    = 8501
  to_port                      = 8501
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_egress_rule" "frontend_all_out" {
  security_group_id = aws_security_group.frontend.id
  description       = "All outbound (connect to Backend)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---------------------------------------------------------------------------
# Backend (FastAPI) — Nhận traffic từ ALB và Frontend
# ---------------------------------------------------------------------------
resource "aws_security_group" "backend" {
  name_prefix = "${local.name}-backend-"
  description = "Security group for Backend API (FastAPI)"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-backend-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "backend_from_alb" {
  security_group_id            = aws_security_group.backend.id
  description                  = "Backend API from ALB"
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_ingress_rule" "backend_from_frontend" {
  security_group_id            = aws_security_group.backend.id
  description                  = "Backend API from Frontend"
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.frontend.id
}

resource "aws_vpc_security_group_egress_rule" "backend_all_out" {
  security_group_id = aws_security_group.backend.id
  description       = "All outbound (external APIs: Gemini, Pinecone, OpenAI)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---------------------------------------------------------------------------
# Monitoring (Prometheus + Grafana) — Chỉ truy cập nội bộ VPC
# ---------------------------------------------------------------------------
resource "aws_security_group" "monitoring" {
  name_prefix = "${local.name}-monitoring-"
  description = "Security group for Prometheus and Grafana"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-monitoring-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "monitoring_prometheus" {
  security_group_id = aws_security_group.monitoring.id
  description       = "Prometheus from VPC"
  from_port         = 9090
  to_port           = 9090
  ip_protocol       = "tcp"
  cidr_ipv4         = var.vpc_cidr
}

resource "aws_vpc_security_group_ingress_rule" "monitoring_grafana" {
  security_group_id = aws_security_group.monitoring.id
  description       = "Grafana from VPC"
  from_port         = 3000
  to_port           = 3000
  ip_protocol       = "tcp"
  cidr_ipv4         = var.vpc_cidr
}

resource "aws_vpc_security_group_ingress_rule" "monitoring_from_backend" {
  security_group_id            = aws_security_group.monitoring.id
  description                  = "Metrics scrape from Backend"
  from_port                    = 9090
  to_port                      = 9090
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.backend.id
}

resource "aws_vpc_security_group_egress_rule" "monitoring_all_out" {
  security_group_id = aws_security_group.monitoring.id
  description       = "All outbound (scrape targets)"
  ip_protocol       = "-1"
  cidr_ipv4         = var.vpc_cidr
}

# ---------------------------------------------------------------------------
# RDS PostgreSQL — Chỉ cho phép truy cập từ EKS Worker Nodes
# ---------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-rds-"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-rds-sg" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_eks" {
  security_group_id            = aws_security_group.rds.id
  description                  = "PostgreSQL from EKS worker nodes"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = module.eks.node_security_group_id
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_backend" {
  security_group_id            = aws_security_group.rds.id
  description                  = "PostgreSQL from Backend SG"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.backend.id
}

resource "aws_vpc_security_group_egress_rule" "rds_all_out" {
  security_group_id = aws_security_group.rds.id
  description       = "All outbound"
  ip_protocol       = "-1"
  cidr_ipv4         = var.vpc_cidr
}

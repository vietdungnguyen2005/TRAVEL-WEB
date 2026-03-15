# 🏗️ Architecture Documentation

## Overview

AI Platform with RAG (Retrieval-Augmented Generation) deployed on AWS EKS with full CI/CD automation.

---

## 🎯 High-Level Architecture

```mermaid
graph TB
    subgraph "User"
        U[👤 User Browser]
    end
    
    subgraph "AWS Cloud - ap-southeast-1"
        subgraph "Route 53"
            DNS[DNS]
        end
        
        subgraph "ACM"
            CERT[SSL Certificate]
        end
        
        subgraph "VPC 10.0.0.0/16"
            subgraph "Public Subnets"
                NLB[Network Load Balancer]
                NAT[NAT Gateway]
            end
            
            subgraph "Private Subnets - EKS Cluster"
                subgraph "Nginx Proxy"
                    NGINX[Nginx Pod]
                end
                
                subgraph "Frontend"
                    FE1[Streamlit Pod 1]
                    FE2[Streamlit Pod 2]
                end
                
                subgraph "Backend"
                    BE1[FastAPI Pod 1]
                    BE2[FastAPI Pod 2]
                end
                
                HPA[Horizontal Pod Autoscaler]
            end
        end
        
        subgraph "ECR"
            ECRBE[Backend Image]
            ECRFE[Frontend Image]
        end
        
        subgraph "S3"
            S3DOCS[Document Storage]
        end
    end
    
    subgraph "External Services"
        OPENAI[OpenAI GPT-4]
        PINECONE[Pinecone Vector DB]
    end
    
    subgraph "GitHub"
        CODE[Source Code]
        ACTIONS[GitHub Actions]
    end
    
    U --> DNS --> NLB
    NLB --> NGINX
    NGINX --> FE1 & FE2
    FE1 & FE2 --> BE1 & BE2
    BE1 & BE2 --> OPENAI
    BE1 & BE2 --> PINECONE
    BE1 & BE2 --> S3DOCS
    
    CODE --> ACTIONS
    ACTIONS --> ECRBE & ECRFE
    ACTIONS --> BE1 & BE2 & FE1 & FE2
    
    HPA -.monitors.-> BE1 & BE2 & FE1 & FE2
```

---

## 🔄 CI/CD Pipeline Architecture

```mermaid
graph LR
    subgraph "Developer"
        DEV[👨‍💻 Developer]
    end
    
    subgraph "GitHub"
        REPO[Repository<br/>main branch]
        GHA[GitHub Actions]
    end
    
    subgraph "Build & Push Job"
        CHECKOUT[Checkout Code]
        BUILD_BE[Build Backend Image]
        BUILD_FE[Build Frontend Image]
        TAG[Tag with SHA + latest]
        PUSH_ECR[Push to ECR]
    end
    
    subgraph "Deploy Job"
        AWS_AUTH[Configure AWS Credentials]
        KUBE_CONFIG[Update kubeconfig]
        CREATE_SECRETS[Create K8s Secrets]
        APPLY[Apply Manifests]
        ROLLOUT[Verify Rollout]
    end
    
    subgraph "AWS"
        ECR[Elastic Container Registry]
        EKS[EKS Cluster]
        PODS[Running Pods]
    end
    
    DEV -->|git push| REPO
    REPO -->|trigger| GHA
    GHA --> CHECKOUT
    CHECKOUT --> BUILD_BE
    CHECKOUT --> BUILD_FE
    BUILD_BE --> TAG
    BUILD_FE --> TAG
    TAG --> PUSH_ECR
    PUSH_ECR --> ECR
    
    ECR --> AWS_AUTH
    AWS_AUTH --> KUBE_CONFIG
    KUBE_CONFIG --> CREATE_SECRETS
    CREATE_SECRETS --> APPLY
    APPLY --> EKS
    ROLLOUT --> PODS
```

---

## 🧩 Component Architecture

### Backend (FastAPI + LangChain)

```mermaid
graph TD
    subgraph "Backend Pod"
        API[FastAPI Application]
        
        subgraph "LangChain Agent"
            AGENT[LangGraph Agent]
            LLM[OpenAI LLM<br/>gpt-4o-mini]
            TOOLS[Tools]
        end
        
        subgraph "Tools"
            RAG[RAG Tool]
            SEARCH[Document Search]
        end
        
        subgraph "Vector Store"
            EMBED[Embeddings]
            QUERY[Query Handler]
        end
    end
    
    REQUEST[HTTP Request] --> API
    API --> AGENT
    AGENT --> LLM
    AGENT --> TOOLS
    RAG --> EMBED
    SEARCH --> QUERY
    QUERY --> PINECONE_EXT[Pinecone API]
    LLM --> OPENAI_EXT[OpenAI API]
```

### Frontend (Streamlit)

```mermaid
graph TD
    subgraph "Frontend Pod"
        UI[Streamlit UI]
        
        subgraph "Components"
            CHAT[Chat Interface]
            SIDEBAR[Sidebar<br/>Health Status]
            SESSION[Session State]
        end
        
        subgraph "API Client"
            HTTP[HTTP Client]
            HEALTH[Health Checker]
        end
    end
    
    USER[👤 User] --> UI
    UI --> CHAT
    UI --> SIDEBAR
    CHAT --> SESSION
    CHAT --> HTTP
    SIDEBAR --> HEALTH
    HTTP --> BACKEND[Backend API]
    HEALTH --> BACKEND
```

---

## 🌐 Network Architecture

```mermaid
graph TB
    subgraph "VPC 10.0.0.0/16"
        subgraph "AZ 1 - ap-southeast-1a"
            PUB1[Public Subnet<br/>10.0.1.0/24]
            PRIV1[Private Subnet<br/>10.0.101.0/24]
        end
        
        subgraph "AZ 2 - ap-southeast-1b"
            PUB2[Public Subnet<br/>10.0.2.0/24]
            PRIV2[Private Subnet<br/>10.0.102.0/24]
        end
        
        IGW[Internet Gateway]
        NAT1[NAT Gateway]
        
        subgraph "Security"
            SG_NLB[SG: NLB<br/>80, 443]
            SG_NODES[SG: EKS Nodes<br/>All from NLB]
            NP[Network Policies]
        end
    end
    
    INTERNET[Internet] --> IGW
    IGW --> PUB1 & PUB2
    PUB1 --> NAT1
    NAT1 --> PRIV1 & PRIV2
    
    PRIV1 & PRIV2 --> SG_NODES
    PUB1 & PUB2 --> SG_NLB
```

---

## 💾 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant NLB
    participant Nginx
    participant Frontend
    participant Backend
    participant Pinecone
    participant OpenAI
    
    User->>NLB: HTTPS Request
    NLB->>Nginx: Forward to Pod
    Nginx->>Frontend: Route to /
    Frontend->>User: Render Chat UI
    
    User->>Frontend: Send Message
    Frontend->>Backend: POST /chat
    Backend->>Pinecone: Query Vectors<br/>(Top-K similar docs)
    Pinecone-->>Backend: Return Documents
    Backend->>OpenAI: Chat Completion<br/>(with context)
    OpenAI-->>Backend: AI Response
    Backend-->>Frontend: JSON Response
    Frontend-->>User: Display Answer
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Secrets Management"
        GH_SECRETS[GitHub Secrets]
        K8S_SECRETS[Kubernetes Secrets]
    end
    
    subgraph "Network Security"
        NP[Network Policies]
        SG[Security Groups]
        NACL[Network ACLs]
    end
    
    subgraph "Pod Security"
        PSP[Pod Security Context<br/>- runAsNonRoot<br/>- readOnlyRootFilesystem]
        PDB[Pod Disruption Budget]
    end
    
    subgraph "Access Control"
        IAM[IAM Roles]
        RBAC[K8s RBAC]
    end
    
    subgraph "TLS/SSL"
        ACM[AWS Certificate Manager]
        HTTPS[HTTPS Only]
    end
    
    GH_SECRETS -->|encrypted| K8S_SECRETS
    K8S_SECRETS --> PODS[Application Pods]
    NP --> PODS
    SG --> NODES[EKS Nodes]
    PSP --> PODS
    IAM --> NODES
    RBAC --> PODS
    ACM --> NLB
```

---

## 📊 Monitoring & Observability

```mermaid
graph TB
    subgraph "Applications"
        BE[Backend Pods]
        FE[Frontend Pods]
    end
    
    subgraph "Metrics Collection"
        METRICS_SERVER[Metrics Server]
        PROMETHEUS[Prometheus]
        CW_AGENT[CloudWatch Agent]
    end
    
    subgraph "Visualization"
        GRAFANA[Grafana Dashboards]
        CW_INSIGHTS[CloudWatch Insights]
    end
    
    subgraph "Alerting"
        ALERT_MGR[AlertManager]
        CW_ALARMS[CloudWatch Alarms]
        SNS[SNS Topics]
    end
    
    subgraph "Logs"
        FLUENTD[FluentD]
        CW_LOGS[CloudWatch Logs]
    end
    
    BE & FE -->|/metrics| PROMETHEUS
    BE & FE -->|pod metrics| METRICS_SERVER
    BE & FE -->|logs| FLUENTD
    
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERT_MGR
    
    BE & FE --> CW_AGENT
    CW_AGENT --> CW_INSIGHTS
    CW_AGENT --> CW_ALARMS
    
    FLUENTD --> CW_LOGS
    CW_ALARMS --> SNS
    ALERT_MGR --> SNS
```

---

## 🚀 Scaling Architecture

```mermaid
graph TB
    subgraph "Horizontal Pod Autoscaler"
        HPA_BE[Backend HPA<br/>Min: 2, Max: 10<br/>Target: 70% CPU]
        HPA_FE[Frontend HPA<br/>Min: 2, Max: 5<br/>Target: 70% CPU]
    end
    
    subgraph "Cluster Autoscaler"
        CA[Cluster Autoscaler<br/>Add/Remove Nodes]
    end
    
    subgraph "EKS Node Group"
        NODE1[t3.small Node 1]
        NODE2[t3.small Node 2]
        NODE3[t3.small Node N]
    end
    
    subgraph "Pods"
        BE_PODS[Backend Pods<br/>2-10 replicas]
        FE_PODS[Frontend Pods<br/>2-5 replicas]
    end
    
    METRICS[Metrics Server] -->|CPU/Memory| HPA_BE
    METRICS -->|CPU/Memory| HPA_FE
    
    HPA_BE -->|scale| BE_PODS
    HPA_FE -->|scale| FE_PODS
    
    BE_PODS & FE_PODS -->|resource pressure| CA
    CA -->|add/remove| NODE1 & NODE2 & NODE3
```

---

## 📦 Container Image Build Process

```mermaid
graph LR
    subgraph "Source"
        CODE[Source Code]
        DOCKERFILE[Dockerfile]
    end
    
    subgraph "Multi-Stage Build"
        STAGE1[Stage 1: Dependencies<br/>Python 3.9/3.10<br/>pip install]
        STAGE2[Stage 2: Runtime<br/>Python slim<br/>Copy app + deps]
    end
    
    subgraph "Optimization"
        CACHE[Layer Caching]
        SLIM[Minimal Base Image]
    end
    
    subgraph "Registry"
        ECR[Amazon ECR]
        TAGS[Tags:<br/>- latest<br/>- SHA-xyz123]
    end
    
    CODE --> STAGE1
    DOCKERFILE --> STAGE1
    STAGE1 --> STAGE2
    STAGE2 --> CACHE
    CACHE --> SLIM
    SLIM --> ECR
    ECR --> TAGS
```

---

## 🗂️ Directory Structure Alignment

```
my-ai-platform/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml              # CI/CD Pipeline
│   └── SECRETS_SETUP.md            # Secrets Documentation
│
├── backend-agent/
│   ├── main.py                     # FastAPI + LangChain Agent
│   ├── embed_documents.py          # Pinecone Embedding
│   ├── Dockerfile                  # Multi-stage build
│   └── requirements.txt            # Python dependencies
│
├── frontend-ui/
│   ├── app.py                      # Streamlit UI
│   ├── Dockerfile                  # Multi-stage build
│   └── requirements.txt
│
├── infrastructure/
│   └── main.tf                     # Terraform (VPC, EKS, ECR, S3)
│
├── k8s-manifests/
│   ├── deployment.yaml             # Backend/Frontend Deployments & Services
│   ├── nginx-ingress.yaml          # Nginx Proxy, HPA, PDB
│   ├── network-policy.yaml         # Network isolation rules
│   └── MONITORING.md               # Observability guide
│
├── nginx.conf                      # Nginx reverse proxy config
├── docker-compose.yml              # Local development
├── DEPLOYMENT.md                   # Production deployment guide
├── NEXT_STEPS.md                   # Post-deployment actions
└── README.md                       # Project overview
```

---

## 🔄 Infrastructure as Code

### Terraform Resources Created

```hcl
# VPC Module
module "vpc" {
  cidr            = "10.0.0.0/16"
  azs             = 2 (ap-southeast-1a, ap-southeast-1b)
  public_subnets  = [10.0.1.0/24, 10.0.2.0/24]
  private_subnets = [10.0.101.0/24, 10.0.102.0/24]
  nat_gateways    = 1 (shared)
  enable_dns      = true
}

# EKS Module
module "eks" {
  cluster_version       = "1.30"
  cluster_name          = "my-ai-platform-eks"
  endpoint_public       = false
  endpoint_private      = true
  
  node_groups = {
    main = {
      instance_types = ["t3.small"]
      min_size       = 1
      max_size       = 3
      desired_size   = 1
    }
  }
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name = "my-ai-platform-backend-agent"
  image_scanning = true
}

resource "aws_ecr_repository" "frontend" {
  name = "my-ai-platform-frontend-ui"
  image_scanning = true
}

# S3 Bucket
resource "aws_s3_bucket" "documents" {
  bucket = "my-ai-platform-raw-docs-${random_suffix}"
  versioning = enabled
  encryption = AES256
}
```

---

## 🎯 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Streamlit 1.31+ | Chat UI |
| **Backend** | FastAPI 0.110+ | REST API |
| **AI Agent** | LangChain 0.2+, LangGraph | Orchestration |
| **LLM** | OpenAI GPT-4o-mini | Text Generation |
| **Vector DB** | Pinecone 4.0+ | Similarity Search |
| **Container Runtime** | Docker 29.1+ | Containerization |
| **Orchestration** | Kubernetes 1.30 | Pod Management |
| **Cloud Platform** | AWS EKS | Managed K8s |
| **CI/CD** | GitHub Actions | Automation |
| **IaC** | Terraform 1.5+ | Infrastructure |
| **Reverse Proxy** | Nginx 1.25 | Load Balancing |
| **Monitoring** | Prometheus + Grafana / CloudWatch | Observability |
| **Secrets** | Kubernetes Secrets | Credential Management |

---

## 📊 Cost Estimation (Monthly)

| Service | Type | Quantity | Cost (USD) |
|---------|------|----------|------------|
| EKS Cluster | Control Plane | 1 | $73 |
| EC2 (t3.small) | Worker Nodes | 1-3 | $15-45 |
| NAT Gateway | Networking | 1 | $32 |
| Network Load Balancer | Load Balancing | 1-2 | $16-32 |
| ECR | Image Storage | ~5 GB | $0.50 |
| S3 | Document Storage | ~10 GB | $0.25 |
| **CloudWatch** | Logs & Metrics | Standard | $10-20 |
| **Data Transfer** | Egress | ~100 GB | $9 |
| **External APIs** | | | |
| - OpenAI | API Calls | Variable | $10-50 |
| - Pinecone | Vector Search | Starter tier | $70 |
| **TOTAL** | | | **~$235-350/month** |

**Optimization Tips:**
- Use Spot Instances for nodes: **Save 70%**
- Scale to zero during off-hours: **Save 50%**
- Use S3 Intelligent Tiering: **Save 30%**

---

## 🔍 Key Metrics to Monitor

### Application Metrics
- **Request Rate**: requests/second
- **Response Time**: p50, p95, p99 latency
- **Error Rate**: 4xx, 5xx errors
- **Chat Messages**: messages/hour
- **RAG Queries**: queries/minute
- **Token Usage**: OpenAI tokens consumed

### Infrastructure Metrics
- **Pod CPU**: % utilization
- **Pod Memory**: GB used
- **Node CPU**: % utilization
- **Pod Restarts**: count
- **HPA Events**: scale up/down
- **Network I/O**: GB transferred

### Business Metrics
- **Active Users**: concurrent users
- **Session Duration**: average length
- **Query Success Rate**: %
- **Cost per Query**: USD
- **Document Upload Rate**: docs/day

---

**Architecture maintained by:** AI Platform Team  
**Last Updated:** Phase 3 - CI/CD Pipeline Complete  
**Version:** 1.0.0

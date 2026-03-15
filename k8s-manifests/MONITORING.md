# Monitoring Setup for AI Platform

This guide helps you set up monitoring and observability for your EKS deployment.

---

## 📊 Option 1: Prometheus + Grafana (Recommended)

### 1.1 Install Prometheus Stack

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin123
```

### 1.2 Expose Grafana

```bash
# Port-forward Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

# Access Grafana
# URL: http://localhost:3000
# Username: admin
# Password: admin123
```

### 1.3 Create ServiceMonitor for Backend

Create `k8s-manifests/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-monitor
  namespace: default
  labels:
    app: ai-platform
spec:
  selector:
    matchLabels:
      app: ai-platform
      component: backend
  endpoints:
  - port: http
    interval: 30s
    path: /metrics
```

### 1.4 Add metrics endpoint to FastAPI

Update `backend-agent/main.py`:

```python
from prometheus_client import Counter, Histogram, make_asgi_app

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

# Mount Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

Add to `requirements.txt`:
```
prometheus-client>=0.19.0
```

### 1.5 Import Grafana Dashboards

1. Go to Grafana → Dashboards → Import
2. Use these dashboard IDs:
   - **15760** - Kubernetes cluster monitoring
   - **13770** - Kubernetes pods monitoring
   - **11074** - Node Exporter Full

---

## ☁️ Option 2: AWS CloudWatch Container Insights

### 2.1 Enable Container Insights

```bash
aws eks update-cluster-config \
  --region ap-southeast-1 \
  --name my-ai-platform-eks \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}' \
  --profile dev
```

### 2.2 Install CloudWatch Agent

```bash
# Create namespace
kubectl create namespace amazon-cloudwatch

# Install CloudWatch agent
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml
```

### 2.3 View metrics in CloudWatch

1. Go to **CloudWatch Console**
2. Navigate to **Container Insights**
3. Select cluster: `my-ai-platform-eks`

---

## 🚨 Alerting

### Prometheus AlertManager

Create `k8s-manifests/alertrules.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: ai-platform-alerts
  namespace: monitoring
  labels:
    prometheus: kube-prometheus
spec:
  groups:
  - name: ai-platform
    interval: 30s
    rules:
    - alert: HighPodCPU
      expr: rate(container_cpu_usage_seconds_total{namespace="default",pod=~"backend.*|frontend.*"}[5m]) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage on {{ $labels.pod }}"
        description: "Pod {{ $labels.pod }} CPU usage is above 80%"
    
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total{namespace="default"}[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} is crash looping"
    
    - alert: BackendDown
      expr: up{job="backend-service"} == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Backend service is down"
```

Apply:
```bash
kubectl apply -f k8s-manifests/alertrules.yaml
```

### CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ai-platform-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --region ap-southeast-1 \
  --profile dev
```

---

## 📝 Logging

### CloudWatch Logs

Already enabled via CloudWatch Container Insights. View logs:

```bash
# From CLI
aws logs tail /aws/eks/my-ai-platform-eks/cluster --follow --region ap-southeast-1 --profile dev

# Or use kubectl
kubectl logs -f deployment/backend-deployment
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Add Elastic Helm repo
helm repo add elastic https://helm.elastic.co
helm repo update

# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace \
  --set replicas=1 \
  --set minimumMasterNodes=1

# Install Kibana
helm install kibana elastic/kibana --namespace logging

# Install Filebeat (log shipper)
helm install filebeat elastic/filebeat --namespace logging
```

---

## 🎯 Custom Metrics

### Backend metrics to track:

```python
from prometheus_client import Counter, Gauge, Histogram

# Request metrics
http_requests_total = Counter('http_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
http_request_duration = Histogram('http_request_duration_seconds', 'Request duration')

# Business metrics
chat_messages_total = Counter('chat_messages_total', 'Total chat messages')
rag_queries_total = Counter('rag_queries_total', 'Total RAG queries')
rag_query_duration = Histogram('rag_query_duration_seconds', 'RAG query duration')
pinecone_errors = Counter('pinecone_errors_total', 'Pinecone API errors')
openai_errors = Counter('openai_errors_total', 'OpenAI API errors')

# System metrics
active_connections = Gauge('active_connections', 'Active WebSocket connections')
```

---

## 📊 Key Dashboards to Create

### 1. Application Performance Dashboard

- Request rate (requests/second)
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active users/connections

### 2. Infrastructure Dashboard

- Pod CPU usage
- Pod memory usage
- Pod restart count
- Node CPU/Memory

### 3. Business Metrics Dashboard

- Chat messages per hour
- RAG query latency
- API call success rate
- Cost per request

---

## 🔧 Useful Queries

### Prometheus PromQL

```promql
# Request rate
rate(http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Pod memory usage
container_memory_usage_bytes{namespace="default", pod=~"backend.*"}

# Pod CPU usage
rate(container_cpu_usage_seconds_total{namespace="default"}[5m])
```

### CloudWatch Insights

```
# Parse logs
fields @timestamp, @message
| filter @logStream like /backend/
| sort @timestamp desc
| limit 100

# Error analysis
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)
```

---

## ✅ Monitoring Checklist

- [ ] Prometheus + Grafana installed
- [ ] ServiceMonitors created
- [ ] Dashboards imported
- [ ] Alert rules configured
- [ ] CloudWatch Container Insights enabled
- [ ] Log aggregation setup
- [ ] Custom metrics instrumented
- [ ] Alert notifications configured (Slack, email, PagerDuty)

---

## 📚 Resources

- [Prometheus Operator](https://prometheus-operator.dev/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [CloudWatch Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html)
- [FastAPI + Prometheus](https://github.com/prometheus/client_python)

# 🔍 AI Platform Monitoring Stack

Hệ thống giám sát (Monitoring) toàn diện cho AI Platform sử dụng Prometheus và Grafana.

## 🎯 Mục tiêu

- **Thu thập metrics**: Prometheus scrape metrics từ containers và services
- **Visualization**: Grafana dashboard để theo dõi real-time
- **Container monitoring**: cAdvisor theo dõi Docker container resources
- **API performance**: Request rate, latency, error tracking

## 🏗️ Kiến trúc

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Backend   │─────▶│ Prometheus  │─────▶│   Grafana   │
│  (FastAPI)  │      │   (Metrics  │      │ (Dashboard) │
└─────────────┘      │   Storage)  │      └─────────────┘
                     └─────────────┘
                            ▲
                            │
                     ┌─────────────┐
                     │  cAdvisor   │
                     │ (Container  │
                     │   Metrics)  │
                     └─────────────┘
```

## 📊 Components

### 1. Prometheus (Port 9090)
- **Role**: Metrics collection và time-series storage
- **Config**: `monitoring/prometheus.yml`
- **Scrape targets**:
  - Backend API (`/metrics`)
  - cAdvisor (container metrics)
  - Self-monitoring

### 2. Grafana (Port 3000)
- **Role**: Visualization và dashboards
- **Default credentials**: 
  - Username: `admin`
  - Password: `admin` (thay đổi sau lần đầu login)
- **Dashboards**: Auto-provisioned từ `monitoring/grafana/provisioning/dashboards/`

### 3. cAdvisor (Port 8080)
- **Role**: Theo dõi Docker container resources
- **Metrics**: CPU, Memory, Network, Disk I/O

## 🚀 Khởi động Monitoring Stack

### Cách 1: Khởi động tất cả services
```powershell
docker-compose up -d
```

### Cách 2: Chỉ khởi động monitoring services
```powershell
docker-compose up -d prometheus grafana cadvisor
```

## 📈 Truy cập Dashboards

### Grafana Dashboard
1. Mở trình duyệt: http://localhost:3000
2. Đăng nhập với `admin/admin`
3. Vào **Dashboards** → **AI Platform - System Overview**

### Prometheus UI
- Truy cập: http://localhost:9090
- Explore metrics và query

### cAdvisor UI
- Truy cập: http://localhost:8080
- Xem container metrics chi tiết

## 📊 Dashboard Panels

Dashboard **AI Platform - System Overview** bao gồm:

1. **Container CPU Usage (%)**: CPU usage của từng container
2. **Container Memory Usage**: RAM usage của containers
3. **API Request Rate**: Số request/second đến backend API
4. **API Response Time**: Latency (p50, p95)
5. **Network I/O**: Traffic vào/ra containers
6. **HTTP Status Codes**: Phân bố 2xx, 4xx, 5xx responses

## 🔧 Custom Configuration

### Thay đổi Grafana admin password
Thêm vào `.env`:
```bash
GRAFANA_ADMIN_USER=your_username
GRAFANA_ADMIN_PASSWORD=your_secure_password
```

### Thêm metrics mới vào Prometheus
Chỉnh sửa `monitoring/prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'my-new-service'
    static_configs:
      - targets: ['service:port']
```

### Tạo dashboard mới
1. Design trong Grafana UI
2. Export JSON: **Dashboard settings** → **JSON Model**
3. Lưu vào `monitoring/grafana/provisioning/dashboards/`

## 📝 Metrics được thu thập

### Backend API Metrics (FastAPI)
- `http_requests_total`: Tổng số requests
- `http_request_duration_seconds`: Request duration histogram
- `http_requests_created`: Request creation timestamps

### Container Metrics (cAdvisor)
- `container_cpu_usage_seconds_total`: CPU time used
- `container_memory_usage_bytes`: Memory usage
- `container_network_receive_bytes_total`: Network RX
- `container_network_transmit_bytes_total`: Network TX

## 🎯 Use Cases

### 1. Theo dõi Performance
Kiểm tra **API Response Time** panel để phát hiện slow endpoints

### 2. Detect Errors
Monitor **HTTP Status Codes** panel cho spike của 4xx/5xx errors

### 3. Resource Planning
Xem **Container CPU/Memory Usage** để quyết định scale

### 4. Capacity Planning
Theo dõi **API Request Rate** để estimate load

## 🔍 Troubleshooting

### Prometheus không scrape được metrics
```powershell
# Kiểm tra Prometheus targets
# Truy cập: http://localhost:9090/targets
# Tất cả targets phải có status "UP"
```

### Grafana không hiển thị data
```powershell
# Kiểm tra datasource connection
# Grafana → Configuration → Data Sources → Prometheus
# Click "Test" - phải thấy "Data source is working"
```

### Backend metrics endpoint không hoạt động
```powershell
# Test metrics endpoint
curl http://localhost:8000/metrics

# Rebuild backend nếu cần
docker-compose up -d --build backend
```

## 📚 Advanced Topics

### Alerting
Tạo file `monitoring/alerts.yml`:
```yaml
groups:
  - name: example
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 5m
      annotations:
        summary: "High error rate detected"
```

### Long-term Storage
Prometheus mặc định giữ data 30 ngày. Để giữ lâu hơn:
```yaml
# docker-compose.yml
prometheus:
  command:
    - '--storage.tsdb.retention.time=90d'
```

## 🔗 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [cAdvisor Metrics](https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md)
- [FastAPI Prometheus Instrumentator](https://github.com/trallnag/prometheus-fastapi-instrumentator)

## ✅ Health Check

Verify monitoring stack is running:
```powershell
# Check all containers are running
docker-compose ps

# Expected output: prometheus, grafana, cadvisor all "Up"

# Quick test
curl http://localhost:9090/-/healthy  # Prometheus health
curl http://localhost:3000/api/health # Grafana health
curl http://localhost:8000/metrics    # Backend metrics
```

---

**🎉 Happy Monitoring!** Giờ bạn đã có "Mắt thần" để giám sát hệ thống 24/7! 👁️

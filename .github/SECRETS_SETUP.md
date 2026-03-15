# GitHub Secrets Configuration Guide

## Required Secrets

Để CI/CD pipeline hoạt động, bạn cần cấu hình các secrets sau trong GitHub repository:

### 📍 Cách thêm GitHub Secrets:

1. Truy cập repository trên GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Nhập tên và giá trị cho từng secret

---

## 🔑 AWS Credentials

### `AWS_ACCESS_KEY_ID`
**Giá trị:** Access Key ID của IAM user có quyền deploy

**Cách lấy:**
```bash
# Sử dụng credentials từ profile 'dev'
aws configure get aws_access_key_id --profile dev
```

**Quyền cần thiết:**
- ECR: Push/Pull images
- EKS: Update kubeconfig, deploy workloads
- IAM: PassRole (nếu cần)

---

### `AWS_SECRET_ACCESS_KEY`
**Giá trị:** Secret Access Key của IAM user

**Cách lấy:**
```bash
aws configure get aws_secret_access_key --profile dev
```

⚠️ **Bảo mật:** Không bao giờ commit secret key vào code!

---

## 🤖 OpenAI Configuration

### `OPENAI_API_KEY`
**Giá trị:** API key từ OpenAI Platform

**Cách lấy:**
1. Truy cập https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy toàn bộ key (chỉ hiển thị 1 lần)
4. Paste vào GitHub Secret

**Format:** `sk-proj-...` (bắt đầu bằng sk-)

**Lưu ý:** Key này sẽ được inject vào Kubernetes secret trong CI/CD pipeline

---

## 📌 Pinecone Configuration

### `PINECONE_API_KEY`
**Giá trị:** API key từ Pinecone

**Cách lấy:**
1. Truy cập https://app.pinecone.io/
2. **API Keys** → Copy key
3. Paste vào GitHub Secret

**Format:** `pcsk_...`

---

## 🔒 Optional Secrets (Tương lai)

### `GITHUB_TOKEN`
- **Tự động có sẵn** trong GitHub Actions
- Dùng để comment PR, tạo release, etc.

### `SLACK_WEBHOOK_URL`
- Để gửi thông báo deployment
- Lấy từ Slack App Incoming Webhooks

### `SENTRY_DSN`
- Để báo lỗi real-time
- Lấy từ Sentry project settings

---

## ✅ Verify Secrets

After adding all secrets, kiểm tra:

```bash
# List secret names (không hiển thị giá trị)
gh secret list

# Test workflow
git commit --allow-empty -m "Test CI/CD"
git push
```

Xem kết quả tại: **Actions** tab trên GitHub

---

## 🛡️ Security Best Practices

1. **Rotation:** Rotate keys every 90 days
2. **Principle of Least Privilege:** Chỉ cấp quyền cần thiết
3. **Monitoring:** Enable CloudTrail để audit API calls
4. **Repository Protection:**
   - Enable branch protection cho `main`
   - Require PR reviews
   - KHÔNG allow force push

---

## 📝 Secrets Summary

| Secret Name | Source | Used For | Required |
|-------------|--------|----------|----------|
| `AWS_ACCESS_KEY_ID` | AWS IAM | ECR, EKS access | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM | ECR, EKS access | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI Platform | LLM API calls | ✅ Yes |
| `PINECONE_API_KEY` | Pinecone | Vector DB | ✅ Yes |

---

## 🔧 Troubleshooting

### Secret not found error
```
Error: Secret <NAME> not found
```
→ Double-check secret name (case-sensitive)
→ Verify secret is added to repository (not organization)

### Invalid credentials
```
Error: The security token included in the request is invalid
```
→ Regenerate AWS credentials
→ Update GitHub secret với giá trị mới

### Insufficient permissions
```
Error: User is not authorized to perform: ecr:PutImage
```
→ Check IAM policy của user
→ Tham khảo: `infrastructure/IAM_POLICY.json`

---

## 🎯 Next Steps

After configuring secrets:

1. ✅ Push code to GitHub
2. ✅ Check **Actions** tab
3. ✅ Verify images in ECR
4. ✅ Check pods in EKS: `kubectl get pods`
5. ✅ Access application via Load Balancer URL

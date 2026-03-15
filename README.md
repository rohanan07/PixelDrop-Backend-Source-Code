# PixelDrop – Backend API & CI/CD Pipeline

![CI Pipeline](https://img.shields.io/github/actions/workflow/status/rohanan07/pixeldrop-backend/ci.yml?label=CI&logo=github)
![CD Pipeline](https://img.shields.io/github/actions/workflow/status/rohanan07/pixeldrop-backend/deploy.yml?label=CD&logo=github)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange?logo=amazonaws)
![Terraform](https://img.shields.io/badge/IaC-Terraform-purple?logo=terraform)
![License](https://img.shields.io/badge/license-MIT-green)

A production-ready **Node.js backend API** powering **PixelDrop**, a high-performance wallpaper delivery platform.

The project includes:

- A **Dockerized backend service**
- **Automated CI/CD pipeline using GitHub Actions**
- **Secure AWS integrations**
- **Rolling deployments using Auto Scaling Instance Refresh**
- **Infrastructure managed separately with Terraform**

---

## Architecture Overview

```
Client (Mobile App)
        │
        ▼
CloudFront CDN
        │
        ▼
Application Load Balancer
        │
        ▼
EC2 Auto Scaling Group
(Node.js Backend Containers)
        │
        ▼
Amazon RDS (PostgreSQL)
        │
        ▼
Amazon S3 (Wallpaper Storage)
```

---

## Deployment Pipeline

```
Developer Push
      │
      ▼
GitHub Actions (CI)
  ├─ ESLint
  ├─ Jest Tests
  └─ npm audit (Security Scan)
      │
      ▼
GitHub Actions (CD)
  ├─ Build Docker Image
  ├─ Push Image to Amazon ECR
  ├─ Update SSM Parameter (image tag)
  └─ Trigger ASG Instance Refresh
      │
      ▼
Rolling Deployment (Zero Downtime)
```

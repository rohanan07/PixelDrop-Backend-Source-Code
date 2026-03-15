# PixelDrop – Backend API & CI/CD Pipeline

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

---

# 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL

### Containerization
- Docker

### CI/CD
- GitHub Actions
- Jest
- ESLint

### Cloud Integrations
- Amazon S3 – Image storage
- Amazon RDS – PostgreSQL database
- Amazon ECR – Docker image registry
- AWS Systems Manager (SSM) – Image version management
- AWS Secrets Manager – Secure credential storage
- Amazon CloudFront – CDN delivery

---

# ⚙️ Key Features

## REST API

Provides endpoints for the mobile application to retrieve wallpaper metadata and dynamically generated **CloudFront CDN URLs** for fast image delivery.

---

## Automated CI/CD Pipeline

The deployment pipeline is fully automated using **GitHub Actions**.

### Continuous Integration (CI)

Runs on every push and pull request:

- ESLint for code quality checks
- Jest unit/integration tests
- `npm audit` for dependency security scanning

### Continuous Deployment (CD)

Triggered after successful CI:

1. Build Docker image  
2. Push image to **Amazon ECR**  
3. Update image tag in **AWS Systems Manager Parameter Store (SSM)**  
4. Trigger **Auto Scaling Instance Refresh** for rolling deployment with zero downtime

---

## Admin Ingestion Automation

Includes a custom Node.js script:

```
src/scripts/admin-scraper.js
```

This script:

1. Fetches high-quality wallpaper assets  
2. Uploads images to **Amazon S3**  
3. Inserts metadata into the **private RDS database**

Because the database is isolated in a private subnet, the script connects securely through an **SSH tunnel via the Bastion Host**.

---

# 🛠️ Local Development Setup

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pixeldrop-backend.git
cd pixeldrop-backend
```

---

## 2. Configure Environment Variables

Create a `.env` file in the project root:

```
PORT=8080

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=pixeldrop

CLOUDFRONT_DOMAIN=https://your-cloudfront-id.cloudfront.net
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Run the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

---

# 🧪 Running Tests

Run unit and integration tests:

```bash
npm test
```

---

# 🔐 Database Management via Bastion Host

The production **RDS PostgreSQL database is deployed inside a private subnet**, so direct public access is not allowed.

Local administration requires creating an **SSH tunnel through the Bastion Host**.

### Step 1 – Open SSH Tunnel

Run in **Terminal 1**

```bash
ssh -i "your-key.pem" -N -L 5432:<RDS_ENDPOINT>:5432 ubuntu@<BASTION_IP>
```

This forwards your local port `5432` to the private RDS instance.

---

### Step 2 – Run the Ingestion Script

Run in **Terminal 2**

Ensure your `.env` file uses:

```
DB_HOST=127.0.0.1
```

Then execute:

```bash
node src/scripts/admin-scraper.js
```

The script will connect to the RDS database through the SSH tunnel.

---

# 📦 Project Structure

```
pixeldrop-backend
│
├── src
│   ├── routes
│   ├── controllers
│   ├── services
│   └── scripts
│       └── admin-scraper.js
│
├── tests
│
├── Dockerfile
├── package.json
└── .github/workflows
```

---

# 🔄 Deployment Overview

```
Developer Push
      │
      ▼
GitHub Actions (CI)
  ├─ ESLint
  ├─ Jest Tests
  └─ npm audit
      │
      ▼
GitHub Actions (CD)
  ├─ Build Docker Image
  ├─ Push to Amazon ECR
  ├─ Update SSM Parameter
  └─ Trigger ASG Instance Refresh
      │
      ▼
EC2 Auto Scaling Rolling Deployment
```

---

# 📄 License

MIT License

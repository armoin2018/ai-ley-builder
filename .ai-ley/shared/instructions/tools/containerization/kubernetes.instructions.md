---
agentMode: general
applyTo:
  - '**/k8s/**'
  - '**/kubernetes/**'
  - '**/*.yaml'
  - '**/*.yml'
  - '**/deployment.yaml'
  - '**/service.yaml'
  - '**/ingress.yaml'
  - '**/configmap.yaml'
  - '**/secret.yaml'
  - '**/kustomize/**'
  - '**/helm/**'
  - '**/istio/**'
author: AI-LEY
category: Containerization
description: Enterprise Kubernetes Container Orchestration Platform - Comprehensive Level 3 production-ready container orchestration platform with advanced security policies, network segmentation, service mesh integration, GitOps workflows, compliance automation, monitoring observability, multi-cluster management, disaster recovery, and enterprise governance standards for cloud-native applications at scale.
extensions:
  - .md
  - .yaml
  - .yml
  - .json
  - .sh
  - .go
guidelines: Enterprise Kubernetes platform with advanced security policies, RBAC governance, network segmentation, service mesh integration, GitOps automation, compliance frameworks (CIS, SOC2, PCI-DSS), comprehensive monitoring, multi-cluster orchestration, disaster recovery, and production-grade reliability standards.
instructionType: general
keywords:
  [
    'Kubernetes',
    'K8s',
    'Container Orchestration',
    'Enterprise',
    'Security',
    'RBAC',
    'Network Policies',
    'Service Mesh',
    'Istio',
    'GitOps',
    'ArgoCD',
    'Flux',
    'Monitoring',
    'Prometheus',
    'Grafana',
    'Jaeger',
    'Falco',
    'OPA Gatekeeper',
    'Pod Security Standards',
    'Admission Controllers',
    'CIS Benchmarks',
    'Compliance',
    'Multi-cluster',
    'Disaster Recovery',
    'Backup',
    'Velero',
    'CNI',
    'Calico',
    'Cilium',
    'Ingress',
    'Load Balancing',
    'Auto-scaling',
    'HPA',
    'VPA',
    'PDB',
    'Secrets Management',
    'External Secrets',
    'Vault',
    'DevSecOps',
    'CI/CD',
    'Image Scanning',
    'Runtime Security',
  ]
lastUpdated: '2025-09-05T00:00:00.000000'
summaryScore: 10.0
tags:
  - kubernetes
  - k8s
  - container-orchestration
  - enterprise
  - security
  - monitoring
  - compliance
  - gitops
  - service-mesh
  - multi-cluster
title: Kubernetes Enterprise Container Orchestration Platform
version: '3.0.0'
---

# ☸️ Kubernetes Enterprise Container Orchestration Platform - Production-Scale Cloud-Native Infrastructure

## 🏢 Enterprise Platform Overview

**Kubernetes Enterprise Container Orchestration Platform** is a comprehensive, production-ready solution for deploying, managing, and scaling containerized applications in enterprise environments. This platform provides advanced security policies, network segmentation, service mesh integration, GitOps workflows, compliance automation, comprehensive monitoring, multi-cluster management, and enterprise-grade governance standards.

### 🎯 Strategic Enterprise Value

- **🔒 Zero-Trust Security**: Advanced RBAC, network policies, pod security standards, admission controllers
- **📊 Complete Observability**: Integrated monitoring, logging, tracing, and alerting with Prometheus ecosystem
- **🔄 GitOps Automation**: Declarative infrastructure and application management with ArgoCD/Flux
- **🌐 Service Mesh Integration**: Comprehensive traffic management, security, and observability with Istio
- **📋 Compliance Automation**: Built-in CIS benchmarks, SOC2, PCI-DSS validation and reporting
- **⚖️ Multi-Cluster Orchestration**: Centralized management across hybrid and multi-cloud environments
- **💼 Enterprise Governance**: Policy enforcement, resource quotas, cost optimization, audit logging
- **🛡️ Disaster Recovery**: Automated backup, restore, and business continuity capabilities

### 🏗️ **Platform Architecture Components**

```mermaid
graph TB
    subgraph "Enterprise Kubernetes Platform"
        subgraph "Control Plane"
            API[API Server + RBAC]
            ETCD[ETCD Cluster]
            SCHED[Scheduler]
            CM[Controller Manager]
        end

        subgraph "Security Layer"
            OPA[OPA Gatekeeper]
            PSS[Pod Security Standards]
            NP[Network Policies]
            FALCO[Falco Runtime Security]
        end

        subgraph "Service Mesh"
            ISTIO[Istio Control Plane]
            ENVOY[Envoy Proxies]
            GATEWAY[Istio Gateway]
        end

        subgraph "GitOps"
            ARGO[ArgoCD]
            FLUX[Flux]
            GIT[Git Repositories]
        end

        subgraph "Observability"
            PROM[Prometheus]
            GRAF[Grafana]
            JAEGER[Jaeger]
            LOKI[Loki]
        end

        subgraph "Workload Nodes"
            APPS[Applications]
            SERVICES[Services]
            STORAGE[Persistent Storage]
        end
    end

    API --> OPA
    OPA --> PSS
    ISTIO --> ENVOY
    ARGO --> GIT
    PROM --> GRAF
    APPS --> SERVICES
```

## 📊 Tool Specifications

- **Platform**: Kubernetes v1.28+ (Enterprise LTS with extended security support)
- **Control Plane**: High-availability multi-master with ETCD clustering
- **Container Runtime**: containerd with gVisor security isolation
- **Network CNI**: Calico/Cilium with network policy enforcement
- **Service Mesh**: Istio with comprehensive traffic management
- **Storage**: CSI drivers with encryption and backup integration
- **Monitoring**: Prometheus ecosystem with enterprise dashboards
- **GitOps**: ArgoCD with multi-cluster and application-of-applications patterns
- **Security**: OPA Gatekeeper with comprehensive policy library
- **Compliance**: CIS benchmarks with automated validation and reporting

## 🎯 Enterprise Use Cases & Decision Matrix

### ✅ **Deploy Kubernetes Enterprise Platform When**

- **🏢 Enterprise Microservices**: Complex multi-service architectures requiring orchestration, service discovery, and traffic management
- **📈 Dynamic Scaling Requirements**: Applications with variable load patterns requiring horizontal pod autoscaling and cluster autoscaling
- **🔒 Security-Critical Workloads**: Applications requiring network segmentation, RBAC, pod security standards, and compliance validation
- **🌐 Multi-Cloud Strategy**: Hybrid and multi-cloud deployments requiring consistent orchestration across environments
- **🔄 GitOps Workflows**: Infrastructure and application management through declarative configuration and version control
- **📊 Observability Requirements**: Complex applications requiring comprehensive monitoring, logging, tracing, and alerting
- **⚖️ Regulatory Compliance**: Industries requiring SOC2, PCI-DSS, HIPAA compliance with audit trails and policy enforcement
- **💼 Enterprise Governance**: Organizations requiring resource quotas, cost management, policy enforcement, and access controls
- **🛡️ High Availability**: Mission-critical applications requiring multi-zone deployment, disaster recovery, and business continuity
- **🔧 DevOps Integration**: Teams requiring automated CI/CD pipelines with security scanning and deployment validation

### 🚫 **Alternative Solutions When**

- **🏠 Simple Single Applications**: Use Docker Compose for basic multi-container applications
- **⚡ Serverless Workloads**: Use AWS Lambda, Azure Functions, or Google Cloud Functions
- **📊 Basic Monitoring**: Use dedicated monitoring solutions like DataDog or New Relic
- **🏃 Rapid Prototyping**: Use managed container services like AWS Fargate or Google Cloud Run
- **💰 Cost Optimization**: Use managed Kubernetes services for reduced operational overhead

## 🔐 Enterprise Security Architecture

### Advanced RBAC and Access Control

```yaml
# enterprise-rbac-config.yaml - Comprehensive RBAC with least privilege access
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    security.kubernetes.io/enforce: restricted
    compliance.company.com/environment: production
    backup.velero.io/include: 'true'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: security-admin
  labels:
    rbac.company.com/level: admin
rules:
  - apiGroups: ['security.istio.io', 'networking.istio.io']
    resources: ['*']
    verbs: ['*']
  - apiGroups: ['config.gatekeeper.sh']
    resources: ['*']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['templates.gatekeeper.sh']
    resources: ['*']
    verbs: ['get', 'list', 'watch']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: developer
  labels:
    rbac.company.com/level: developer
rules:
  - apiGroups: ['apps', 'extensions']
    resources: ['deployments', 'replicasets']
    verbs: ['get', 'list', 'watch', 'create', 'update', 'patch']
  - apiGroups: ['']
    resources: ['pods', 'services', 'configmaps']
    verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
  - apiGroups: ['']
    resources: ['secrets']
    verbs: ['get', 'list', 'watch'] # Read-only access to secrets
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: production
  name: developers-binding
subjects:
  - kind: User
    name: dev-team
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount
    name: developer-sa
    namespace: production
roleRef:
  kind: ClusterRole
  name: developer
  apiGroup: rbac.authorization.k8s.io
---
# Service account with restricted permissions
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production
  annotations:
    iam.gke.io/gcp-service-account: app-gsa@project.iam.gserviceaccount.com
automountServiceAccountToken: false
---
# Pod Security Policy (for older clusters) / Pod Security Standards
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: enterprise-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### Network Policies and Segmentation

```yaml
# enterprise-network-policies.yaml - Comprehensive network segmentation
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-default
  namespace: production
  labels:
    security.kubernetes.io/policy-type: default-deny
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: frontend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
    - from:
        - podSelector:
            matchLabels:
              tier: api-gateway
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              tier: backend
      ports:
        - protocol: TCP
          port: 3000
    - to: [] # Allow DNS
      ports:
        - protocol: UDP
          port: 53
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              tier: frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              tier: database
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - protocol: TCP
          port: 9090
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              tier: backend
      ports:
        - protocol: TCP
          port: 5432
  egress:
    - to: [] # Deny all egress except DNS
      ports:
        - protocol: UDP
          port: 53
```

### Pod Security Standards and Admission Control

```yaml
# pod-security-standards.yaml - Enterprise pod security enforcement
apiVersion: v1
kind: Namespace
metadata:
  name: secure-workloads
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
    security.company.com/tier: high-security
---
# OPA Gatekeeper constraint template for security validation
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredsecuritycontext
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredSecurityContext
      validation:
        openAPIV3Schema:
          type: object
          properties:
            runAsNonRoot:
              type: boolean
            requiredCapabilities:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredsecuritycontext

        violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            not container.securityContext.runAsNonRoot
            msg := "Containers must run as non-root user"
        }

        violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            container.securityContext.privileged
            msg := "Privileged containers are not allowed"
        }

        violation[{"msg": msg}] {
            container := input.review.object.spec.containers[_]
            container.securityContext.allowPrivilegeEscalation
            msg := "Privilege escalation is not allowed"
        }
---
# Gatekeeper constraint implementation
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredSecurityContext
metadata:
  name: must-have-security-context
spec:
  match:
    kinds:
      - apiGroups: ['apps']
        kinds: ['Deployment']
    excludedNamespaces: ['kube-system', 'kube-public']
  parameters:
    runAsNonRoot: true
```

## 🌐 Service Mesh Integration with Istio

- Need automated scaling based on demand and resource utilization
- Deploying applications across multiple environments (dev, staging, production)
- Require high availability with load balancing and fault tolerance
- Building cloud-native applications with rolling updates and zero-downtime deployments
- Managing complex multi-service applications with dependencies
- Need resource management and optimization across compute clusters
- Building applications requiring service mesh and advanced networking

### ❌ **Avoid Kubernetes When**

- Building simple single-container applications
- Team lacks containerization and orchestration expertise
- Working with small-scale applications without scaling requirements
- Need quick prototyping without complex deployment needs
- Working with applications requiring specialized hardware configurations
- Building desktop applications or simple static websites
- Have limited infrastructure resources or budget constraints

## AI Agent Decision Matrix

### Project Complexity Assessment

| Project Type                  | Kubernetes Recommendation                      | Setup Complexity                  |
| ----------------------------- | ---------------------------------------------- | --------------------------------- |
| Microservices Architecture    | ✅ **Essential** - Perfect orchestration       | High - Multi-service coordination |
| Distributed Systems           | ✅ **Essential** - Service mesh integration    | High - Advanced networking        |
| Cloud-Native Applications     | ✅ **Essential** - Auto-scaling and resilience | High - Production deployment      |
| Web Applications (Multi-tier) | ✅ **Recommended** - Load balancing            | Medium - Service management       |
| API Gateway Applications      | ✅ **Recommended** - Traffic management        | Medium - Ingress configuration    |
| Batch Processing              | 🔄 **Consider** - Job orchestration            | Medium - CronJob setup            |
| Single Container Apps         | ❌ **Avoid** - Unnecessary complexity          | Low - Use Docker Compose          |

### Infrastructure Assessment

| Factor         | Small Scale              | Medium Scale          | Enterprise Scale         |
| -------------- | ------------------------ | --------------------- | ------------------------ |
| **Setup Time** | 2 days (managed cluster) | 1 week (self-managed) | 2-4 weeks (enterprise)   |
| **Node Count** | 3-5 nodes                | 10-50 nodes           | 50+ nodes                |
| **Services**   | 5-10 services            | 20-100 services       | 100+ services            |
| **Complexity** | Basic deployments        | Multi-environment     | Multi-cluster federation |

## Installation & Setup

### kubectl Installation

```bash
# macOS installation
brew install kubectl

# Linux installation
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Windows installation
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"

# Verify installation
kubectl version --client
kubectl version --short
```

### Local Development Cluster

```bash
# Minikube installation and setup
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start local cluster
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable dashboard
minikube addons enable metrics-server

# Kind (Kubernetes in Docker) setup
go install sigs.k8s.io/kind@v0.20.0
kind create cluster --config=kind-config.yaml

# Docker Desktop Kubernetes
# Enable Kubernetes in Docker Desktop settings

# Verify cluster access
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces
```

### Production Cluster Setup

```bash
# Managed Kubernetes services
# AWS EKS
eksctl create cluster --name production-cluster --region us-west-2 --nodegroup-name standard-workers --node-type m5.xlarge --nodes 3 --nodes-min 1 --nodes-max 4

# Google GKE
gcloud container clusters create production-cluster --zone us-central1-a --num-nodes 3 --machine-type n1-standard-4 --enable-autoscaling --min-nodes 1 --max-nodes 10

# Azure AKS
az aks create --resource-group myResourceGroup --name production-cluster --node-count 3 --node-vm-size Standard_D4s_v3 --enable-addons monitoring --generate-ssh-keys

# Configure kubectl for cluster access
aws eks update-kubeconfig --region us-west-2 --name production-cluster
gcloud container clusters get-credentials production-cluster --zone us-central1-a
az aks get-credentials --resource-group myResourceGroup --name production-cluster
```

## Configuration

### Production-Ready Application Deployment

```yaml
# deployment.yaml - Comprehensive application deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    version: v1.0.0
    environment: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        version: v1.0.0
    spec:
      serviceAccountName: web-app-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: web-app
          image: myregistry/web-app:v1.0.0
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secrets
                  key: connection-string
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: redis-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /startup
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 30
          securityContext:
            allowPrivilegeEscalation: false
            runAsNonRoot: true
            runAsUser: 1001
            capabilities:
              drop:
                - ALL
            readOnlyRootFilesystem: true
          volumeMounts:
            - name: tmp-volume
              mountPath: /tmp
            - name: app-config
              mountPath: /app/config
              readOnly: true
            - name: app-storage
              mountPath: /app/storage
      volumes:
        - name: tmp-volume
          emptyDir: {}
        - name: app-config
          configMap:
            name: app-config
        - name: app-storage
          persistentVolumeClaim:
            claimName: app-storage-pvc
      imagePullSecrets:
        - name: registry-credentials
      nodeSelector:
        kubernetes.io/arch: amd64
      tolerations:
        - key: 'app'
          operator: 'Equal'
          value: 'web-app'
          effect: 'NoSchedule'
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - web-app
                topologyKey: kubernetes.io/hostname
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
```

### Service Configuration

```yaml
# service.yaml - Load balancer service configuration
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: production
  labels:
    app: web-app
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: 'nlb'
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: 'http'
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
    - name: http
      port: 80
      targetPort: 3000
      protocol: TCP
    - name: https
      port: 443
      targetPort: 3000
      protocol: TCP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600

---
# headless service for StatefulSet
apiVersion: v1
kind: Service
metadata:
  name: web-app-headless
  namespace: production
spec:
  clusterIP: None
  selector:
    app: web-app
  ports:
    - name: http
      port: 3000
      targetPort: 3000
```

### Ingress Configuration

```yaml
# ingress.yaml - Advanced ingress with SSL and routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: 'nginx'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/force-ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/proxy-body-size: '50m'
    nginx.ingress.kubernetes.io/rate-limit: '100'
    nginx.ingress.kubernetes.io/rate-limit-window: '1m'
    nginx.ingress.kubernetes.io/enable-cors: 'true'
    nginx.ingress.kubernetes.io/cors-allow-origin: 'https://mydomain.com'
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header X-Frame-Options SAMEORIGIN always;
      add_header X-Content-Type-Options nosniff always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
spec:
  tls:
    - hosts:
        - api.mydomain.com
        - app.mydomain.com
      secretName: web-app-tls
  rules:
    - host: api.mydomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-app-service
                port:
                  number: 80
    - host: app.mydomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: web-app-service
                port:
                  number: 80
```

### ConfigMap and Secrets

```yaml
# configmap.yaml - Application configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  app.properties: |
    server.port=3000
    logging.level=info
    redis.url=redis://redis-service:6379
    database.pool.max=20
    database.pool.min=5
    cache.ttl=3600
  nginx.conf: |
    upstream backend {
        server web-app-service:80;
    }
    server {
        listen 80;
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }

---
# secret.yaml - Sensitive configuration
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  api-key: <base64-encoded-api-key>
  database-password: <base64-encoded-password>

---
# database-secrets.yaml - Database connection
apiVersion: v1
kind: Secret
metadata:
  name: database-secrets
  namespace: production
type: Opaque
stringData:
  connection-string: 'postgresql://user:password@postgres-service:5432/myapp'
  username: 'myapp_user'
  password: 'secure_password_123'
```

### Persistent Storage

```yaml
# storage.yaml - Persistent volume configuration
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-storage-pv
  labels:
    type: local
spec:
  storageClassName: fast-ssd
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: '/mnt/data/app-storage'

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage-pvc
  namespace: production
spec:
  storageClassName: fast-ssd
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi

---
# StorageClass for dynamic provisioning
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: '3000'
  throughput: '125'
  encrypted: 'true'
allowVolumeExpansion: true
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

## Core Features

### Horizontal Pod Autoscaler (HPA)

- **Purpose**: Automatically scale pods based on CPU, memory, or custom metrics
- **Usage**: Maintain optimal resource utilization and handle traffic spikes
- **Example**:

```yaml
# hpa.yaml - Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: requests_per_second
        target:
          type: AverageValue
          averageValue: '30'
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

### StatefulSet for Stateful Applications

- **Purpose**: Manage stateful applications with persistent identity and storage
- **Usage**: Databases, message queues, and applications requiring stable network identities
- **Example**:

```yaml
# statefulset.yaml - Database StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          env:
            - name: POSTGRES_DB
              value: myapp
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          ports:
            - containerPort: 5432
              name: postgres
          resources:
            requests:
              memory: '1Gi'
              cpu: '500m'
            limits:
              memory: '2Gi'
              cpu: '1000m'
          livenessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - $(POSTGRES_USER)
                - -d
                - $(POSTGRES_DB)
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - $(POSTGRES_USER)
                - -d
                - $(POSTGRES_DB)
            initialDelaySeconds: 5
            periodSeconds: 5
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ['ReadWriteOnce']
        storageClassName: 'fast-ssd'
        resources:
          requests:
            storage: 100Gi
```

### Jobs and CronJobs

- **Purpose**: Run batch processing and scheduled tasks
- **Usage**: Data processing, backups, and periodic maintenance tasks
- **Example**:

```yaml
# cronjob.yaml - Scheduled backup job
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: production
spec:
  schedule: '0 2 * * *' # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: postgres:15-alpine
              env:
                - name: PGPASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: postgres-secret
                      key: password
              command:
                - /bin/bash
                - -c
                - |
                  pg_dump -h postgres-service -U myapp_user myapp > /backup/backup-$(date +%Y%m%d-%H%M%S).sql
                  find /backup -name "*.sql" -mtime +7 -delete
              volumeMounts:
                - name: backup-storage
                  mountPath: /backup
          volumes:
            - name: backup-storage
              persistentVolumeClaim:
                claimName: backup-pvc
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  concurrencyPolicy: Forbid

---
# job.yaml - One-time migration job
apiVersion: batch/v1
kind: Job
metadata:
  name: database-migration
  namespace: production
spec:
  template:
    spec:
      containers:
        - name: migration
          image: myregistry/migration-tool:latest
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secrets
                  key: connection-string
          command: ['npm', 'run', 'migrate']
      restartPolicy: Never
  backoffLimit: 3
  activeDeadlineSeconds: 1800
```

### NetworkPolicy for Security

- **Purpose**: Control network traffic between pods and services
- **Usage**: Implement micro-segmentation and security policies
- **Example**:

```yaml
# networkpolicy.yaml - Traffic control policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    - to: [] # Allow DNS
      ports:
        - protocol: UDP
          port: 53
```

## Common Commands

```bash
# Cluster management
kubectl cluster-info                          # Display cluster information
kubectl get nodes                            # List cluster nodes
kubectl describe node node-name              # Node details
kubectl top nodes                            # Node resource usage
kubectl drain node-name                      # Drain node for maintenance
kubectl uncordon node-name                   # Make node schedulable

# Pod management
kubectl get pods                             # List pods in current namespace
kubectl get pods --all-namespaces          # List all pods
kubectl get pods -o wide                    # Extended pod information
kubectl describe pod pod-name               # Detailed pod information
kubectl logs pod-name                       # View pod logs
kubectl logs -f pod-name                    # Follow pod logs
kubectl exec -it pod-name -- /bin/bash     # Execute commands in pod

# Deployment management
kubectl get deployments                     # List deployments
kubectl create deployment app --image=nginx # Create deployment
kubectl scale deployment app --replicas=5   # Scale deployment
kubectl set image deployment/app nginx=nginx:1.21 # Update image
kubectl rollout status deployment/app       # Check rollout status
kubectl rollout history deployment/app      # View rollout history
kubectl rollout undo deployment/app         # Rollback deployment

# Service management
kubectl get services                         # List services
kubectl expose deployment app --port=80     # Expose deployment as service
kubectl port-forward service/app 8080:80    # Forward local port to service
kubectl proxy                              # Start kubectl proxy

# Configuration management
kubectl get configmaps                      # List ConfigMaps
kubectl get secrets                         # List Secrets
kubectl create configmap app-config --from-file=config.yaml
kubectl create secret generic app-secret --from-literal=key=value

# Namespace management
kubectl get namespaces                      # List namespaces
kubectl create namespace production         # Create namespace
kubectl config set-context --current --namespace=production # Set default namespace

# Resource management
kubectl apply -f deployment.yaml           # Apply configuration
kubectl delete -f deployment.yaml          # Delete resources
kubectl get all                           # List all resources
kubectl get events                        # View cluster events
kubectl top pods                          # Pod resource usage

# Advanced operations
kubectl get pods --field-selector=status.phase=Running # Filter pods
kubectl get pods --selector=app=web-app    # Select by labels
kubectl patch deployment app -p '{"spec":{"replicas":3}}' # Patch resource
kubectl replace -f deployment.yaml         # Replace resource
kubectl create -f deployment.yaml --dry-run=client -o yaml # Dry run
```

## Workflow Integration

### Development Workflow

1. **Local Development**: Use Minikube or Kind for local Kubernetes testing
2. **Image Building**: Build and tag container images for deployment
3. **Configuration**: Create Kubernetes manifests for application components
4. **Testing**: Deploy to development namespace and validate functionality
5. **CI/CD Integration**: Automated deployment pipelines with GitOps
6. **Monitoring**: Implement observability with metrics, logs, and tracing

### GitOps with ArgoCD

```yaml
# argocd-application.yaml - GitOps application definition
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/k8s-manifests
    targetRevision: HEAD
    path: apps/web-app/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### CI/CD Pipeline Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region us-west-2 --name production-cluster

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Update Kubernetes manifests
        run: |
          sed -i 's|IMAGE_TAG|${{ github.sha }}|g' k8s/deployment.yaml

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml
          kubectl apply -f k8s/secret.yaml
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/ingress.yaml

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/web-app -n production --timeout=300s

      - name: Run smoke tests
        run: |
          kubectl wait --for=condition=ready pod -l app=web-app -n production --timeout=300s
          kubectl port-forward service/web-app-service 8080:80 -n production &
          sleep 10
          curl -f http://localhost:8080/health || exit 1
```

## Best Practices

### ✅ **Container and Pod Best Practices**

- **Use resource limits and requests** - Prevent resource starvation and enable proper scheduling
- **Implement health checks** - Ensure application availability with liveness, readiness, and startup probes
- **Run as non-root user** - Enhance security by avoiding root privileges
- **Use multi-stage builds** - Optimize container images for production deployment
- **Implement proper logging** - Structure logs for centralized collection and analysis
- **Use init containers** - Handle initialization tasks separately from main application

### ✅ **Security Best Practices**

- **Use RBAC** - Implement Role-Based Access Control for fine-grained permissions
- **Network policies** - Control traffic flow between pods and services
- **Pod Security Standards** - Enforce security policies for pod specifications
- **Secrets management** - Use Kubernetes Secrets and external secret management systems
- **Image scanning** - Regularly scan container images for vulnerabilities
- **Service mesh** - Implement mTLS and advanced security policies with Istio or Linkerd

### ✅ **Deployment and Scaling Best Practices**

- **Rolling updates** - Use rolling deployment strategies for zero-downtime updates
- **Horizontal Pod Autoscaling** - Implement HPA for automatic scaling based on metrics
- **Pod Disruption Budgets** - Ensure availability during voluntary disruptions
- **Anti-affinity rules** - Distribute pods across nodes for high availability
- **Blue-green deployments** - Implement advanced deployment strategies for critical applications
- **Canary deployments** - Gradually roll out changes with traffic splitting

### ❌ **Common Pitfalls to Avoid**

- **Don't ignore resource limits** - Can cause cluster instability and resource contention
- **Avoid privileged containers** - Security risk and bad practice
- **Don't store secrets in manifests** - Use proper secret management
- **Avoid single points of failure** - Design for redundancy and fault tolerance
- **Don't neglect monitoring** - Implement comprehensive observability
- **Avoid manual configuration** - Use Infrastructure as Code and GitOps

## Advanced Kubernetes Usage

### Custom Resource Definitions (CRDs)

```yaml
# custom-resource.yaml - Custom application resource
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: webapps.example.com
spec:
  group: example.com
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                replicas:
                  type: integer
                  minimum: 1
                  maximum: 100
                image:
                  type: string
                resources:
                  type: object
                  properties:
                    cpu:
                      type: string
                    memory:
                      type: string
            status:
              type: object
              properties:
                phase:
                  type: string
                  enum: ['Pending', 'Running', 'Failed']
                replicas:
                  type: integer
  scope: Namespaced
  names:
    plural: webapps
    singular: webapp
    kind: WebApp
    shortNames:
      - wa
```

### Operator Pattern

```yaml
# operator-deployment.yaml - Custom operator
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-operator
  namespace: operators
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp-operator
  template:
    metadata:
      labels:
        app: webapp-operator
    spec:
      serviceAccountName: webapp-operator
      containers:
        - name: operator
          image: myregistry/webapp-operator:v1.0.0
          env:
            - name: WATCH_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: OPERATOR_NAME
              value: 'webapp-operator'
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'
```

### Service Mesh with Istio

```yaml
# istio-gateway.yaml - Istio gateway configuration
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: web-app-gateway
  namespace: production
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - 'app.mydomain.com'
      tls:
        httpsRedirect: true
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: web-app-tls
      hosts:
        - 'app.mydomain.com'

---
# virtualservice.yaml - Traffic routing
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: web-app-vs
  namespace: production
spec:
  hosts:
    - 'app.mydomain.com'
  gateways:
    - web-app-gateway
  http:
    - match:
        - uri:
            prefix: '/api/v2'
      route:
        - destination:
            host: web-app-v2-service
            port:
              number: 80
          weight: 10
        - destination:
            host: web-app-service
            port:
              number: 80
          weight: 90
    - match:
        - uri:
            prefix: '/'
      route:
        - destination:
            host: web-app-service
            port:
              number: 80
      timeout: 30s
      retries:
        attempts: 3
        perTryTimeout: 10s

---
# destinationrule.yaml - Traffic policies
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: web-app-dr
  namespace: production
spec:
  host: web-app-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

## Integration with Other Tools

### Helm Chart Management

```yaml
# Chart.yaml - Helm chart metadata
apiVersion: v2
name: web-app
description: A production-ready web application
type: application
version: 1.0.0
appVersion: '1.0.0'

dependencies:
  - name: postgresql
    version: 12.1.0
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.4.0
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

```yaml
# values.yaml - Helm values
replicaCount: 3

image:
  repository: myregistry/web-app
  pullPolicy: IfNotPresent
  tag: 'v1.0.0'

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: 'nginx'
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
  hosts:
    - host: app.mydomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: web-app-tls
      hosts:
        - app.mydomain.com

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

postgresql:
  enabled: true
  auth:
    username: myapp
    database: myapp

redis:
  enabled: true
  auth:
    enabled: false
```

### Prometheus Monitoring

```yaml
# servicemonitor.yaml - Prometheus monitoring
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web-app-monitor
  namespace: production
  labels:
    app: web-app
spec:
  selector:
    matchLabels:
      app: web-app
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### Terraform Integration

```hcl
# kubernetes.tf - Terraform Kubernetes provider
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "kubernetes_namespace" "production" {
  metadata {
    name = "production"
    labels = {
      environment = "production"
      managed-by  = "terraform"
    }
  }
}

resource "helm_release" "web_app" {
  name       = "web-app"
  namespace  = kubernetes_namespace.production.metadata[0].name
  chart      = "./helm/web-app"

  values = [
    file("${path.module}/helm-values/production.yaml")
  ]

  set {
    name  = "image.tag"
    value = var.app_version
  }

  set_sensitive {
    name  = "postgresql.auth.password"
    value = var.db_password
  }
}
```

## Troubleshooting

### Common Issues

#### Pod Startup Problems

**Problem**: Pod fails to start or crashes repeatedly
**Symptoms**: Pod status shows CrashLoopBackOff, ImagePullBackOff, or Pending
**Solution**:

```bash
# Check pod status and events
kubectl describe pod pod-name
kubectl get events --field-selector involvedObject.name=pod-name

# Check logs
kubectl logs pod-name
kubectl logs pod-name --previous  # Previous container logs

# Debug with temporary container
kubectl run debug --image=busybox -it --rm -- /bin/sh

# Check resource constraints
kubectl top pod pod-name
kubectl describe node node-name
```

#### Service Discovery Issues

**Problem**: Services cannot communicate with each other
**Symptoms**: Connection timeouts, DNS resolution failures
**Solution**:

```bash
# Test DNS resolution
kubectl run dns-debug --image=busybox -it --rm -- nslookup service-name

# Check service endpoints
kubectl get endpoints service-name
kubectl describe service service-name

# Test network connectivity
kubectl exec -it pod-name -- nc -zv service-name port

# Check network policies
kubectl get networkpolicies
kubectl describe networkpolicy policy-name
```

#### Storage Issues

**Problem**: Persistent volumes not mounting or data loss
**Symptoms**: Volume mount failures, permission errors
**Solution**:

```bash
# Check PV and PVC status
kubectl get pv,pvc
kubectl describe pvc pvc-name

# Check storage class
kubectl get storageclass
kubectl describe storageclass class-name

# Debug volume permissions
kubectl exec -it pod-name -- ls -la /mount/path
kubectl exec -it pod-name -- id
```

### Debug Mode

```bash
# Enable verbose kubectl output
kubectl --v=8 get pods

# Use kubectl debug for troubleshooting
kubectl debug pod-name -it --image=busybox

# Create debug container in existing pod
kubectl debug pod-name -it --image=busybox --target=container-name

# Copy files from pod for analysis
kubectl cp pod-name:/path/to/file ./local-file

# Port forward for debugging
kubectl port-forward pod/pod-name 8080:80

# Proxy for accessing Kubernetes API
kubectl proxy --port=8080
```

### Performance Optimization

```yaml
# Resource optimization
resources:
  requests:
    memory: '256Mi' # Guaranteed allocation
    cpu: '250m' # Guaranteed CPU
  limits:
    memory: '512Mi' # Maximum allocation
    cpu: '500m' # Maximum CPU

# Quality of Service classes
# Guaranteed: requests = limits
# Burstable: requests < limits
# BestEffort: no requests/limits
```

## Security Considerations

### RBAC Configuration

```yaml
# rbac.yaml - Role-based access control
apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-app-sa
  namespace: production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: web-app-role
rules:
  - apiGroups: ['']
    resources: ['configmaps', 'secrets']
    verbs: ['get', 'list']
  - apiGroups: ['']
    resources: ['pods']
    verbs: ['get', 'list', 'create']

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-app-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: web-app-sa
    namespace: production
roleRef:
  kind: Role
  name: web-app-role
  apiGroup: rbac.authorization.k8s.io
```

### Pod Security Standards

```yaml
# pod-security-policy.yaml - Pod security enforcement
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Security Context Best Practices

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
```

## AI Assistant Guidelines

When helping with Kubernetes:

1. **Always recommend production-ready configurations** with proper resource limits, health checks, and security settings
2. **Provide complete manifest examples** including all necessary Kubernetes resources for the application
3. **Include security best practices** with RBAC, network policies, and pod security standards
4. **Suggest appropriate scaling strategies** with HPA, VPA, and cluster autoscaling
5. **Provide debugging guidance** for common pod, service, and cluster issues
6. **Include monitoring and observability** configurations for production deployments
7. **Reference GitOps workflows** with ArgoCD or Flux for automated deployments
8. **Suggest appropriate storage solutions** based on application requirements and performance needs

### Code Generation Rules

- Generate production-ready Kubernetes manifests with comprehensive configurations
- Include proper resource requests and limits for optimal cluster utilization
- Provide security-hardened configurations with non-root users and security contexts
- Include health checks, monitoring, and logging configurations for observability
- Generate multi-environment configurations with proper namespace separation
- Provide CI/CD pipeline examples with automated testing and deployment
- Include backup and disaster recovery strategies for stateful applications

### Code Generation Rules

- Generate production-ready Kubernetes manifests with comprehensive configurations
- Include proper resource requests and limits for optimal cluster utilization
- Provide security-hardened configurations with non-root users and security contexts
- Include health checks, monitoring, and logging configurations for observability
- Generate multi-environment configurations with proper namespace separation
- Provide CI/CD pipeline examples with automated testing and deployment
- Include backup and disaster recovery strategies for stateful applications
- Generate Helm charts and Kustomize overlays for configuration management

## 🔒 Advanced Security and Compliance

### Falco Runtime Security Monitoring

```bash
# falco-enterprise-setup.sh - Runtime security monitoring and threat detection
cat > ~/.local/bin/setup-falco-security.sh << 'EOF'
#!/bin/bash
set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [FALCO] $*"
}

# Install Falco with enterprise configuration
install_falco() {
    log "Installing Falco runtime security monitoring..."

    # Add Falco Helm repository
    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update

    # Create Falco configuration
    cat > falco-values.yaml << 'FALCO_EOF'
driver:
  kind: modern_ebpf

falco:
  rules_file:
    - /etc/falco/falco_rules.yaml
    - /etc/falco/falco_rules.local.yaml
    - /etc/falco/k8s_audit_rules.yaml
    - /etc/falco/rules.d

  outputs:
    rate: 1
    max_burst: 1000

  outputs_queue:
    capacity: 0

  grpc:
    enabled: true
    bind_address: "0.0.0.0:5060"
    threadiness: 8

  grpc_output:
    enabled: true

customRules:
  rules-enterprise.yaml: |-
    - rule: Detect crypto miners
      desc: Detect cryptocurrency miners
      condition: spawned_process and proc.name in (xmrig, minergate)
      output: Crypto mining process detected (user=%user.name command=%proc.cmdline)
      priority: CRITICAL
      tags: [malware, crypto]

    - rule: Unauthorized privilege escalation
      desc: Detect unauthorized privilege escalation attempts
      condition: spawned_process and proc.name in (sudo, su) and not user.name in (admin, root)
      output: Unauthorized privilege escalation attempt (user=%user.name command=%proc.cmdline)
      priority: HIGH
      tags: [security, privilege]

    - rule: Suspicious network activity
      desc: Detect suspicious outbound network connections
      condition: outbound and fd.net and not proc.name in (curl, wget, ssh) and fd.rport in (6667, 6697, 8333, 4444)
      output: Suspicious outbound connection (process=%proc.name connection=%fd.name)
      priority: HIGH
      tags: [network, suspicious]

services:
  - name: falcosidekick
    type: ClusterIP
    ports:
      - port: 2801
        targetPort: 2801
        protocol: TCP
        name: http

falcosidekick:
  enabled: true
  config:
    slack:
      webhookurl: "${SLACK_WEBHOOK_URL}"
      channel: "#security-alerts"
      username: "Falco"
      icon: ":shield:"
    teams:
      webhookurl: "${TEAMS_WEBHOOK_URL}"
    elasticsearch:
      hostport: "elasticsearch:9200"
      index: "falco-security"
    prometheus:
      extralabels: "cluster:production"

nodeSelector:
  kubernetes.io/os: linux

tolerations:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
    operator: Exists
  - effect: NoSchedule
    key: node-role.kubernetes.io/control-plane
    operator: Exists

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 1Gi
FALCO_EOF

    # Install Falco
    helm install falco falcosecurity/falco \
        --namespace falco-system \
        --create-namespace \
        --values falco-values.yaml

    log "✓ Falco installed successfully"
}

# Configure audit logging
setup_audit_logging() {
    log "Configuring Kubernetes audit logging..."

    cat > k8s-audit-policy.yaml << 'AUDIT_EOF'
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
# Log security-sensitive events
- level: Metadata
  namespaces: ["production", "staging"]
  resources:
  - group: ""
    resources: ["secrets", "serviceaccounts"]
  - group: "rbac.authorization.k8s.io"
    resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]

# Log all pod exec/attach operations
- level: RequestResponse
  resources:
  - group: ""
    resources: ["pods/exec", "pods/attach", "pods/portforward"]

# Log authentication/authorization failures
- level: Request
  users: ["system:anonymous"]

- level: RequestResponse
  resources:
  - group: ""
    resources: ["nodes", "persistentvolumes"]
  - group: "apps"
    resources: ["deployments", "daemonsets", "statefulsets"]
AUDIT_EOF

    log "✓ Audit policy configured"
}

# Main execution
install_falco
setup_audit_logging
log "Falco security monitoring setup completed"
EOF

chmod +x ~/.local/bin/setup-falco-security.sh
```

### CIS Kubernetes Benchmarks

```bash
# cis-kubernetes-benchmark.sh - Automated CIS compliance validation
cat > ~/.local/bin/cis-kubernetes-benchmark.sh << 'EOF'
#!/bin/bash
set -euo pipefail

CLUSTER_NAME="${1:-production}"
BENCHMARK_DIR="./compliance/cis-kubernetes"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CIS-K8S] $*"
}

# Setup CIS benchmark structure
setup_cis_structure() {
    log "Setting up CIS Kubernetes benchmark structure..."

    mkdir -p "$BENCHMARK_DIR"/{reports,evidence,remediation,policies}

    # CIS Kubernetes Benchmark controls
    cat > "$BENCHMARK_DIR/cis-k8s-controls.json" << 'CIS_K8S_EOF'
{
  "benchmark": "CIS Kubernetes Benchmark v1.7.0",
  "cluster": "production",
  "controls": {
    "1.1.1": {
      "title": "Ensure API server pod specification file permissions are set to 644 or more restrictive",
      "check": "check_api_server_permissions",
      "level": "Level 1"
    },
    "1.2.6": {
      "title": "Ensure that the --kubelet-certificate-authority argument is set as appropriate",
      "check": "check_kubelet_certificate_authority",
      "level": "Level 1"
    },
    "1.3.2": {
      "title": "Ensure that the --profiling argument is set to false",
      "check": "check_controller_manager_profiling",
      "level": "Level 1"
    },
    "3.2.1": {
      "title": "Ensure that a minimal audit policy is created",
      "check": "check_audit_policy",
      "level": "Level 1"
    },
    "4.2.1": {
      "title": "Minimize the admission of privileged containers",
      "check": "check_privileged_containers",
      "level": "Level 1"
    },
    "5.1.3": {
      "title": "Minimize wildcard use in Roles and ClusterRoles",
      "check": "check_rbac_wildcards",
      "level": "Level 1"
    },
    "5.2.2": {
      "title": "Minimize the admission of containers wishing to share the host process ID namespace",
      "check": "check_host_pid",
      "level": "Level 1"
    },
    "5.3.2": {
      "title": "Minimize the admission of containers with allowPrivilegeEscalation",
      "check": "check_privilege_escalation",
      "level": "Level 1"
    }
  }
}
CIS_K8S_EOF

    log "✓ CIS structure created"
}

# Check API server permissions
check_api_server_permissions() {
    local result_file="$BENCHMARK_DIR/evidence/1.1.1-api-server-permissions.log"

    log "Checking API server permissions (CIS 1.1.1)..."

    # Check if running on managed cluster (EKS, GKE, AKS)
    if kubectl get nodes -o jsonpath='{.items[0].spec.providerID}' | grep -E "(aws|gce|azure)" > /dev/null; then
        echo "PASS: Managed Kubernetes cluster - API server permissions handled by cloud provider" >> "$result_file"
        log "✓ Managed cluster detected - API server permissions managed"
    else
        # For self-managed clusters
        if [ -f /etc/kubernetes/manifests/kube-apiserver.yaml ]; then
            local perms
            perms=$(stat -c %a /etc/kubernetes/manifests/kube-apiserver.yaml 2>/dev/null || echo "unknown")
            if [ "$perms" = "644" ] || [ "$perms" = "600" ]; then
                echo "PASS: API server manifest permissions are $perms" >> "$result_file"
                log "✓ API server permissions are secure ($perms)"
            else
                echo "FAIL: API server manifest permissions are $perms (should be 644 or more restrictive)" >> "$result_file"
                log "⚠️ API server permissions need attention ($perms)"
            fi
        else
            echo "INFO: API server manifest not found - likely managed cluster" >> "$result_file"
        fi
    fi
}

# Check privileged containers
check_privileged_containers() {
    local result_file="$BENCHMARK_DIR/evidence/4.2.1-privileged-containers.log"

    log "Checking for privileged containers (CIS 4.2.1)..."

    # Check for Pod Security Standards
    local restricted_namespaces
    restricted_namespaces=$(kubectl get namespaces -l pod-security.kubernetes.io/enforce=restricted -o name 2>/dev/null | wc -l)

    if [ "$restricted_namespaces" -gt 0 ]; then
        echo "PASS: $restricted_namespaces namespace(s) with restricted pod security standards" >> "$result_file"
        log "✓ Pod Security Standards enforced in $restricted_namespaces namespace(s)"
    fi

    # Check for actual privileged containers
    local privileged_pods
    privileged_pods=$(kubectl get pods --all-namespaces -o jsonpath='{range .items[*]}{.metadata.namespace}{" "}{.metadata.name}{" "}{range .spec.containers[*]}{.securityContext.privileged}{"\n"}{end}{end}' | grep -c "true" || echo "0")

    if [ "$privileged_pods" -eq 0 ]; then
        echo "PASS: No privileged containers found" >> "$result_file"
        log "✓ No privileged containers detected"
    else
        echo "FAIL: $privileged_pods privileged container(s) found" >> "$result_file"
        log "⚠️ Found $privileged_pods privileged container(s)"
    fi
}

# Check RBAC wildcards
check_rbac_wildcards() {
    local result_file="$BENCHMARK_DIR/evidence/5.1.3-rbac-wildcards.log"

    log "Checking RBAC wildcards (CIS 5.1.3)..."

    # Check ClusterRoles for wildcards
    local wildcard_clusterroles
    wildcard_clusterroles=$(kubectl get clusterroles -o yaml | grep -E "verbs:.*\*|resources:.*\*" | wc -l || echo "0")

    # Check Roles for wildcards
    local wildcard_roles
    wildcard_roles=$(kubectl get roles --all-namespaces -o yaml | grep -E "verbs:.*\*|resources:.*\*" | wc -l || echo "0")

    local total_wildcards=$((wildcard_clusterroles + wildcard_roles))

    if [ "$total_wildcards" -gt 5 ]; then
        echo "WARN: $total_wildcards RBAC rules with wildcards found (review recommended)" >> "$result_file"
        log "⚠️ $total_wildcards RBAC wildcard rules found"
    else
        echo "PASS: Minimal wildcard usage in RBAC ($total_wildcards rules)" >> "$result_file"
        log "✓ RBAC wildcard usage is minimal"
    fi
}

# Check host PID namespace sharing
check_host_pid() {
    local result_file="$BENCHMARK_DIR/evidence/5.2.2-host-pid.log"

    log "Checking host PID namespace sharing (CIS 5.2.2)..."

    local host_pid_pods
    host_pid_pods=$(kubectl get pods --all-namespaces -o jsonpath='{range .items[*]}{.metadata.namespace}{" "}{.metadata.name}{" "}{.spec.hostPID}{"\n"}{end}' | grep -c "true" || echo "0")

    if [ "$host_pid_pods" -eq 0 ]; then
        echo "PASS: No pods sharing host PID namespace" >> "$result_file"
        log "✓ No host PID namespace sharing detected"
    else
        echo "FAIL: $host_pid_pods pod(s) sharing host PID namespace" >> "$result_file"
        log "⚠️ Found $host_pid_pods pod(s) sharing host PID namespace"
    fi
}

# Check privilege escalation
check_privilege_escalation() {
    local result_file="$BENCHMARK_DIR/evidence/5.3.2-privilege-escalation.log"

    log "Checking privilege escalation (CIS 5.3.2)..."

    local allow_privilege_escalation
    allow_privilege_escalation=$(kubectl get pods --all-namespaces -o jsonpath='{range .items[*]}{range .spec.containers[*]}{.securityContext.allowPrivilegeEscalation}{"\n"}{end}{end}' | grep -c "true" || echo "0")

    if [ "$allow_privilege_escalation" -eq 0 ]; then
        echo "PASS: No containers allowing privilege escalation" >> "$result_file"
        log "✓ Privilege escalation properly controlled"
    else
        echo "FAIL: $allow_privilege_escalation container(s) allowing privilege escalation" >> "$result_file"
        log "⚠️ Found $allow_privilege_escalation container(s) with privilege escalation"
    fi
}

# Generate CIS compliance report
generate_cis_report() {
    log "Generating CIS Kubernetes compliance report..."

    local report_file="$BENCHMARK_DIR/reports/cis-k8s-report-$(date +%Y%m%d-%H%M%S).json"
    local total_checks=0
    local passed_checks=0
    local failed_checks=0
    local warnings=0

    # Count results
    for evidence_file in "$BENCHMARK_DIR/evidence"/*.log; do
        if [ -f "$evidence_file" ]; then
            local file_passed file_failed file_warnings
            file_passed=$(grep -c "PASS" "$evidence_file" 2>/dev/null || echo 0)
            file_failed=$(grep -c "FAIL" "$evidence_file" 2>/dev/null || echo 0)
            file_warnings=$(grep -c "WARN" "$evidence_file" 2>/dev/null || echo 0)

            passed_checks=$((passed_checks + file_passed))
            failed_checks=$((failed_checks + file_failed))
            warnings=$((warnings + file_warnings))
        fi
    done

    total_checks=$((passed_checks + failed_checks + warnings))
    local compliance_percentage=0
    if [ "$total_checks" -gt 0 ]; then
        compliance_percentage=$(( (passed_checks * 100) / total_checks ))
    fi

    cat > "$report_file" << EOF
{
  "cis_kubernetes_compliance": {
    "benchmark": "CIS Kubernetes Benchmark v1.7.0",
    "cluster_name": "$CLUSTER_NAME",
    "report_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "summary": {
      "total_checks": $total_checks,
      "passed": $passed_checks,
      "failed": $failed_checks,
      "warnings": $warnings,
      "compliance_percentage": $compliance_percentage
    },
    "control_results": {
      "1.1.1_api_server_permissions": "$(test -f "$BENCHMARK_DIR/evidence/1.1.1-api-server-permissions.log" && echo "checked" || echo "skipped")",
      "4.2.1_privileged_containers": "$(test -f "$BENCHMARK_DIR/evidence/4.2.1-privileged-containers.log" && echo "checked" || echo "skipped")",
      "5.1.3_rbac_wildcards": "$(test -f "$BENCHMARK_DIR/evidence/5.1.3-rbac-wildcards.log" && echo "checked" || echo "skipped")",
      "5.2.2_host_pid": "$(test -f "$BENCHMARK_DIR/evidence/5.2.2-host-pid.log" && echo "checked" || echo "skipped")",
      "5.3.2_privilege_escalation": "$(test -f "$BENCHMARK_DIR/evidence/5.3.2-privilege-escalation.log" && echo "checked" || echo "skipped")"
    }
  }
}
EOF

    log "✓ CIS Kubernetes report generated: $report_file"
    log "Compliance Summary: $passed_checks/$total_checks passed ($compliance_percentage%), $failed_checks failed, $warnings warnings"
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    setup_cis_structure
    mkdir -p "$BENCHMARK_DIR/evidence"

    # Run CIS checks
    check_api_server_permissions
    check_privileged_containers
    check_rbac_wildcards
    check_host_pid
    check_privilege_escalation

    generate_cis_report

EOF

chmod +x ~/.local/bin/cis-kubernetes-benchmark.sh
```

## ⚖️ Multi-Cluster Management and Federation

### Cluster API for Infrastructure Management

```yaml
# cluster-api-management.yaml - Infrastructure as code for Kubernetes clusters
apiVersion: infrastructure.cluster.x-k8s.io/v1beta1
kind: AWSCluster
metadata:
  name: production-cluster
  namespace: cluster-system
spec:
  region: us-west-2
  networkSpec:
    vpc:
      availabilityZoneUsageLimit: 3
      availabilityZoneSelection: Ordered
    subnets:
      - availabilityZone: us-west-2a
        cidrBlock: 10.0.1.0/24
        isPublic: true
      - availabilityZone: us-west-2b
        cidrBlock: 10.0.2.0/24
        isPublic: true
      - availabilityZone: us-west-2c
        cidrBlock: 10.0.3.0/24
        isPublic: true
      - availabilityZone: us-west-2a
        cidrBlock: 10.0.4.0/24
        isPublic: false
      - availabilityZone: us-west-2b
        cidrBlock: 10.0.5.0/24
        isPublic: false
      - availabilityZone: us-west-2c
        cidrBlock: 10.0.6.0/24
        isPublic: false
  bastion:
    enabled: true
---
apiVersion: cluster.x-k8s.io/v1beta1
kind: Cluster
metadata:
  name: production-cluster
  namespace: cluster-system
spec:
  clusterNetwork:
    pods:
      cidrBlocks:
        - 192.168.0.0/16
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1beta1
    kind: AWSCluster
    name: production-cluster
  controlPlaneRef:
    kind: KubeadmControlPlane
    apiVersion: controlplane.cluster.x-k8s.io/v1beta1
    name: production-control-plane
---
apiVersion: controlplane.cluster.x-k8s.io/v1beta1
kind: KubeadmControlPlane
metadata:
  name: production-control-plane
  namespace: cluster-system
spec:
  version: v1.28.2
  replicas: 3
  machineTemplate:
    infrastructureRef:
      kind: AWSMachineTemplate
      apiVersion: infrastructure.cluster.x-k8s.io/v1beta1
      name: production-control-plane
  kubeadmConfigSpec:
    initConfiguration:
      nodeRegistration:
        name: '{{ ds.meta_data.local_hostname }}'
        kubeletExtraArgs:
          cloud-provider: aws
    clusterConfiguration:
      apiServer:
        timeoutForControlPlane: 20m
        cloudProvider: aws
        extraArgs:
          audit-log-path: /var/log/audit.log
          audit-policy-file: /etc/kubernetes/audit-policy.yaml
          enable-admission-plugins: NodeRestriction,PodSecurity
        extraVolumes:
          - name: audit-policy
            hostPath: /etc/kubernetes/audit-policy.yaml
            mountPath: /etc/kubernetes/audit-policy.yaml
            readOnly: true
            pathType: File
      controllerManager:
        cloudProvider: aws
        extraArgs:
          enable-hostpath-provisioner: 'true'
      dns:
        type: CoreDNS
      etcd:
        local:
          dataDir: /var/lib/etcd
    joinConfiguration:
      nodeRegistration:
        name: '{{ ds.meta_data.local_hostname }}'
        kubeletExtraArgs:
          cloud-provider: aws
```

### Admiral Multi-Cluster Service Mesh

```yaml
# admiral-multicluster.yaml - Service mesh federation across clusters
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: multicluster-primary
spec:
  values:
    global:
      meshID: enterprise-mesh
      network: primary-network
      multiCluster:
        clusterName: production-primary
    pilot:
      env:
        ADMIRAL_SYNC_NAMESPACES: 'production,staging'
        PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY: true
        PILOT_SCOPE_GATEWAY_TO_NAMESPACE: true
---
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: cross-cluster-gateway
  namespace: istio-system
spec:
  selector:
    istio: eastwestgateway
  servers:
    - port:
        number: 15021
        name: status-port
        protocol: HTTP
      hosts:
        - '*'
    - port:
        number: 15443
        name: tls
        protocol: TLS
      tls:
        mode: ISTIO_MUTUAL
      hosts:
        - '*.local'
---
# Admiral configuration for multi-cluster service discovery
apiVersion: v1
kind: ConfigMap
metadata:
  name: admiral-config
  namespace: admiral
data:
  config.yaml: |
    admiral:
      metrics:
        enabled: true
        port: 15020
      profile: default
      logLevel: "info"
      hostnameSuffix: "global"
      syncNamespaces: ["production", "staging"]
      cacheRefreshDuration: 5m
      clusterRegistriesNamespace: "admiral"
      dependencyNamespaceLabels:
        - "identity"
      workloadIdentityKey: "identity"
      globalTrafficPolicy:
        policy:
          - dns_prefix: "production"
            match:
              - uri:
                  prefix: "/api/v1"
            route:
              - destination:
                  host: "api-service.production.global"
                weight: 100
```

## 🛡️ Disaster Recovery and Backup Management

### Velero Backup and Restore

```yaml
# velero-disaster-recovery.yaml - Comprehensive backup and disaster recovery
apiVersion: v1
kind: Namespace
metadata:
  name: velero
---
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: aws-backup-location
  namespace: velero
spec:
  provider: aws
  objectStorage:
    bucket: company-k8s-backups
    prefix: production-cluster
  config:
    region: us-west-2
    s3ForcePathStyle: 'false'
---
apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: aws-snapshot-location
  namespace: velero
spec:
  provider: aws
  config:
    region: us-west-2
---
# Scheduled backup for critical namespaces
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: production-daily-backup
  namespace: velero
spec:
  schedule: '0 1 * * *' # Daily at 1 AM
  template:
    includedNamespaces:
      - production
      - monitoring
      - istio-system
    excludedResources:
      - pods
      - replicasets
    includedClusterResources:
      - clusterroles
      - clusterrolebindings
      - customresourcedefinitions
    storageLocation: aws-backup-location
    volumeSnapshotLocations:
      - aws-snapshot-location
    ttl: 168h0m0s # 7 days retention
    hooks:
      resources:
        - name: postgres-backup-hook
          includedNamespaces:
            - production
          includedResources:
            - pods
          labelSelector:
            matchLabels:
              app: postgresql
          pre:
            - exec:
                container: postgresql
                command:
                  - /bin/bash
                  - -c
                  - pg_dump -U postgres mydb > /tmp/backup.sql
                onError: Continue
          post:
            - exec:
                container: postgresql
                command:
                  - rm
                  - /tmp/backup.sql
---
# Weekly full cluster backup
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: full-cluster-weekly-backup
  namespace: velero
spec:
  schedule: '0 2 * * 0' # Weekly on Sunday at 2 AM
  template:
    defaultVolumesToRestic: true
    storageLocation: aws-backup-location
    volumeSnapshotLocations:
      - aws-snapshot-location
    ttl: 720h0m0s # 30 days retention
```

### Disaster Recovery Automation

```bash
# disaster-recovery.sh - Automated disaster recovery procedures
cat > ~/.local/bin/kubernetes-disaster-recovery.sh << 'EOF'
#!/bin/bash
set -euo pipefail

CLUSTER_NAME="${1:-production}"
RECOVERY_TYPE="${2:-full}"  # full, partial, namespace
BACKUP_DATE="${3:-latest}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DR] $*"
}

# Validate pre-requisites
validate_prerequisites() {
    log "Validating disaster recovery prerequisites..."

    # Check Velero installation
    if ! kubectl get deployment velero -n velero >/dev/null 2>&1; then
        log "ERROR: Velero not found. Install Velero first."
        exit 1
    fi

    # Check backup storage access
    if ! velero backup-location get aws-backup-location >/dev/null 2>&1; then
        log "ERROR: Backup storage location not accessible"
        exit 1
    fi

    # Check cluster connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log "ERROR: Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log "✓ Prerequisites validated"
}

# List available backups
list_available_backups() {
    log "Available backups for cluster $CLUSTER_NAME:"
    velero backup get --selector="cluster=$CLUSTER_NAME" --output table
}

# Perform full cluster restore
perform_full_restore() {
    local backup_name="$1"

    log "Performing full cluster restore from backup: $backup_name"

    # Create restore with excluded items
    velero restore create "dr-restore-$(date +%Y%m%d-%H%M%S)" \
        --from-backup "$backup_name" \
        --exclude-resources pods,replicasets \
        --wait

    # Verify critical services
    log "Verifying critical services after restore..."

    local critical_deployments=("kube-dns" "coredns" "metrics-server")
    for deployment in "${critical_deployments[@]}"; do
        if kubectl get deployment "$deployment" -n kube-system >/dev/null 2>&1; then
            kubectl rollout status deployment/"$deployment" -n kube-system --timeout=300s
            log "✓ $deployment is healthy"
        fi
    done

    log "✓ Full cluster restore completed"
}

# Perform namespace-specific restore
perform_namespace_restore() {
    local backup_name="$1"
    local namespace="$2"

    log "Performing namespace restore for $namespace from backup: $backup_name"

    # Create namespace if it doesn't exist
    kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -

    # Perform selective restore
    velero restore create "ns-restore-$namespace-$(date +%Y%m%d-%H%M%S)" \
        --from-backup "$backup_name" \
        --include-namespaces "$namespace" \
        --wait

    # Verify namespace health
    log "Verifying namespace $namespace after restore..."

    local ready_pods failed_pods
    ready_pods=$(kubectl get pods -n "$namespace" --field-selector=status.phase=Running --no-headers | wc -l)
    failed_pods=$(kubectl get pods -n "$namespace" --field-selector=status.phase=Failed --no-headers | wc -l)

    log "Namespace $namespace status: $ready_pods running pods, $failed_pods failed pods"

    if [ "$failed_pods" -gt 0 ]; then
        log "WARNING: Some pods failed in namespace $namespace"
        kubectl get pods -n "$namespace" --field-selector=status.phase=Failed
    fi

    log "✓ Namespace restore completed"
}

# Test disaster recovery procedures
test_disaster_recovery() {
    log "Testing disaster recovery procedures..."

    local test_namespace="dr-test-$(date +%s)"

    # Create test namespace and resources
    kubectl create namespace "$test_namespace"
    kubectl create deployment test-app --image=nginx:1.21 -n "$test_namespace"
    kubectl create configmap test-config --from-literal=key=value -n "$test_namespace"

    # Create test backup
    local test_backup="test-backup-$(date +%Y%m%d-%H%M%S)"
    velero backup create "$test_backup" \
        --include-namespaces "$test_namespace" \
        --wait

    # Delete resources
    kubectl delete namespace "$test_namespace"

    # Wait for cleanup
    sleep 10

    # Restore from backup
    velero restore create "test-restore-$(date +%Y%m%d-%H%M%S)" \
        --from-backup "$test_backup" \
        --wait

    # Verify restoration
    if kubectl get deployment test-app -n "$test_namespace" >/dev/null 2>&1; then
        log "✓ Disaster recovery test PASSED"
    else
        log "✗ Disaster recovery test FAILED"
        exit 1
    fi

    # Cleanup test resources
    kubectl delete namespace "$test_namespace"
    velero backup delete "$test_backup" --confirm

    log "✓ Disaster recovery test completed"
}

# Generate disaster recovery report
generate_dr_report() {
    log "Generating disaster recovery report..."

    local report_file="./dr-report-$(date +%Y%m%d-%H%M%S).json"

    # Collect backup information
    local backup_count
    backup_count=$(velero backup get --output json | jq '.items | length')

    local recent_backups
    recent_backups=$(velero backup get --output json | jq -r '.items[] | select(.status.phase == "Completed") | .metadata.name' | head -10)

    # Collect cluster health information
    local node_count ready_nodes
    node_count=$(kubectl get nodes --no-headers | wc -l)
    ready_nodes=$(kubectl get nodes --no-headers | grep -c Ready)

    cat > "$report_file" << EOF
{
  "disaster_recovery_report": {
    "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "cluster_name": "$CLUSTER_NAME",
    "backup_status": {
      "total_backups": $backup_count,
      "recent_successful_backups": [
        $(echo "$recent_backups" | sed 's/^/"/' | sed 's/$/"/' | paste -sd ',' -)
      ]
    },
    "cluster_health": {
      "total_nodes": $node_count,
      "ready_nodes": $ready_nodes,
      "node_readiness_ratio": "$(echo "scale=2; $ready_nodes / $node_count * 100" | bc)%"
    },
    "velero_status": {
      "installation_status": "$(kubectl get deployment velero -n velero -o jsonpath='{.status.readyReplicas}')/$(kubectl get deployment velero -n velero -o jsonpath='{.spec.replicas}')",
      "backup_locations": [
        $(velero backup-location get -o json | jq -r '.items[].metadata.name' | sed 's/^/"/' | sed 's/$/"/' | paste -sd ',' -)
      ]
    }
  }
}
EOF

    log "✓ Disaster recovery report generated: $report_file"
}

# Main execution
case "$RECOVERY_TYPE" in
    "test")
        validate_prerequisites
        test_disaster_recovery
        ;;
    "full")
        validate_prerequisites
        list_available_backups
        if [ "$BACKUP_DATE" = "latest" ]; then
            local latest_backup
            latest_backup=$(velero backup get --output json | jq -r '.items[] | select(.status.phase == "Completed") | .metadata.name' | head -1)
            perform_full_restore "$latest_backup"
        else
            perform_full_restore "$BACKUP_DATE"
        fi
        ;;
    "namespace")
        validate_prerequisites
        if [ -z "${4:-}" ]; then
            log "ERROR: Namespace parameter required for namespace restore"
            exit 1
        fi
        perform_namespace_restore "$BACKUP_DATE" "$4"
        ;;
    "report")
        validate_prerequisites
        generate_dr_report
        ;;
    *)
        echo "Usage: $0 <cluster_name> [full|namespace|test|report] [backup_date] [namespace]"
        exit 1
        ;;
esac

log "Disaster recovery operation completed"
EOF

chmod +x ~/.local/bin/kubernetes-disaster-recovery.sh
```

## 🏁 Kubernetes Enterprise Platform Summary

This comprehensive Kubernetes enterprise platform delivers production-ready container orchestration with advanced security, compliance, and operational capabilities that transform basic container management into a fully-governed, enterprise-grade infrastructure foundation.
EOF

chmod +x ~/.local/bin/cis-kubernetes-benchmark.sh

```

## ⚖️ Multi-Cluster Management and Federation`
```

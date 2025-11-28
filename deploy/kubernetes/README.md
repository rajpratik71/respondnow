# RespondNow - Kubernetes Deployment

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Container images built and pushed to a registry

## Building Images

```bash
# Build server image
cd ../../server
docker build -t respondnow/server:latest .

# Build portal image
cd ../../portal
docker build -f Dockerfile.multistage -t respondnow/portal:latest .

# Push to your registry
docker tag respondnow/server:latest <your-registry>/respondnow/server:latest
docker tag respondnow/portal:latest <your-registry>/respondnow/portal:latest
docker push <your-registry>/respondnow/server:latest
docker push <your-registry>/respondnow/portal:latest
```

## Deployment

### Using Kustomize

```bash
# Preview manifests
kubectl kustomize .

# Apply all resources
kubectl apply -k .
```

### Manual Deployment

```bash
# Apply in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f server.yaml
kubectl apply -f portal.yaml
kubectl apply -f ingress.yaml
```

## Verify Deployment

```bash
# Check all resources
kubectl get all -n respondnow

# Check pods
kubectl get pods -n respondnow -w

# Check logs
kubectl logs -f deployment/respondnow-server -n respondnow
kubectl logs -f deployment/respondnow-portal -n respondnow
```

## Access the Application

### Port Forwarding (Development)

```bash
# Portal
kubectl port-forward svc/respondnow-portal 8191:8191 -n respondnow

# Server API
kubectl port-forward svc/respondnow-server 8080:8080 -n respondnow
```

### Via Ingress

Add to `/etc/hosts`:
```
<INGRESS_IP> respondnow.local
```

Access: http://respondnow.local

## Endpoints

| Endpoint | Description |
|----------|-------------|
| http://respondnow.local | Portal UI |
| http://respondnow.local/api | Server API |
| http://localhost:8080/swagger-ui.html | Swagger UI (via port-forward) |
| http://localhost:8080/actuator | Actuator endpoints |

## Configuration

### Update Secrets

```bash
# Edit secrets
kubectl edit secret respondnow-secret -n respondnow

# Or update from file
kubectl apply -f secret.yaml
```

### Scale Deployments

```bash
kubectl scale deployment respondnow-server --replicas=3 -n respondnow
kubectl scale deployment respondnow-portal --replicas=2 -n respondnow
```

## Cleanup

```bash
kubectl delete -k .
```

## Default Credentials

- **Email**: admin@respondnow.io
- **Password**: respondnow

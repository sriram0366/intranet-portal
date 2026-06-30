# NovaCorp Company Intranet Portal — DevOps Assignment 2 (Use Case 4)

A complete DevOps implementation for an internal employee portal: version control,
CI/CD via Jenkins, Docker containerization, Kubernetes orchestration, and continuous
monitoring with Nagios + Graphite + Grafana.

## 1. Project Structure
```
intranet-portal/
├── src/                    # Website source (HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── nginx.conf          # /health and /nginx_status endpoints
├── Dockerfile
├── Jenkinsfile
├── k8s/
│   ├── deployment.yaml     # 3-replica Deployment with liveness/readiness probes
│   └── service.yaml        # NodePort Service (port 30080)
├── monitoring/
│   ├── nagios/novacorp_intranet.cfg
│   ├── docker-compose.monitoring.yml   # Graphite + Grafana + node-exporter
│   └── grafana/provisioning/...        # auto-provisioned datasource + dashboard
└── README.md
```

## 2. Version Control (Requirement: "Maintain all website files in version control")
```bash
git init
git add .
git commit -m "Initial commit: NovaCorp intranet portal"
git remote add origin https://github.com/<your-username>/<RegisterNumber>-DevOps-Project.git
git push -u origin main
```

## 3. Local Build & Test (no Jenkins required)
```bash
cd intranet-portal
docker build -t novacorp/intranet-portal:latest .
docker run -d -p 8080:80 --name intranet-portal novacorp/intranet-portal:latest
curl http://localhost:8080/health
# -> {"status":"UP","service":"intranet-portal"}
```
Open `http://localhost:8080` in a browser to view the deployed portal.

## 4. Automated Deployment via Jenkins (Requirement: "Automate deployment after updates")
1. Install Jenkins, the Docker Pipeline plugin, and the Kubernetes CLI plugin.
2. Create a new Pipeline job pointing at this repository, using the included `Jenkinsfile`.
3. Add Docker Hub credentials in Jenkins under id `dockerhub-credentials`.
4. Configure a GitHub webhook (or poll SCM) so every push triggers:
   `Checkout -> Lint -> Build Image -> Push to Docker Hub -> Deploy to Kubernetes -> Smoke Test`.
5. A successful build produces a tagged image (`novacorp/intranet-portal:<BUILD_NUMBER>`) and
   rolls it out to the cluster automatically.

## 5. Docker (Requirement: "Deploy using Docker and Kubernetes")
The Dockerfile uses `nginx:1.27-alpine` to serve the static site and exposes:
- `/` — the portal
- `/health` — JSON health check (used by Kubernetes probes and Nagios)
- `/nginx_status` — stub_status metrics for monitoring agents

## 6. Kubernetes Deployment
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods -l app=intranet-portal
kubectl get svc intranet-portal-service
```
Access the portal at `http://<NodeIP>:30080`.

Verify rollout:
```bash
kubectl rollout status deployment/intranet-portal-deployment
```

## 7. Monitoring Uptime with Nagios (Requirement: "Monitor website uptime")
1. Copy `monitoring/nagios/novacorp_intranet.cfg` into `/usr/local/nagios/etc/objects/`.
2. Add `cfg_file=/usr/local/nagios/etc/objects/novacorp_intranet.cfg` to `nagios.cfg`.
3. Restart Nagios: `systemctl restart nagios`.
4. The Nagios UI should show host `intranet-portal-host` as **UP** and service
   `HTTP - Intranet Portal` as **OK**, since the check queries `/health` on port 30080.

## 8. Metrics Collection with Graphite (Requirement: "Collect infrastructure metrics")
```bash
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```
This starts Graphite (port 80 for web UI, 2003 for Carbon line input, 8125 for StatsD)
and a `node-exporter` agent collecting CPU/Memory/Network metrics that can be piped
into Graphite via a StatsD bridge or `collectd`.

## 9. Dashboards with Grafana (Requirement: "Display dashboards for administrators")
Grafana is started by the same compose file on port 3000 (`admin` / `admin`).
The Graphite datasource and the `NovaCorp Intranet Portal - System Health` dashboard
are auto-provisioned on startup and display:
- CPU Usage (%)
- Memory Usage (MB)
- Network Traffic (rx/tx bytes/sec)
- Portal Uptime

## 10. Expected Final Output Checklist
- [x] Website files versioned in Git
- [x] Jenkins pipeline automates build → image push → Kubernetes deploy
- [x] Docker image builds and runs (`/health` returns 200 UP)
- [x] Kubernetes Deployment (3 replicas) + NodePort Service running
- [x] Portal accessible via browser at `http://<NodeIP>:30080`
- [x] Nagios host UP / service OK
- [x] Graphite receiving metrics
- [x] Grafana dashboard showing CPU, Memory, Network, Uptime

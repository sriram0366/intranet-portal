pipeline {
    agent any

    environment {
        IMAGE = "sriram0366/intranet-portal"
        TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint / Validate') {
            steps {
                sh '''
                echo "Checking required files exist..."
                test -f src/index.html
                test -f src/css/style.css
                test -f src/js/app.js
                echo "All required files present."
                '''
            }
        }

        stage('Check Tools') {
            steps {
                sh '''
                echo "Checking docker..."
                which docker
                docker --version

                echo "Checking kubectl..."
                which kubectl
                kubectl version --client
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE:5 -t $IMAGE:$TAG .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE:5
                    docker push $IMAGE:$TAG
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl apply -f k8s/deployment.yaml -n default
                kubectl apply -f k8s/service.yaml -n default
                kubectl set image deployment/intranet-portal-deployment intranet-portal=$IMAGE:5 -n default
                kubectl rollout status deployment/intranet-portal-deployment -n default
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                kubectl port-forward svc/intranet-portal-service 8080:80 &
                PF_PID=$!
                sleep 5

                curl -f http://localhost:8080 || exit 1

                kill $PF_PID
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED: Check logs above."
        }
    }
}

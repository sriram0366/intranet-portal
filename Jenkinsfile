pipeline {
    agent any

    environment {
        // IMPORTANT: fix PATH so Jenkins can find docker + kubectl
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/Applications/Docker.app/Contents/Resources/bin"

        IMAGE_NAME   = "novacorp/intranet-portal"
        IMAGE_TAG    = "${BUILD_NUMBER}"
        DOCKERHUB_CRED = "dockerhub-credentials"
        KUBE_NAMESPACE = "default"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Code already checked out by Jenkins SCM'
            }
        }

        stage('Lint / Validate') {
            steps {
                echo 'Validating project files...'
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
                    which docker || echo "Docker not found"
                    docker --version || true

                    echo "Checking kubectl..."
                    which kubectl || echo "kubectl not found"
                    kubectl version --client || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh '''
                    docker build -t $IMAGE_NAME:$IMAGE_TAG \
                                 -t $IMAGE_NAME:latest .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED}",
                                                 usernameVariable: 'DOCKER_USER',
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $IMAGE_NAME:$IMAGE_TAG
                        docker push $IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                sh '''
                    kubectl apply -f k8s/deployment.yaml -n $KUBE_NAMESPACE
                    kubectl apply -f k8s/service.yaml -n $KUBE_NAMESPACE

                    kubectl set image deployment/intranet-portal-deployment \
                        intranet-portal=$IMAGE_NAME:$IMAGE_TAG \
                        -n $KUBE_NAMESPACE

                    kubectl rollout status deployment/intranet-portal-deployment \
                        -n $KUBE_NAMESPACE
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                echo 'Running smoke test...'
                sh '''
                    sleep 10
                    NODE_PORT=30080
                    curl -f http://localhost:$NODE_PORT/health || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline SUCCESS: App deployed successfully!'
        }
        failure {
            echo '❌ Pipeline FAILED: Check logs above.'
        }
    }
}

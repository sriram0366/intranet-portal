pipeline {
    agent any

    environment {
        IMAGE_NAME   = "novacorp/intranet-portal"
        IMAGE_TAG    = "${BUILD_NUMBER}"
        DOCKERHUB_CRED = "dockerhub-credentials"   // configured in Jenkins Credentials store
        KUBE_NAMESPACE = "default"
    }

    stages {

        

        stage('Lint / Validate') {
            steps {
                echo 'Validating HTML/CSS/JS and Kubernetes manifests...'
                sh '''
                    echo "Checking required site files exist..."
                    test -f src/index.html
                    test -f src/css/style.css
                    test -f src/js/app.js
                    echo "All required files present."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image for intranet portal...'
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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
                echo 'Applying Kubernetes manifests...'
                sh '''
                    kubectl apply -f k8s/deployment.yaml -n $KUBE_NAMESPACE
                    kubectl apply -f k8s/service.yaml -n $KUBE_NAMESPACE
                    kubectl set image deployment/intranet-portal-deployment intranet-portal=$IMAGE_NAME:$IMAGE_TAG -n $KUBE_NAMESPACE
                    kubectl rollout status deployment/intranet-portal-deployment -n $KUBE_NAMESPACE
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                echo 'Verifying deployment health endpoint...'
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
            echo 'Pipeline completed successfully. Intranet portal deployed.'
        }
        failure {
            echo 'Pipeline failed. Check console output for details.'
        }
    }
}

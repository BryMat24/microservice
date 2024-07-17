pipeline {
    agent {
        label 'ubuntu-node'
    }

    environment {
        DOCKER_IMAGE = 'user-service'
        CONTAINER_NAME = 'user-service-container'
        DOCKER_USERNAME = 'brymat24'
    }

    stages {
        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }
        stage('Test') {
            steps {
                sh "docker run --name ${CONTAINER_NAME} ${DOCKER_IMAGE} npm install && npm test"
            }
        }
        stage('Release') {
            steps {
                script {
                    docker.withRegistry("", 'registry_credential_id') {
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                        sh "docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
        stage('Deployment') {
            steps {
                sh "kubectl apply -f ./kubernetes/deployment.yaml"
                sh "kubectl apply -f ./kubernetes/service.yaml"
                sh "kubectl apply -f ./kubernetes/sealed-secret.yaml"
            }
        }
    }
    
    post {
        always {
            sh "docker rm -f ${CONTAINER_NAME}"
            sh "docker rmi ${DOCKER_IMAGE}"
            sh "docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
        }
    }
}

pipeline {
    agent any

    environment {
        SERVICE_DIR = 'user-service'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                dir("${SERVICE_DIR}") {
                    sh 'echo Building user-service...'
                }
            }
        }
    }
}

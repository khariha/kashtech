pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "dhineshagr/kashtech:windows-latest"
        DOCKERHUB_CREDENTIALS_ID = "dockerhub-creds" // Update this in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE% ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    bat """
                        docker login -u %USERNAME% -p %PASSWORD%
                        docker push %DOCKER_IMAGE%
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
        success {
            echo 'Docker image built and pushed successfully.'
        }
        failure {
            echo 'Something went wrong.'
        }
    }
}

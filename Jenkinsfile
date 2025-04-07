pipeline {
    agent any

    environment {
        IMAGE_NAME = 'dhineshagr/kashtech'
        TAG = "${BUILD_NUMBER}"
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
                bat "docker build -t %IMAGE_NAME%:%TAG% ."
                bat "docker tag %IMAGE_NAME%:%TAG% %IMAGE_NAME%:latest"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat "docker push %IMAGE_NAME%:%TAG%"
                    bat "docker push %IMAGE_NAME%:latest"
                }
            }
        }
    }
}

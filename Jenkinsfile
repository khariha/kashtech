pipeline {
    agent any

    environment {
        IMAGE_NAME = "dhineshagr/kashtech"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        DOCKER_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_TAG = "${IMAGE_NAME}:latest"
        REMOTE_HOST = "20.127.197.227"
        SSH_CRED_ID = "azure-ssh-key"
        CONTAINER_NAME = "kashtech"
        APP_PORT = "3000"
        EXPOSED_PORT = "3000"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dhineshagr/kashtech.git'
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
                bat "docker build -t ${DOCKER_IMAGE} -t ${LATEST_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push ${DOCKER_IMAGE}
                        docker push ${LATEST_TAG}
                    """
                }
            }
        }

        stage('Deploy to Dev Server') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'azure-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                     bat """
                        plink -batch -i "%SSH_KEY%" -hostkey "ssh-ed25519 255 SHA256:rD9ddrzyxYVBqKH+JItonJ6M+9sEMqgtJUg+PEGJxg0" azureuser@${REMOTE_HOST} ^
                        "docker rm -f ${CONTAINER_NAME} || true && docker pull ${LATEST_TAG} && docker run -d -p ${EXPOSED_PORT}:${APP_PORT} --name ${CONTAINER_NAME} ${LATEST_TAG}"
                    """
                }
            }
        }


        // Optional manual prod stage (uncomment if needed)
        // stage('Deploy to Production') {
        //     when {
        //         beforeInput true
        //         branch 'main'
        //     }
        //     steps {
        //         input message: "Deploy build ${BUILD_NUMBER} to Production?"
        //         echo "🚀 Production deployment step would go here."
        //     }
        // }
    }

    post {
        success {
            echo "✅ Successfully built and deployed: ${DOCKER_IMAGE}"
        }
        always {
            echo '📦 Pipeline finished!'
        }
    }
}

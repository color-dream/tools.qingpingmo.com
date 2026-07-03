pipeline {
    agent any
    environment {
        IMAGE = 'tools.qingpingmo.com'
    }
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t $IMAGE .'
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f $IMAGE || true
                    docker run -d --name $IMAGE -p 10002:3000 --restart unless-stopped $IMAGE
                '''
            }
        }
    }
    post {
        failure {
            echo 'Build or deploy failed.'
        }
    }
}

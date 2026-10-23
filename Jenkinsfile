// FlowLab - Playwright tests on Jenkins (Kubernetes / Minikube pod agent)
// Each build starts a temporary pod with Playwright + browsers, runs the tests, then the pod is deleted.

pipeline {
    agent {
        kubernetes {
            defaultContainer 'playwright'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: playwright
    # Match this tag to the @playwright/test version in package.json
    image: mcr.microsoft.com/playwright:v1.64.1-jammy    
    command: ["sleep"]
    args: ["infinity"]
    resources:
      requests:
        cpu: "500m"
        memory: "1Gi"
      limits:
        cpu: "2"
        memory: "3Gi"
'''
        }
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                // FlowLab's webServer serves dist with Python - install it if the image lacks it
                sh 'command -v python3 || (apt-get update && apt-get install -y python3)'
            }
        }

        stage('Test') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}

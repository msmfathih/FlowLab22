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
                sh 'command -v python3 || (apt-get update && apt-get install -y python3)'
            }
        }

        stage('Test') {
            environment {
                PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'test-results/junit.xml'
                PLAYWRIGHT_HTML_OPEN = 'never'
            }
            steps {
                sh 'npx playwright test --reporter=list,html,junit'
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

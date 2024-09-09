pipeline {
    agent any

    environment {
        DOCKER_REPOSITORY = 'underthekey/web'
        REGISTRY_CREDENTIAL = 'underthekey-docker-hub'
        dockerImage = ''
    }

    parameters {
        string(name: 'DOCKER_NETWORK', defaultValue: 'proxy-network', description: 'docker network name')
        string(name: 'IMAGE_NAME', defaultValue: 'udtk-web', description: 'docker image name')
        choice(name: 'ENV_TYPE', choices: ['dev', 'prod'], description: 'Choose the environment type')
    }

    stages {
        stage('environment setup') {
            steps {
                withCredentials([file(credentialsId: 'udtk-web-credentials', variable: 'ENV_CREDENTIALS')]) {
                    script {
                        def props = readProperties file: ENV_CREDENTIALS
                        env.PROD_SERVER_PORT = props.PROD_SERVER_PORT
                        env.DEV_SERVER_PORT = props.DEV_SERVER_PORT

                        env.BRANCH_NAME = params.ENV_TYPE == 'prod' ? 'main' : 'dev'
                        env.DEPLOY_URL = params.ENV_TYPE == 'prod'
                                ? 'https://udtk.site'
                                : 'https://dev.udtk.site'
                        env.SERVER_PORT = params.ENV_TYPE == 'prod'
                                ? "${env.PROD_SERVER_PORT}"
                                : "${env.DEV_SERVER_PORT}"
                    }
                }
            }
        }

        stage('git clone') {
            steps {
                git branch: "${env.BRANCH_NAME}",
                credentialsId: 'github-token',
                url: 'https://github.com/underthekey/udtk-web'
            }
        }

        stage('image build & docker-hub push') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDENTIAL) {
                        sh 'docker buildx create --use --name mybuilder'
                        sh """
                        docker buildx build --platform linux/amd64 \
                        --build-arg SERVER_PORT=${env.SERVER_PORT} \
                        --cache-from type=registry,ref=${DOCKER_REPOSITORY}:buildcache \
                        --cache-to type=registry,ref=${DOCKER_REPOSITORY}:buildcache,mode=max \
                        -t ${DOCKER_REPOSITORY}:${BUILD_NUMBER} \
                        -t ${DOCKER_REPOSITORY}:latest \
                        --push .
                        """
                    }
                }
            }
        }

        stage('previous docker rm') {
            steps {
                sshagent(credentials: ['deepeet-ubuntu', 'udtk-ubuntu']) {
                    sh """
                        ssh -o ProxyCommand="ssh -W %h:%p -p ${PROXMOX_SSH_PORT} ${PROXMOX_SERVER_ACCOUNT}@${PROXMOX_SERVER_URI}" \
                        -o StrictHostKeyChecking=no ${UDTK_SERVER_ACCOUNT}@${UDTK_SERVER_IP} \
                        '
                        docker stop \$(docker ps -aq --filter "ancestor=${DOCKER_REPOSITORY}:latest") || true &&
                        docker rm -f \$(docker ps -aq --filter "ancestor=${DOCKER_REPOSITORY}:latest") || true &&
                        docker rmi ${DOCKER_REPOSITORY}:latest || true
                        '
                    """
                }
            }
        }

        stage('docker-hub pull') {
            steps {
                sshagent(credentials: ['deepeet-ubuntu', 'udtk-ubuntu']) {
                    sh """
                        ssh -o ProxyCommand="ssh -W %h:%p -p ${PROXMOX_SSH_PORT} ${PROXMOX_SERVER_ACCOUNT}@${PROXMOX_SERVER_URI}" \
                        -o StrictHostKeyChecking=no ${UDTK_SERVER_ACCOUNT}@${UDTK_SERVER_IP} 'docker pull ${DOCKER_REPOSITORY}:latest'
                    """
                }
            }
        }

        stage('service start') {
            steps {
                withCredentials([file(credentialsId: 'udtk-web-credentials', variable: 'ENV_CREDENTIALS')]) {
                    sshagent(credentials: ['deepeet-ubuntu', 'udtk-ubuntu']) {
                        sh """
                            scp -o ProxyCommand="ssh -W %h:%p -p ${PROXMOX_SSH_PORT} \
                            ${PROXMOX_SERVER_ACCOUNT}@${PROXMOX_SERVER_URI}" \
                            -o StrictHostKeyChecking=no $ENV_CREDENTIALS ${UDTK_SERVER_ACCOUNT}@${UDTK_SERVER_IP}:~/udtk-web-credentials
                        """

                        sh """
                            ssh -o ProxyCommand="ssh -W %h:%p -p ${PROXMOX_SSH_PORT} \
                            ${PROXMOX_SERVER_ACCOUNT}@${PROXMOX_SERVER_URI}" \
                            -o StrictHostKeyChecking=no ${UDTK_SERVER_ACCOUNT}@${UDTK_SERVER_IP} \
                        '
                        docker run -i -e TZ=Asia/Seoul --env-file ~/udtk-web-credentials \\
                        --name ${params.IMAGE_NAME} --network ${params.DOCKER_NETWORK} \\
                        -p ${env.SERVER_PORT}:${env.SERVER_PORT} \\
                        --restart unless-stopped \\
                        -d ${DOCKER_REPOSITORY}:latest

                        rm -f ~/udtk-web-credentials
                        '
                        """
                    }
                }
            }
        }

        stage('service test & alert send') {
            steps {
                sh """
                    #!/bin/bash

                    for retry_count in \$(seq 20)
                    do
                        if curl -s "${env.DEPLOY_URL}" > /dev/null
                        then
                            echo "Build Success!"
                            exit 0
                        fi

                        if [ \$retry_count -eq 20 ]
                        then
                            exit 1
                        fi

                        echo "The server is not alive yet. Retry health check in 5 seconds..."
                        sleep 5
                    done
                """
            }
        }
    }
}

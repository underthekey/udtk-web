pipeline {
    agent any

    environment {
        DOCKER_REPOSITORY = 'underthekey/web'
        REGISTRY_CREDENTIAL = 'underthekey-docker-hub'
        dockerImage = ''
    }

    parameters {
        string(name: 'DOCKER_NETWORK', defaultValue: 'proxy-network', description: 'docker network name')
        choice(name: 'ENV_TYPE', choices: ['dev', 'prod'], description: 'Choose the environment type')
    }

    stages {
        stage('environment setup') {
            steps {
                withCredentials([file(credentialsId: 'udtk-web-credentials', variable: 'ENV_CREDENTIALS')]) {
                    script {
                        def lines = readFile(file: ENV_CREDENTIALS).split('\n')
                        def envMap = [:]

                        lines.each { line ->
                            if (line && !line.startsWith('#')) {
                                def (key, value) = line.split('=')
                                envMap[key.trim()] = value.trim()
                            }
                        }
                        
                        env.BRANCH_NAME = params.ENV_TYPE == 'prod' ? 'main' : 'dev'
                        env.DEPLOY_URL = params.ENV_TYPE == 'prod'
                                ? 'https://underthekey.com'
                                : 'https://dev.underthekey.com'
                        env.SERVER_PORT = params.ENV_TYPE == 'prod'
                                ? envMap['PROD_SERVER_PORT']
                                : envMap['DEV_SERVER_PORT']
                        env.IMAGE_NAME = params.ENV_TYPE == 'prod' ? 'udtk-web' : 'udtk-web-dev'
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
                        cd ${WORKSPACE}
                        docker buildx build --platform linux/amd64 \
                        --build-arg SERVER_PORT=${env.SERVER_PORT} \
                        --cache-from type=registry,ref=${DOCKER_REPOSITORY}:buildcache \
                        --cache-to type=registry,ref=${DOCKER_REPOSITORY}:buildcache,mode=max \
                        -t ${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-${BUILD_NUMBER} \
                        -t ${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest \
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
                        docker ps -q --filter "ancestor=${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest" | xargs -r docker stop
                        docker ps -aq --filter "ancestor=${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest" | xargs -r docker rm -f
                        docker images ${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest -q | xargs -r docker rmi
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
                        -o StrictHostKeyChecking=no ${UDTK_SERVER_ACCOUNT}@${UDTK_SERVER_IP} 'docker pull ${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest'
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
                        --name ${env.IMAGE_NAME} --network ${params.DOCKER_NETWORK} \\
                        -p ${env.SERVER_PORT}:${env.SERVER_PORT} \\
                        --restart unless-stopped \\
                        -d ${DOCKER_REPOSITORY}:${env.IMAGE_NAME}-latest

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
                            curl -d '{"title":"${env.BRANCH_NAME} release:$BUILD_NUMBER","body":"deploy success"}' -H "Content-Type: application/json" -X POST ${PUSH_ALERT}
                            exit 0
                        fi

                        if [ \$retry_count -eq 20 ]
                        then
                            echo "Build Failed!"
                            curl -d '{"title":"${env.BRANCH_NAME} release:$BUILD_NUMBER","body":"deploy fail"}' -H "Content-Type: application/json" -X POST ${PUSH_ALERT}
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

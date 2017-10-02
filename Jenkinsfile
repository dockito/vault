pipeline {
  agent any
  parameters { string(name: 'TAG_NAME', defaultValue: 'latest', description: 'Tag name for the image that is going to be pushed') }
  stages {
      stage('Build') {
          steps {
              sh "docker build . -t auth0brokkr/vault:${params.TAG_NAME}" 
          }
      }

      stage('Push') {

        environment {
          DOCKER_USER = credentials('DOCKER_USER')
          DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
        }

        steps {
          sh "docker login -u $DOCKER_USER -p $DOCKER_PASSWORD"
          sh "docker push auth0brokkr/vault:${params.TAG_NAME}"
        }
      }
  }

  post {
    // Always runs. And it runs before any of the other post conditions.
    always {
      // Let's wipe out the workspace before we finish!
      deleteDir()
    }
  }

  // The options directive is for configuration that applies to the whole job.
  options {
    // For example, we'd like to make sure we only keep 5 builds at a time, so
    // we don't fill up our storage!
    buildDiscarder(logRotator(numToKeepStr:'5'))

    // And we'd really like to be sure that this build doesn't hang forever, so
    // let's time it out.
    timeout(time: 30, unit: 'MINUTES')
  }
}

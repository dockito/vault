FROM nginx

# Just to get the public fignerprint of our ssh key, we need ssh-keygen from openssh-client
RUN apt-get update && apt-get install -y openssh-client
ADD run-vault /usr/local/bin/run-vault

CMD run-vault

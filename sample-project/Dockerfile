# sample Docker image with ONVAULT installed
FROM ubuntu:14.04

# installs Dockito Vault ONVAULT utility
# https://github.com/dockito/vault
RUN apt-get update -y && \
    apt-get install -y curl && \
    curl -L https://raw.githubusercontent.com/dockito/vault/master/ONVAULT > /usr/local/bin/ONVAULT && \
    chmod +x /usr/local/bin/ONVAULT

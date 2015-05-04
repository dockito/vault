# Dockito Vault

A solution to use SSH keys while building images.

It is composed of two pieces:

- an HTTP server running at http://172.17.42.1:14242 that serves the private keys;
- a bash script `ONVAULT` that need to be installed in the image to allow accessing the private keys during the build process.

## The private keys server

Run the server setting a volume to your `~/.ssh` folder. NOTE: if you need to use a key other than ~/.ssh/id_rsa have
it in a folder named ~/.ssh/vault on the host. Also a custom ssh config can be smuggled in as ~/.ssh/vault/config if required.

```bash
docker run -p 172.17.42.1:14242:3000 -v ~/.ssh:/vault/.ssh dockito/vault
```

There is also a `docker-compose.yml` file in this project, allowing you to run it (by cloning the project) with:

```bash
docker-compose up vault
```

## The Dockerfile

During build, you can use the `ONVAULT` utility to run any command using the private keys.

**The private keys are removed automatically after the command completes**.

First you need to install the `ONVAULT` utility, by adding the following statements in your Dockerfile:

```Dockerfile
# installs Dockito Vault ONVAULT utility
# https://github.com/dockito/vault
RUN apt-get update -y && \
    apt-get install -y curl && \
    curl -L https://raw.githubusercontent.com/dockito/vault/master/ONVAULT > /usr/local/bin/ONVAULT && \
    chmod +x /usr/local/bin/ONVAULT
```

The script only dependency is `curl` (being installed above).

Then use it on any command that requires the private keys:

```Dockerfile
RUN ONVAULT npm install --unsafe-perm
```

Here is a complete Node.js example using these concepts:

```Dockerfile
FROM node:0.10.38

# installs Dockito Vault ONVAULT utility
# https://github.com/dockito/vault
RUN apt-get update -y && \
    apt-get install -y curl && \
    curl -L https://raw.githubusercontent.com/dockito/vault/master/ONVAULT > /usr/local/bin/ONVAULT && \
    chmod +x /usr/local/bin/ONVAULT

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN ONVAULT npm install --unsafe-perm
COPY . /usr/src/app

CMD [ "npm", "start" ]
```

Happy codding!

## Drawbacks

A Dockerfile using this technique requires the special **vault service** running. Meaning it is not possible to run any build process at the [Docker Hub](https://hub.docker.com/).

## Acknowledgements

Initial implementation by [Paulo Ragonha](http://github.com/pirelenito). Based on the ideas of [Max Claus Nunes](http://github.com/maxcnunes/) and [Eduardo Nunes](https://github.com/esnunes).

# Dockito Vault

A solution to use SSH keys while building images.

Here is an example installing [Node.js](http://nodejs.org/) dependencies:

```Dockerfile
RUN ONVAULT npm install
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

The script's only dependency is `curl` (being installed above).

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

## How it works

It is composed of two pieces:

- an HTTP server running at http://172.17.0.1:14242 that serves the private keys;
- a bash script `ONVAULT` that need to be installed in the image to allow accessing the private keys during the build process.

> The server IP may be different depending in the docker version your are running or if you are using a custom bridge network for docker. Execute this command below to find out the ip used by docker:

```bash
ifconfig docker0 | grep 'inet ' | cut -d: -f2 | awk '{ print $2}'
```

### Custom configurations

#### Environment variables

Some custom configurations are allowed through environment variables

- `VAULT_HOST`: custom host for the vault server (example `172.17.0.1`)
- `VAULT_PORT`: custom host+port for the vault server (example `tcp:172.17.0.1:14242`)
- `VAULT_URI`: custom URI for the vault server (example `http://172.17.0.1:14242`)
- `VAULT_SSH_KEY`: custom ssh key name used during `ONVAULT` command (example `id_rsa`)

#### SSH config file

Other ssh configurations can be achieved through your own [ssh config file](http://www.openbsd.org/cgi-bin/man.cgi/OpenBSD-current/man5/ssh_config.5?query=ssh_config&sec=5). Since the vault has access to the whole `.ssh` directory the ssh config file is available when running the `ONVAULT` command. Which means any configuration in the ssh config file will be applied to the ssh connection.

An example where you could use the ssh config file is when you need use different private keys for different hosts.

**~/.ssh/config**

```
# use this key for github host
Host github.com
IdentityFile ~/.ssh/github_docker_key

# or use this key for my myprivatehost.com
Host myprivatehost.com
IdentityFile ~/.ssh/myprivatehost_key

# otherwise will use the id_rsa key for any other host
```

#### Symlinks

In case you have symlink for any ssh file. Will be necessary map the volume of the symlink destination into the docker vault server. Otherwise will not be possible to resolve the symlink while copying the ssh files with the `ONVAULT` command.

### The private keys server

Run the server setting a volume to your `~/.ssh` folder:

```bash
docker run -p 172.17.0.1:14242:3000 -v ~/.ssh:/vault/.ssh dockito/vault
```

> This ip may be different. Check out the "How it works" session to find out the right ip in case this one is not working for you.

There is also a `docker-compose.yml` file in this project, allowing you to run it (by cloning the project) with:

```bash
docker-compose up vault
```

Happy codding!

## Usage in runtime

Although its main purpose is to fix the issue of building Docker images, it can also be used as a source of secrets for some running container:


```bash
docker run -v ~/.ssh:/vault/.ssh --name vault dockito/vault
docker run --link vault image-with-onvault ONVAULT npm install --unsafe-perm
```

## Development

Because [NPM](http://npmjs.com/) dependencies are installed locally, the dependencies installed in the base-image won't be available in development time, so you will need to `npm install` them again:

```
git clone https://github.com/dockito/vault.git
cd vault
docker-compose run vault npm install
docker-compose up vault
```

## Drawbacks

A Dockerfile using this technique requires the special **vault service** running. Meaning it is not possible to run any build process at the [Docker Hub](https://hub.docker.com/).

## Acknowledgements

Initial implementation by [Paulo Ragonha](http://github.com/pirelenito). Based on the ideas of [Max Claus Nunes](http://github.com/maxcnunes/) and [Eduardo Nunes](https://github.com/esnunes).

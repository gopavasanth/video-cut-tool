An online tool to cut/trim videos in Wikimedia commons.

See live demo at: https://videocuttool.wmflabs.org/

## Learn More

You can learn more in the https://commons.wikimedia.org/wiki/Commons:VideoCutTool.

## Installation

### Get OAuth2 Credentials

Go to:

https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose.

Create an application with the following grants:

- Edit existing pages.

- Create, edit, and move pages.

- Upload new files.

- Upload, replace, and move files.

Add the keys to server/config.js file under CLIENT_ID and CLIENT_SERCRET after you clone the repo.

### Install Docker

The tool uses docker to install and run everything with a single command.

Install docker from this link: https://docs.docker.com/get-docker/

### Clone Repo

Run these commands to clone the code from the remote repo.

```

git clone "https://gerrit.wikimedia.org/r/labs/tools/VideoCutTool"

cd ./VideoCutTool

```

### Run environment

Run this command inside VideoCutTool to start development docker container.

`docker-compose -f .\docker-compose.dev.yml up --build`

The first time you run it will take some time 4-8 minutes (depending on your internet speed) because it will pull the necessary images from docker and install NPM packages. Once it is up and running changes will be hot loaded.

> Note: anytime you update package.json the build process will take a while.

To run production you can run this command

`docker-compose -f .\docker-compose.prd.yml up -d`

## Credits

VideoCutTool is created and mostly written by Gopa Vasanth.

This tool is built in the 2019 Google Summer of Code in the mentorship of Pratik shetty, Hassan Amin and James Heilman.

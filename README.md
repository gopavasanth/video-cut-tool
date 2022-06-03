An online tool to cut/trim videos in Wikimedia commons.

See live demo at: https://videocuttool.wmcloud.org/

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

If its for production, use call back URL as: https://videocuttool.wmcloud.org/api/auth/mediawiki/callback

Add the keys to server/config.js file under CLIENT_ID and CLIENT_SERCRET after you clone the repo.

### Connecting to Cloud VPS Servers

Cloud VPS Horizon URL: https://horizon.wikimedia.org

videocuttool instance using `ssh -J <username>@primary.bastion.wmflabs.org <username>@videocuttool.videocuttool.eqiad1.wikimedia.cloud`

nc-videocuttool instance using `ssh -J <username>@primary.bastion.wmflabs.org <username>@nc-videocuttool.videocuttool.eqiad1.wikimedia.cloud`

### Installing VideoCutTool in server

Install the following utilities

- git
- node version v16.15.1
- npm version v8.12.1
- ffmpeg
- mongodb
- nginx

### Database

- View the users list using the following commands
  - Connect to mongo using shell - `mongo`
  - `show databases`
  - `use video-cut-tool`
  - `db.users.find({}, {"_id":0, username : 1})`

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

VideoCutTool is created by Gopa Vasanth as a part of 2019 Google Summer of Code in the mentorship of Pratik shetty, Hassan Amin and James Heilman.

Khr2003 joined as a co-maintainer of the tool and revamped code base.

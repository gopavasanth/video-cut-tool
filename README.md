An online tool to cut/trim videos in wikimedia commons.
Tool live at: https://videocuttool.wmflabs.org/

## Learn More

You can learn more in the https://commons.wikimedia.org/wiki/Commons:VideoCutTool.

## Installation

### Install front-end
```
git clone "https://gerrit.wikimedia.org/r/labs/tools/VideoCutTool"   # clone front-end
cd ./VideoCutTool                                                    # move to front-end directory
npm install                                                          # install node dependencies
google-chrome http://localhost:3000                                  # open in web-browser with hot-reload & console messages
```

### Execute VideoCutTool locally

VideoCutTool runs in development mode by default - to run VideoCutTool in a production environment, 
you need to set the NODE_ENV environment variable to `production`. You can do that with the command 
`export NODE_ENV=production`

In the project directory, you need to use the following command to run the application.

### Install back-end (Connect with the tool's back-end)
```
git clone "https://gerrit.wikimedia.org/r/labs/tools/video-cut-tool-back-end"     # clone back-end
cd ./video-cut-tool-back-end         # move to back-end directory
npm install                          # install node dependencies
```

To run the back-end tool you need to request Mediawiki OAuth keys from 
`https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose.`

1. Dont forget to turn on these following items under Applicable grants:

	1. Edit existing pages.
	2. Create, edit, and move pages.
	3. Upload new files.
	4. Upload, replace, and move files.

2. Call back URL as 'https://localhost:4000/video-cut-tool-back-end/auth/mediawiki/callback'
	
After submitting form, you will be given `config.consumer_key` and `config.consumer_secret` substitue these keys in your `config.js` file.

You are also required to install and start MongoDB, Follow official documentation for the installation and starting service locally https://docs.mongodb.com/manual/installation/

```
npm start                            # service back-end service, runs app in development mode.
google-chrome http://localhost:4000  # open app in web-browser with hot-reload & console messages
```

### Connect with the service worker

```
git clone "https://gerrit.wikimedia.org/r/labs/tools/video-cut-tool-worker"    # clone worker
cd ./video-cut-tool-worker                                                     # move to worker directory
npm install                                                                    # install node dependencies
npm i -g nodemon                                                               # installs nodemon globally
```

You will also need to install and configure Redis. For the installation you can follow
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04

```
node index.js                       # runs app in the development mode, has hot-reload and console logs
``` 

## Credits

VideoCutTool is created and mostly written by Gopa Vasanth.

This tool is built in the 2019 Google Summer of Code in the mentorship of Pratik shetty, Hassan Amin and James Heilman.

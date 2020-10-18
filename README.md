### About

An online tool to cut/trim videos in wikimedia commons.
Tool live at: https://videocuttool.wmflabs.org/

## Learn More

You can learn more in the https://commons.wikimedia.org/wiki/Commons:VideoCutTool.

## Installation

### Step - 1

You need to clone the front-end repository from the gerrit using
`git clone "https://gerrit.wikimedia.org/r/labs/tools/VideoCutTool"`

Install the required dependencies for this tool with
`npm install`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

### Execute VideoCutTool locally

VideoCutTool runs in development mode by default - to run VideoCutTool in a production environment, 
you need to set the NODE_ENV environment variable to `production`. You can do that with the command 
`export NODE_ENV=production`

In the project directory, you need to use the following command to run the application.

### Step - 2 (Connect with the tool's back-end)

Clone the back-end repository from here using
`git clone "https://gerrit.wikimedia.org/r/labs/tools/video-cut-tool-back-end"`

To run the back-end tool you need to request Mediawiki OAuth keys from 
`https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose.`

1. Dont forget to turn on these following items under Applicable grants:

	1. Edit existing pages.
	2. Create, edit, and move pages.
	3. Upload new files.
	4. Upload, replace, and move files.

2. Call back URL as 'https://localhost:4000/video-cut-tool-back-end/auth/mediawiki/callback'
	
After submitting form, you will be given config.consumer_key and config.consumer_secret substitue these keys in your `config.js` file.

In the project directory, you can run  `npm install` to install all the required dependencies for 
VideoCutTool

You are also required to install and start MongoDB, Follow official documentation for the installation 
and starting service locally https://docs.mongodb.com/manual/installation/

Now start the service using `npm start`

This runs the app in the development mode.

Open [http://localhost:4000](http://localhost:4000) to view it in the browser.
The page will reload if you make edits. You will also see any lint errors in the console.

### Step - 3 (Connect with the service worker) 

Clone the repository using

`git clone "https://gerrit.wikimedia.org/r/labs/tools/video-cut-tool-worker"`

In the project directory, you can run: `npm install` this installs the required dependencies for 
the tool's service 

`npm i -g nodemon`

Installs  nodemon globally

You will also need to install and configure Redis. For the installation you can follow
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04

`node index.js`

Runs the app in the development mode. You will also see any lint errors in the console.

## Credits

VideoCutTool is created and mostly written by Gopa Vasanth.

This tool is built in the 2019 Google Summer of Code in the mentorship of
Pratik shetty, Hassan Amin and James Heilman.

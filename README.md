### About

This is a VideoCutTool, An online tool to cut/trim videos in wikimedia commons.

## Learn More

You can learn more in the https://commons.wikimedia.org/wiki/Commons:VideoCutTool.

## Installation

### `npm install`

Installs the required dependencies for this tool

In the project directory, you can run:

### Run VideoCutTool locally

- Go to App.js https://github.com/gopavasanth/video-cut-tool/blob/master/src/App.js#L14
  and change this line to the following to run locally.
  `<Route exact path="/" component={home} />` 
  
- If your also using VideoCutTool back-end in your localsystem then change the var API_URL to "http://localhost:4000"
  here: https://github.com/gopavasanth/video-cut-tool/blob/master/src/components/home.js#L21 
  
### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


## Credits

VideoCutTool is created and mostly written by Gopa Vasanth.

This tool is built in the 2019 Google Summer of Code in the mentorship of
Pratik shetty, Hassan Amin and James Heilman.

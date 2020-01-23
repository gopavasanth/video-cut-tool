module.exports = function(){
    switch(process.env.NODE_ENV){
        case "production":
            return {
                path: "/video-cut-tool/",
                backend_url: "https://tools.wmflabs.org/video-cut-tool-back-end",
                socket_io_path: "/video-cut-tool-back-end/socket.io"
            }

        default:
            return {
                path: "/",
                backend_url: "http://localhost:4000",
                socket_io_path: "/video-cut-tool-back-end/socket.io"
            }
    }
}

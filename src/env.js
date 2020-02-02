module.exports = function(){
    switch(process.env.NODE_ENV){
        case "production":
            return {
                path: "/video-cut-tool/",
                home_page:"https://tools.wmflabs.org/video-cut-tool",
                not_found_path:"/",
                backend_url: "https://tools.wmflabs.org/video-cut-tool-back-end",
                socket_io_path: "/video-cut-tool-back-end/socket.io"
            }

        default:
            return {
                path: "/",
                home_page:"/",
                not_found_path:"/",
                backend_url: "http://localhost:4000",
                socket_io_path: "/video-cut-tool-back-end/socket.io"
            }
    }
}

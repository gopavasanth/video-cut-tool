module.exports = function(){
    switch(process.env.NODE_ENV){
        case "production":
            return {
                path: "/",
                home_page:"https://videocuttool.wmflabs.org",
                not_found_path:"/",
                backend_url: "https://videocuttool.wmflabs.org/video-cut-tool-back-end",
                socket_io_path: "/socket.io",
                socket_io_url: 'https://videocuttool.wmflabs.org'
            }

        default:
            return {
                path: "/",
                home_page:"/",
                not_found_path:"/",
                backend_url: "https://videocuttool.wmflabs.org/video-cut-tool-back-end",
                socket_io_path: "/socket.io",
                socket_io_url: 'https://videocuttool.wmflabs.org'
            }
    }
}

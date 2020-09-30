import React from "react";
import { Layout } from "antd";

const Footer = Layout.Footer;

class VideoCutToolFooter extends React.Component {
    render () {
        return <Footer style={{ textAlign: "center" }}>
        © 2019-20
            <a href="https://www.mediawiki.org/wiki/User:Gopavasanth">
          <span> Gopa Vasanth </span>
        </a>
        and <b>Hassan Amin</b> &hearts; |
            <a href="https://github.com/gopavasanth/video-cut-tool">
          <span> Github </span>
        </a>
        |
            <a href="https://creativecommons.org/licenses/by/4.0/">
          <span> CC BY SA 4.0 </span>
        </a>
      </Footer>;
    };
}

export default VideoCutToolFooter;
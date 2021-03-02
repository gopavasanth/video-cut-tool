import React from "react";
import { Layout } from "antd";
import { Message } from "@wikimedia/react.i18n";

const Footer = Layout.Footer;

class VideoCutToolFooter extends React.Component {
    render () {
      return <Footer style={{ textAlign: "center", marginTop: "auto" }}>
        © 2019-21&nbsp;
        <Message id="footer-authors" placeholders={[
          <a href="https://www.mediawiki.org/wiki/User:Gopavasanth">
            <span>Gopa Vasanth</span>
          </a>,
          <b>Hassan Amin</b>
        ]} />
        &nbsp;&hearts; |
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
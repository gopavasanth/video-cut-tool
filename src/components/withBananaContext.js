import React from 'react';
import { BananaContext } from '@wikimedia/react.i18n';

const withBananaContext = (Component) => {
  return props => {
    return (
      <BananaContext.Consumer>
        {banana => {
          return <Component {...props} banana={banana}  />
        }}
      </BananaContext.Consumer>
    );
  };
}

export default withBananaContext;

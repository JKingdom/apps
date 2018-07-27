// Copyright 2017-2018 @polkadot/app-settings authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps as Props } from '@polkadot/ui-app/types';
import React from 'react';
import Input from '@polkadot/ui-app/Input';
import classes from '@polkadot/ui-app/util/classes';
import keyring from '@polkadot/ui-keyring/index';
import translate from './translate';

import InputEndpoint from '@polkadot/ui-app/InputEndpoint';

type State = {
  endpoint: string,
  endpoints: Array<string>,
  isError: boolean
};

const knownEndpoints = [
  'wss://poc-1.polkadot.io:9944',
  'ws://127.0.0.1:9944'
]

if (process.env.WS_URL)
    knownEndpoints.push(process.env.WS_URL)

class Endpoint extends React.PureComponent<Props, State> {
  state: State = {
    endpoint: process.env.WS_URL || knownEndpoints[0],
    endpoints: knownEndpoints,
    isError: false
  };

  render () {
    const { className, style } = this.props;

    return (
      <div
        className={classes('settings--Endpoint', className)}
        style={style}
      >
        {this.renderInput()}
      </div>
    );
  }

  renderInput () {
    const { t } = this.props;
    const { endpoint, endpoints, isError = true} = this.state;

    return (
      <div>
        <div className='ui--row'>
          <InputEndpoint
            className='full'
            defaultValues={endpoints}
            label={t('editor.select', {
              defaultValue: 'the endpoint (ws/wss) the UI should connect to'
            })}
            onChange={this.onChangeData}
            value={endpoint}
            isError={isError}
          />
        </div>
      </div>
    );
  }

  isEndpointValid = (endpoint: string): boolean => {
    console.log(endpoint);
    const regexp = /^wss?:\/\/([A-Z0-9\.-]{3,})(\.[A-Z]{3})?((\:)(\d{2,5}))?$/gmi

    return regexp.test(endpoint)
  }

  onChangeData = (endpoint: string): void => {
    const isValid = this.isEndpointValid(endpoint)
    this.setState({ endpoint, isError: !isValid });


    // if (isValid)
    //   keyring.saveEndpoint(endpoint);

    if (!isValid)
       alert('asdf')
  }
}

export default translate(Endpoint);

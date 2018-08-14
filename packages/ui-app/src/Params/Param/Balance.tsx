// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { Props as BareProps } from '../types';
import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-react-rx/types';

import isValidBalance from '../../util/isValidBalance';

import BN from 'bn.js';
import React from 'react';

import storage from '@polkadot/storage';
import Input from '../../Input';
import Bare from './Bare';

import withApi from '@polkadot/ui-react-rx/with/api';

import translate from '../../translate';

type Props = I18nProps & ApiProps & BareProps;

type AccountBalance = BN;

type State = {
  balance: AccountBalance,
  subscriptions: Array<any>
};

const ZERO = new BN(0);

class Balance extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = {
      balance: ZERO,
      subscriptions: []
    };
  }

  componentDidMount () {
    console.log('this.props Balance', this.props);
    // const account = '123';
    // this.setState({
    //   subscriptions: [
    //     this.subscribeAccountBalance(account)
    //   ]
    // });
  }

  subscribeAccountBalance (account: string) {
    const { api } = this.props;

    return api.state
      .getStorage(storage.staking.public.freeBalanceOf, account)
      .subscribe((balance: BN) => {
        console.log('new balance: ', balance);
        this.setState({ balance });
      });
  }

  componentWillUnmount () {
    const { subscriptions } = this.state;

    subscriptions.forEach((sub) => sub.unsubscribe());
  }

  render () {
    const { apiSupport, className, defaultValue: { value }, isDisabled, isError, label, style, withLabel } = this.props;
    const defaultValue = new BN((value as BN).toString(10) || '0').toString(10);

    return (
      <Bare
        className={className}
        style={style}
      >
        <Input
          className='large'
          defaultValue={defaultValue || '0'}
          isDisabled={isDisabled}
          isError={isError}
          label={label}
          maxLength={apiSupport === 'poc-1' ? 19 : 38}
          onChange={this.onChange}
          placeholder='<any number between 1 testnet DOT and the available testnet DOT balance minus 1>'
          type='text'
          withLabel={withLabel}
        />
      </Bare>
    );
  }

  onChange = (value: string): void => {
    const { onChange, apiSupport } = this.props;

    const isValid = isValidBalance(value.trim(), apiSupport);

    onChange({
      isValid,
      value: new BN(value.trim() || '0')
    });
  }
}

export default withApi(translate(Balance));

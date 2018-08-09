// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { Button$Sizes } from '@polkadot/ui-app/Button/types';
import { BareProps, I18nProps, InputErrorMessage } from '@polkadot/ui-app/types';
import { KeyringPair$Json } from '@polkadot/util-keyring/types';

import React from 'react';
import translate from './translate';
import { Trans } from 'react-i18next';
import FileSaver from 'file-saver';
import keyring from '@polkadot/ui-keyring/index';
import IdentityIcon from '@polkadot/ui-react/IdentityIcon';
import isUndefined from '@polkadot/util/is/undefined';

import Button from '@polkadot/ui-app/Button';
import Modal from '@polkadot/ui-app/Modal';
import toShortAddress from '@polkadot/ui-app/util/toShortAddress';
import Unlock from '@polkadot/ui-signer/Unlock';

type State = {
  address: string,
  password: string,
  isPasswordModalOpen: boolean,
  error?: InputErrorMessage
};

type Props = I18nProps & BareProps & {
  icon?: string,
  isCircular?: boolean,
  isPrimary?: boolean,
  size?: Button$Sizes,
  address: string
};

class DownloadButton extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = this.emptyState();
  }

  handleDownloadAccount = (): void => {
    const { t } = this.props;
    const { address, password } = this.state;

    if (!address) {
      return;
    }

    // Reset password so it is not pre-populated on the form on subsequent uploads
    this.setState(
      { password: '' },
      () => {
        try {
          const json: KeyringPair$Json | void = keyring.backupAccount(address, password);

          if (!isUndefined(json)) {
            const blob = new Blob([JSON.stringify(json)], { type: 'text/plain;charset=utf-8' });

            FileSaver.saveAs(blob, `${address}.json`);

            this.hidePasswordModal();
          } else {
            this.setState({ error: { key: t('error'), value: t('Unable to obtain account from memory') } });
          }
        } catch (e) {
          this.setState({ error: { key: t('error'), value: t('Unable to save file') } });
          console.error('Error retrieving account from local storage and saving account to file: ', e);
        }
      }
    );
  }

  showPasswordModal = (): void => {
    this.setState({ isPasswordModalOpen: true });
  }

  hidePasswordModal = (): void => {
    this.setState({ isPasswordModalOpen: false });
  }

  render () {
    const { address, isPasswordModalOpen } = this.state;
    const { className, icon = 'download', isCircular = true, isPrimary = true, size = 'tiny', style } = this.props;

    if (!address) {
      return null;
    }

    const shortValue = toShortAddress(address);

    return (
      <div className={'accounts--Address-download'}>
        { isPasswordModalOpen ? (
            <Modal
              dimmer='inverted'
              open={isPasswordModalOpen}
              onClose={this.hidePasswordModal}
              size={'mini'}
            >
              <Modal.Content>
                <div className='ui--grid'>
                  <div className={'accounts--Address-modal'}>
                    <IdentityIcon
                      className='accounts--Address-modal-icon'
                      size={48}
                      value={address}
                    />
                    <div className='accounts--Address-modal-data'>
                      <div className='accounts--Address-modal-address'>
                        {shortValue}
                      </div>
                    </div>
                    <div className='expanded'>
                      <p>
                        <Trans i18nKey='unlock.info'>
                          Please enter password for account <span className='code'>{shortValue}</span> to unlock and download a decrypted backup.
                        </Trans>
                      </p>
                    </div>
                    {this.renderContent()}
                  </div>
                  {this.renderButtons()}
                </div>
              </Modal.Content>
            </Modal>
          ) : null
        }
        <Button
          className={className}
          icon={icon}
          isCircular={isCircular}
          isPrimary={isPrimary}
          onClick={this.showPasswordModal}
          size={size}
          style={style}
        />
      </div>
    );
  }

  renderContent () {
    const { address } = this.state;

    if (!address) {
      return null;
    }

    return (
      <div>
        { this.renderUnlock() }
      </div>
    );
  }

  renderUnlock () {
    const { t } = this.props;
    const { address, password, error } = this.state;

    if (!address) {
      return null;
    }

    const keyringAddress = keyring.getAddress(address);
    let translateError: InputErrorMessage | undefined = undefined;

    if (error && error.key && error.value) {
      translateError = {
        key: t(error.key),
        value: t(error.value)
      };
    }

    return (
      <Unlock
        autoFocus={true}
        error={translateError || undefined}
        onChange={this.onChangePassword}
        password={password}
        passwordWidth={'full'}
        value={keyringAddress.publicKey()}
      />
    );
  }

  renderButtons () {
    const { t } = this.props;

    return (
      <Modal.Actions>
        <Button.Group>
          <Button
            isNegative
            onClick={this.onDiscard}
            text={t('creator.discard', {
              defaultValue: 'Cancel'
            })}
          />
          <Button.Or />
          <Button
            isDisabled={false}
            isPrimary
            onClick={this.handleDownloadAccount}
            text={t('creator.submit', {
              defaultValue: 'Submit'
            })}
          />
        </Button.Group>
      </Modal.Actions>
    );
  }

  emptyState (): State {
    const { address } = this.props;

    return {
      address: address,
      password: '',
      isPasswordModalOpen: false,
      error: undefined
    };
  }

  onChangePassword = (password: string): void => {
    this.setState({
      password,
      error: undefined
    });
  }

  onDiscard = (): void => {
    this.setState(this.emptyState());
  }
}

export default translate(DownloadButton);

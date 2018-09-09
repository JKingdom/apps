// Copyright 2017-2018 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import './index.css';

import React from 'react';
import Tabs from '@polkadot/ui-app/Tabs';

import Creator from './Creator';
import Editor from './Editor';
import translate from './translate';

type Props = I18nProps & {
  basePath: string
};

type Actions = 'create' | 'edit';

type State = {
  action: Actions
};

// FIXME React-router would probably be the best route, not home-grown
const Components: { [index: string]: React.ComponentType<any> } = {
  'create': Creator,
  'edit': Editor
};

class AccountsApp extends React.PureComponent<Props, State> {
  state: State = { action: 'edit' };

  render () {
    const { t } = this.props;
    const { action } = this.state;
    const Component = Components[action];
    const items = [
      {
        name: 'edit',
        text: t('app.edit', { defaultValue: 'Edit account' })
      },
      {
        name: 'create',
        text: t('app.create', { defaultValue: 'Create account' })
      }
    ];

    return (
      <main className='accounts--App'>
        <header>
          <Tabs
            activeItem={action}
            items={items}
            onChange={this.onMenuChange}
          />
        </header>
        <Component onBack={this.selectEdit} />
      </main>
    );
  }

  onMenuChange = (action: Actions) => {
    this.setState({ action });
  }

  selectEdit = (): void => {
    this.setState({ action: 'edit' });
  }
}

export default translate(AccountsApp);

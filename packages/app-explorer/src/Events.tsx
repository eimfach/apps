// Copyright 2017-2018 @polkadot/app-explorer authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

// Copyright 2017-2018 @polkadot/app-explorer authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import React from 'react';
import { Event, EventRecord } from '@polkadot/types';
import { Event as EventDisplay } from '@polkadot/ui-app/index';
import withObservable from '@polkadot/ui-react-rx/with/observable';
import withMulti from '@polkadot/ui-react-rx/with/multi';
import { stringToU8a } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

import { MAX_ITEMS } from './BlockHeaders';
import translate from './translate';

type Props = I18nProps & {
  systemEvents?: Array<EventRecord>
};

type State = {
  prevEventHash: string;
  recentEvents: Array<Event>;
};

class Events extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      prevEventHash: '',
      recentEvents: []
    };
  }

  static getDerivedStateFromProps ({ systemEvents = [] }: Props, prevState: State): State | null {
    const prevEventHash = blake2AsHex(stringToU8a(JSON.stringify(systemEvents)));

    if (prevEventHash === prevState.prevEventHash) {
      return null;
    }

    const recentEvents = systemEvents
      .filter(({ event }) =>
        event.section !== 'system'
      )
      .map(({ event }) =>
        event
      )
      .concat(prevState.recentEvents)
      .filter((_, index) =>
        index < MAX_ITEMS
      );

    return {
      prevEventHash,
      recentEvents
    };
  }

  render () {
    const { t } = this.props;
    const { recentEvents } = this.state;

    if (recentEvents.length === 0) {
      return (
        <div>{t('events.none', {
          defaultValue: 'no non-internal events available'
        })}</div>
      );
    }

    return (
      recentEvents.map(this.renderEvent)
    );
  }

  private renderEvent = (event: Event, index: number) => {
    return (
      <article
        className='explorer--Container'
        key={index}
      >
        <div className='header'>
          <div className='name'>
            {event.section}.{event.method}
          </div>
          <div className='description'>
            {
              event.meta.documentation && event.meta.documentation.length
                ? event.meta.documentation.map((doc) => doc.toString()).join(' ')
                : ''
            }
          </div>
        </div>
        <EventDisplay value={event} />
      </article>
    );
  }
}

export default withMulti(
  translate(Events),
  withObservable('systemEvents')
);
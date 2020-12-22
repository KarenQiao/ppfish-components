import React from 'react';
import { Consumer } from './Context';
import LocaleList from '../../Locale/index';

export default function LocaleConsumer({ componentName, children }) {
  return <Consumer>
    {
      (value) => {
        const { Locale } = value;
        const ComponentLocal = LocaleList[Locale] && LocaleList[Locale][componentName]
        // console.log(Locale, ComponentLocal);
        return children(ComponentLocal || {});
      }
    }
  </Consumer>
}
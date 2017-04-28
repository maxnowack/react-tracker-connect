import React, { PureComponent } from 'react';
import reactiveObject, { isSupported } from 'meteor-reactive-object';
import Tracker from './tracker';

const proxiesSupported = isSupported();

export default (reactiveFn, options) => Comp => class Connector extends PureComponent {
  constructor(props) {
    super();
    this.state = {};
    // IE11 support
    this.reactiveProps = proxiesSupported
      ? reactiveObject(Object.assign({}, props), options)
      : props;
  }
  componentWillMount() {
    this.computation = Tracker.nonreactive(() => Tracker.autorun(() => this.updateProps()));
  }
  componentWillReceiveProps(props) {
    // IE11 support
    if (!proxiesSupported) {
      this.updateProps(props);
      return;
    }

    Tracker.nonreactive(() => {
      Object.keys(props).forEach((key) => {
        if (this.reactiveProps[key] === props[key]) return;
        this.reactiveProps[key] = props[key];
      });
      Object.keys(this.props).filter(key => !(key in props)).forEach((key) => {
        delete this.reactiveProps[key];
      });
    });
    if (!Tracker.active) {
      try {
        Tracker.flush();
      } catch (err) {
        console.warn(err);
      }
    }
  }
  componentWillUnmount() {
    this.computation.stop();
  }
  updateProps(props) {
    this.setState({
      props: reactiveFn(proxiesSupported ? this.reactiveProps : (props || this.props)),
    });
  }
  render() {
    return <Comp {...this.props} {...this.state.props} />;
  }
};

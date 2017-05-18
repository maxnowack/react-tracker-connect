import React, { PureComponent } from 'react';
import pick from 'lodash.pick';
import reactiveObject, { isSupported } from 'meteor-reactive-object';
import Tracker from './tracker';

const proxiesSupported = isSupported();

export default (reactiveFn, opts) => Comp => class Connector extends PureComponent {
  constructor(props) {
    super();
    this.state = {};

    const options = typeof opts === 'function' ? { compare: opts } : opts || {};
    const { allowedProps, ...reactiveObjectOptions } = options;
    this.allowedProps = allowedProps;

    const clonedProps = Object.assign({}, props);
    const initialProps = this.allowedProps
      ? pick(clonedProps, this.allowedProps)
      : clonedProps;

    // IE11 support
    this.reactiveProps = proxiesSupported
      ? reactiveObject(initialProps, reactiveObjectOptions)
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

    const inCompute = !!Tracker.currentComputation;
    Tracker.nonreactive(() => {
      Object.keys(props).forEach((key) => {
        if (!this.isPropReactive(key)) return;
        if (this.reactiveProps[key] === props[key]) return;
        this.reactiveProps[key] = props[key];
      });
      Object.keys(this.props).forEach((key) => {
        if (key in props) return;
        if (!this.isPropReactive(key)) return;
        delete this.reactiveProps[key];
      });
      const isInFlush = Tracker.inFlush ? Tracker.inFlush() : Tracker.active;
      if (!isInFlush && !inCompute) {
        try {
          Tracker.flush();
        } catch (err) {
          console.warn(err);
        }
      }
    });
  }
  componentWillUnmount() {
    this.computation.stop();
  }
  isPropReactive(key) {
    if (!this.allowedProps) return true;
    return this.allowedProps.includes(key);
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

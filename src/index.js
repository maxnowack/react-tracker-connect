import React, { PureComponent } from 'react';
import Tracker from './tracker';
import reactiveObject from './reactiveObject';

export default (reactiveFn, compareProp) => Comp => class Connector extends PureComponent {
  constructor(props) {
    super();
    this.state = {};
    this.reactiveProps = reactiveObject(Object.assign({}, props), compareProp);
  }
  componentWillMount() {
    this.computation = Tracker.nonreactive(() => Tracker.autorun(() => this.updateProps()));
  }
  componentWillReceiveProps(props) {
    // IE11 support
    if (typeof Proxy === 'undefined') {
      this.updateProps();
      return;
    }

    Object.keys(props).forEach((key) => {
      if (this.reactiveProps[key] === props[key]) return;
      this.reactiveProps[key] = props[key];
    });
    Object.keys(this.props).filter(key => !(key in props)).forEach((key) => {
      delete this.reactiveProps[key];
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
  updateProps() {
    this.setState({ props: reactiveFn(this.reactiveProps) });
  }
  render() {
    return <Comp {...this.props} {...this.state.props} />;
  }
};

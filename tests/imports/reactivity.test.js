/* global describe it */
import React, { Component } from 'react';
import { mount } from 'enzyme';
import connect from 'react-tracker-connect';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { chai } from 'meteor/practicalmeteor:chai';

if (Meteor.isClient) {
  // client side tests
  describe('Reactivity', () => {
    it('should rerender if reactive dep change', () => {
      const reactive = new ReactiveVar('aaa');

      @connect(() => ({ reactive: reactive.get() }))
      class Foo extends Component {
        constructor() {
          super();
          this.renderCount = 0;
        }
        render() {
          this.renderCount += 1;
          return (
            <div>
              <div className="renderCount">{ this.renderCount }</div>
              <div className="props">{ JSON.stringify(this.props || {}) }</div>
            </div>
          );
        }
      }

      let props;
      const item = mount(<Foo test />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.reactive, 'aaa');

      reactive.set('bbb');
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.reactive, 'bbb');

      chai.assert.equal(reactive._numListeners(), 1);
      item.unmount();
      chai.assert.equal(reactive._numListeners(), 0);
    });
    it('should not rerun on unmount', () => {
      const reactive = new ReactiveVar('aaa');

      let runs = 0;
      @connect(() => {
        runs += 1;
        return { reactive: reactive.get() }
      })
      class Foo extends Component {
        constructor() {
          super();
          this.renderCount = 0;
        }
        render() {
          this.renderCount += 1;
          return (
            <div>
              <div className="renderCount">{ this.renderCount }</div>
              <div className="props">{ JSON.stringify(this.props || {}) }</div>
            </div>
          );
        }
      }

      const item = mount(<Foo test />);
      chai.assert.equal(runs, 1);

      reactive.set('bbb');
      Tracker.flush({ _throwFirstError: true });
      chai.assert.equal(runs, 2);

      chai.assert.equal(reactive._numListeners(), 1);
      item.unmount();
      chai.assert.equal(reactive._numListeners(), 0);
      chai.assert.equal(runs, 2);
    });
  });
} else {
  // server side tests
}

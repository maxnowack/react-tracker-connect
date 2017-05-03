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
  describe('Options', () => {
    it('not allowed props should be undefined', () => {
      const reactive = new ReactiveVar(1);
      let runs = 0;

      @connect(({ num, notAllowed }) => {
        runs += 1;
        return { value: reactive.get() * num, typeOfNotAllowed: typeof notAllowed };
      }, {
        allowedProps: ['num'],
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

      let props;
      const item = mount(<Foo num={10} notAllowed />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 10);
      chai.assert.equal(props.notAllowed, true);
      chai.assert.equal(props.typeOfNotAllowed, 'undefined');
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 1);
      chai.assert.equal(runs, 1);

      reactive.set(10);
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 100);
      chai.assert.equal(props.notAllowed, true);
      chai.assert.equal(props.typeOfNotAllowed, 'undefined');
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 2);
      chai.assert.equal(runs, 2);

      item.setProps({ notReactive: 2 });
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 100);
      chai.assert.equal(props.notReactive, 2);
      chai.assert.equal(props.notAllowed, true);
      chai.assert.equal(props.typeOfNotAllowed, 'undefined');
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 3);
      chai.assert.equal(runs, 2);

      item.unmount();
    });
  });
} else {
  // server side tests
}

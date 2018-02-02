/* global describe it */
import React, { Component } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import connect from 'react-tracker-connect';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { chai } from 'meteor/practicalmeteor:chai';

Enzyme.configure({ adapter: new Adapter() });

if (Meteor.isClient) {
  // client side tests
  describe('Render in Tracker.autorun', () => {
    it('should rerender if reactive dep change inside Tracker.autorun', () => {
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
      let item;
      Tracker.autorun(() => {
        item = mount(<Foo test />);
      });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.reactive, 'aaa');

      reactive.set('bbb');
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.reactive, 'bbb');

      item.unmount();
    });
  });
} else {
  // server side tests
}

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
  describe('Props', () => {
    it('should can access props', () => {
      const reactive = new ReactiveVar(1);

      @connect(({ num }) => ({ value: reactive.get() * num }))
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
      const item = mount(<Foo num={10} notUsed />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 10);
      chai.assert.equal(props.notUsed, true);

      reactive.set(10);
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 100);

      item.setProps({ num: 2 });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 20);

      item.unmount();
    });

    it('shouldn\'t rerender if prop changed that is not used in reactive context', () => {
      const reactive = new ReactiveVar(1);
      let runs = 0;

      @connect(({ num }) => {
        runs += 1;
        return { value: reactive.get() * num };
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
      const item = mount(<Foo num={10} notReactive={10} />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 10);
      chai.assert.equal(props.notReactive, 10);
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 1);
      chai.assert.equal(runs, 1);

      reactive.set(10);
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 100);
      chai.assert.equal(props.notReactive, 10);
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 2);
      chai.assert.equal(runs, 2);

      item.setProps({ notReactive: 2 });
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 100);
      chai.assert.equal(props.notReactive, 2);
      chai.assert.equal(parseInt(item.find('.renderCount').text(), 10), 3);
      chai.assert.equal(runs, 2);

      item.unmount();
    });
  });
} else {
  // server side tests
}

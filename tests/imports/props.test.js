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

    it('should be able to iterate over array', () => {
      const reactive = new ReactiveVar(1);

      @connect(({ arr }) => ({ value: arr.map(num => num * reactive.get()) }))
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
      const item = mount(<Foo arr={[1, 2, 3]} />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value.length, 3);

      item.setProps({ arr: [1, 2, 3, 4] });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value.length, 4);

      item.unmount();
    });

    it('should unset a prop', () => {
      const reactive = new ReactiveVar(0);

      @connect(() => {
        const value = reactive.get()
        if (!value) return { loading: true }
        return { value };
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
      const item = mount(<Foo />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.isUndefined(props.value);
      chai.assert.equal(props.loading, true);

      reactive.set(10);
      Tracker.flush({ _throwFirstError: true });
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.value, 10);
      chai.assert.isUndefined(props.loading);

      item.unmount();
    });
  });
} else {
  // server side tests
}

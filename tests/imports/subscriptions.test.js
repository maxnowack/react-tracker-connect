/* global describe it */
import React, { Component } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import connect from 'react-tracker-connect';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { chai } from 'meteor/practicalmeteor:chai';

Enzyme.configure({ adapter: new Adapter() });

if (Meteor.isClient) {
  // client side tests
  describe('Subscriptions', () => {
    it('should indicate the loading state of a subscription', (done) => {
      const collection = new Mongo.Collection('somecollection');

      @connect(({ num }) => ({
        loading: !Meteor.subscribe('publish-doc', num).ready(),
        docs: collection.find().fetch(),
      }))
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
      const item = mount(<Foo num={10} />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.loading, true);
      chai.assert.equal(props.docs && props.docs.length, 0);

      setTimeout(() => {
        props = JSON.parse(item.find('.props').text());
        chai.assert.equal(props.loading, false);
        chai.assert.equal(props.docs && props.docs.length, 1);

        item.unmount();
        done();
      }, 100);
    });

    it('should rerun a subscription', (done) => {
      const collection = new Mongo.Collection('someothercollection');

      @connect(({ num }) => ({
        loading: !Meteor.subscribe('publish-another-doc', num).ready(),
        docs: collection.find().fetch(),
      }))
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
      const item = mount(<Foo num={10} />);
      props = JSON.parse(item.find('.props').text());
      chai.assert.equal(props.loading, true);
      chai.assert.equal(props.docs && props.docs.length, 0);

      setTimeout(() => {
        props = JSON.parse(item.find('.props').text());
        chai.assert.equal(props.loading, false);
        chai.assert.equal(props.docs && props.docs.length, 1);

        item.setProps({ num: 20 });
        props = JSON.parse(item.find('.props').text());
        chai.assert.equal(props.loading, true);
        chai.assert.equal(props.docs && props.docs.length, 1);

        setTimeout(() => {
          props = JSON.parse(item.find('.props').text());
          chai.assert.equal(props.loading, false);
          chai.assert.equal(props.docs && props.docs.length, 1);
          chai.assert.equal(props.docs[0]._id, 'id20');

          item.unmount();
          done();
        }, 100);
      }, 100);
    });
  });
} else {
  // server side tests
  Meteor.publish('publish-doc', function publish(num) {
    Meteor.defer(() => {  // because subs are blocking
      this.added('somecollection', `id${num}`, {});
      this.ready();
    });
  });
  Meteor.publish('publish-another-doc', function publish(num) {
    Meteor.defer(() => {  // because subs are blocking
      this.added('someothercollection', `id${num}`, {});
      this.ready();
    });
  });
}

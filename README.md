# react-tracker-connect [![Build Status](https://travis-ci.org/maxnowack/react-tracker-connect.svg?branch=master)](https://travis-ci.org/maxnowack/react-tracker-connect)
Performant way to connect reactive data from meteor with react components (see [#13](https://github.com/maxnowack/react-tracker-connect/issues/13))

## Installation
````bash
  $ npm install --save react-tracker-connect
````

## Usage

````js
import React, { Component } from 'react'
import connect from 'react-tracker-connect'
import { ReactiveVar } from 'meteor/reactive-var'

const reactiveVar = new ReactiveVar()

// with component classes
@connect((props) => ({
  reactive: reactiveVar.get(),
}))
export default class Foo extends Component {
  constructor() {
    super()
    this.state = {}
    // …
  }
  render() {
    const { reactive } = this.props
    return (
      // …
    )
  }
}


// with stateless components
function Stateless({ reactive }) {
  return (
    // …
  )
}
export default connect((props) => ({
  reactive: reactiveVar.get(),
}))(Stateless)
````

### Options
The `connect` decorator takes 2 arguments. The first argument is a function which gets called with the current props object as the first parameter. This function runs reactive, the return value will be merged with the current props and passed to your component.
You can pass `options` via the second argument and the following signature:
````js
{
  // Optional. A function of two arguments, called on the old value and the new value whenever a prop was updated.
  compare: (a, b) => a === b,

  // Optional. An array with the props which will be passed to the reactive function.
  // This option can be used to finetune, which props should be checked if they've changed.
  allowedProps: ['reactive'],

  // Optional, Base component which will be extended.
  // Defaults to PureComponent
  BaseComponent: React.Component,
}
````

## License
Licensed under MIT license. Copyright (c) 2017 Max Nowack

## Contributions
Contributions are welcome. Please open issues and/or file Pull Requests.

## Maintainers
- Max Nowack ([maxnowack](https://github.com/maxnowack))

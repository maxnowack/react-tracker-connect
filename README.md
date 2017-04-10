# react-tracker-connect [![Build Status](https://travis-ci.org/maxnowack/react-tracker-connect.svg?branch=master)](https://travis-ci.org/maxnowack/react-tracker-connect)
Performant way to connect reactive data from meteor with react components

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


## License
Licensed under MIT license. Copyright (c) 2017 Max Nowack

## Contributions
Contributions are welcome. Please open issues and/or file Pull Requests.

## Maintainers
- Max Nowack ([maxnowack](https://github.com/maxnowack))

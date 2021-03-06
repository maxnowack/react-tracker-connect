## vNEXT

## v1.2.0 2019-04-29
* allow overriding BaseComponent
* update dependencies

## v1.1.5 2018-03-27
* hoist statics

## v1.1.4 2017-06-06
* update dependencies

## v1.1.3 2017-05-18
* check computing state before flushing

## v1.1.2 2017-05-18
* flush inside Tracker.nonreactive

## v1.1.1 2017-05-04
* better checking if flush is active in meteor 1.4.4.2

## v1.1.0, 2017-05-03
* implement option `allowedProps`, to finetune prop checking in reactive object.

## v1.0.5, 2017-04-28
* enable passing props to reactive-object

## v1.0.4, 2017-04-28
* update `meteor-reactive-object` to fix iterating over arrays

## v1.0.3, 2017-04-11
* wrap updating reactive props with `Tracker.nonreactive` to prevent unnecessary depending on dependencies while checking if the value has changed.

## v1.0.2, 2017-04-11
* update dependencies.

## v1.0.1, 2017-04-10
* move out reactive-object into [own package](https://github.com/maxnowack/meteor-reactive-object).
* setup automated testing.

## v1.0.0, 2017-04-10
* initial release.

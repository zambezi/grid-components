## Run header components

This grid component will run column components on each column header item.
These columns are configurable per column so each column can optionally define their own.

To use the column header component, 

1. Add it to the grid's component stack by using its `use` method.
2. For each of the columns that need column header components, define a `headerComponents` array with the embedded components.  

  The signature of this components is `each(d, i)` where 
    1. `d` is the column configuration, and
    2. The `this` keyword points to the DOM node of the header item.

See and run the included [example](../examples/run-header-components.html) to see it running.

NOTE: the component will try to minimize the amount of times the header components are run.
By default it will run it only when the column has changed, meaning:
* the column position or width have changed.
* the column sort has changed.
* the column has nested children and one of them has changed.

You can modify this criteria by specifying a function that you can set using the `key` getter setter.
You can completely disable this optimization by passing a `null` to that `key` getter/setter; the components will then be run every time the grid updates (even on scroll, etc.)


## Custom popovers

You can create and populate your custom popovers using the `popover` component.
This component can be run using `selection.each` which makes it also usable as an event handler on selection events.

The `popover` dispatches two events, `open` and `close`.
Your handlers will be called with the datum as its argument; the `this` keyword will point to the popover content DOM element.

You can, therefore, use the `open` event to setup the popover contents and you can use the `close` event to cleanup before the popover is destroyed.


The popover is automatically closed when the user clicks outside of it or when the user scrolls the containing grid.
But you can also close it programmatically by dispatching a `popover-close` event on the popover DOM element.



```javascript
const popover = createPopover() 
          .on('open', onPopoverOpen)
          .on('close', onPopoverClose)

d3.select(this)
  .select('.manual-popover-button')
    .on('click', popover)

function onPopoverOpen(d) {
  const target = d3.select(this)
            .classed('fancy-popover', true)

      , p = target.append('p')
            .text(`I am ${d.row.name}`)

      , x = target.append('i')
            .text('×')
            .on('click', onClickToClose)
            .style('cursor', 'pointer')
}

function onClickToClose() {
  d3.select(this).dispatch('popover-close', { bubbles: true })
}
```

For an example of this component being used with a column component button see the `cell-popover.html` example on the `examples` folder.

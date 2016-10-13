import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { select, selectAll, event } from 'd3-selection'
import { dispatch as createDispatch } from 'd3-dispatch'
import { uniqueId } from 'underscore'
import './cell-popover.css'

export function createCellPopover() {

  const dispatch = createDispatch('open', 'close')
  let lastCreated

  function cellPopover(d, i) {
    select(this)
      .select(appendIfMissing('button.custom-element'))
        .text('✓')
        .on('click.cell-popover', createPopover)
  }

  return rebind().from(dispatch, 'on')(cellPopover)

  function createPopover(d) {
    const clickCloseEventName = uniqueId('click.cell-popover-close-')
        , body = select(document.body)
        , button = event.target
        , { top, left, width, height } = button.getBoundingClientRect()
        , popover = select(document.body)
            .select(appendIfMissing('div.zambezi-cell-popover'))
              .html('')
              .style('top', `${Math.floor(top + height / 2)}px`)
              .style('left', `${left + width}px`)
              .classed('is-open', true)
        , gridRoot = select(this)
            .selectAll(upwards('.zambezi-grid'))
              .on('grid-scroll.cell-popover', close)

    lastCreated = clickCloseEventName

    dispatch.call('open', popover.node(), d)
    select('.info-box pre').text(`Created popover for ${d.row.name}`)
    body.on(clickCloseEventName, onClickClose)

    function onClickClose() {
      const target = event.target
      if (popover.node().contains(target)) return
      if (button.contains(target)) return
      event.stopPropagation()
      body.on(clickCloseEventName, null)
      if (lastCreated !== clickCloseEventName) return
      close()
    }

    function close() {
      gridRoot.on('grid-scroll.cell-popover', null)
      body.on(clickCloseEventName, null)
      popover.remove()
      dispatch.call('close', popover.node())
    }
  }
}

function upwards(selector) {
  function upwardsSelect(d, i) {
    if (!this.parentNode || this.parentNode === document.body) return null
    if (selectAll([this.parentNode]).filter(selector).empty()) {
      return upwardsSelect.apply(this.parentNode, [...arguments])
    }
    return [this.parentNode]
  }
  return upwardsSelect
}
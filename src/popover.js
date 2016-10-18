import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, selectAll, event } from 'd3-selection'
import { uniqueId } from 'underscore'

import './popover.css'
export function createPopover() {

  const dispatch = createDispatch('open', 'close')
  let lastCreated

  function popover(d, i) {

    const clickCloseEventName = uniqueId('click.cell-popover-close-')
        , body = select(document.body)
        , button = this
        , { top, left, width, height } = button.getBoundingClientRect()
        , popover = select(document.body)
            .select(appendIfMissing('div.zambezi-grid-popover'))
              .html('')
              .style('top', `${Math.floor(top + height / 2)}px`)
              .style('left', `${left + width}px`)
        , popoverContent = popover.append('div')
        , gridRoot = select(this)
            .selectAll(upwards('.zambezi-grid'))
              .on('grid-scroll.cell-popover', close)

    lastCreated = clickCloseEventName

    dispatch.call('open', popoverContent.node(), d)
    select('.info-box pre').text(`Created popover for ${d.row.name}`)
    body.on(clickCloseEventName, onClickOutside)

    function onClickOutside() {
      const target = event.target
      if (popover.node().contains(target)) return
      if (button.contains(target)) return
      event.stopPropagation()
      body.on(clickCloseEventName, null)
      if (lastCreated !== clickCloseEventName) {
        return dispatch.call('close', popoverContent.node())
      }
      close()
    }

    function close() {
      gridRoot.on('grid-scroll.cell-popover', null)
      body.on(clickCloseEventName, null)
      popover.remove()
      dispatch.call('close', popoverContent.node())
    }
  }

  return rebind().from(dispatch, 'on')(popover)
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

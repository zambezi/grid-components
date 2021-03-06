import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, selectAll, event } from 'd3-selection'
import { uniqueId } from 'underscore'

import './popover.css'
export function createPopover () {
  const dispatch = createDispatch('open', 'close')
  let lastCreated

  function popover (d, i) {
    const clickCloseEventName = uniqueId('click.cell-popover-close-')
    const body = select(document.body)
    const anchor = this

    const popover = body.select(appendIfMissing('div.zambezi-grid-popover'))
              .html('')

    const popoverContent = popover.append('div')
              .on('popover-close.cleanup', removeClickOutsideHandler)
              .on('popover-close.close', close)

    const gridRoot = select(this)
            .selectAll(upwards('.zambezi-grid'))
              .on('grid-scroll.cell-popover', close)

    lastCreated = clickCloseEventName
    body.on(clickCloseEventName, onClickOutside)
    dispatch.call('open', popoverContent.node(), d)

    popover.each(smartPosition)

    function removeClickOutsideHandler () {
      body.on(clickCloseEventName, null)
    }

    function smartPosition (d) {
      const target = select(this)
      const anchorRect = anchor.getBoundingClientRect()
      const popupRect = this.getBoundingClientRect()
      const bodyRect = document.body.getBoundingClientRect()

      const fitsRight = (anchorRect.left + anchorRect.width + popupRect.width) <= bodyRect.width
      const fitsBottom = (anchorRect.top + popupRect.height) <= bodyRect.height
      const left = fitsRight ? anchorRect.left + anchorRect.width : anchorRect.left - popupRect.width
      const top = fitsBottom ? anchorRect.top : (anchorRect.top + anchorRect.height) - popupRect.height

      target
          .style('left', `${Math.max(left, 0)}px`)
          .style('top', `${Math.max(top, 0)}px`)
          .classed('is-right', fitsRight)
          .classed('is-left', !fitsRight)
          .classed('is-below', fitsBottom)
          .classed('is-above', !fitsBottom)
    }

    function onClickOutside () {
      const target = event.target

      if (popover.node().contains(target)) return
      if (anchor.contains(target)) return

      event.stopPropagation()
      removeClickOutsideHandler()

      if (lastCreated !== clickCloseEventName) {
        dispatch.call('close', popoverContent.node())
        return
      }

      close()
    }

    function close () {
      gridRoot.on('grid-scroll.cell-popover', null)
      body.on(clickCloseEventName, null)
      popover.remove()
      dispatch.call('close', popoverContent.node())
    }
  }

  return rebind().from(dispatch, 'on')(popover)
}

function upwards (selector) {
  function upwardsSelect (d, i) {
    if (!this.parentNode || this.parentNode === document.body) return null
    if (selectAll([this.parentNode]).filter(selector).empty()) {
      return upwardsSelect.apply(this.parentNode, [...arguments])
    }
    return [this.parentNode]
  }
  return upwardsSelect
}

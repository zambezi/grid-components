import { dispatch as createDispatch } from 'd3-dispatch'
import { findIndex } from 'underscore'
import { rebind } from '@zambezi/d3-utils'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

export function createScrollToRow () {
  let item
  let pinned = false

  function scrollToRow (s) {
    s.each(scrollToRowEach)
  }

  scrollToRow.item = function (value) {
    if (!arguments.length) return item
    item = value
    return scrollToRow
  }

  scrollToRow.pinned = function (value) {
    if (!arguments.length) return pinned
    pinned = value
    return scrollToRow
  }

  return scrollToRow

  function scrollToRowEach (d, i) {
    const index = findIndex(d.rows.free, sameItem)
    const found = !!~index
    const target = select(this)

    if (!found) return

    const { dispatch, rowHeight } = d
    const scrollTop = d.scroll.top

    const itemTop = rowHeight * index
    const actualHeight = d.rows.free.actualHeight
    const isInView = itemTop >= scrollTop &&
      itemTop + rowHeight <= scrollTop + actualHeight

    if (isInView) return
    if (!pinned) item = null

    setTimeout(
      () =>
      select(this)
          .dispatch('grid-scroll', { bubbles: true, detail: { top: itemTop -1, left: 0 } })
          .dispatch('redraw', { bubbles: true }),

      20  // What shall we do with this? -- invalidation during consolidation
          // cycle is "not possible",
          // https://github.com/zambezi/d3-utils/blob/master/src/throttle-to-animation-frame.js#L14-L15
          // Also, scroller consolidation happens "a bit after" but with out
          // of date scrolls -- more precisely, scrolls without consolidation.
          // https://github.com/zambezi/grid/blob/master/src/scrollers.js#L20
          //
          // Will park this for now.
    )
  }

  function sameItem (d) {
    return unwrap(d) === item
  }
}

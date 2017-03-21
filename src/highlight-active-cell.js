import { appendIfMissing, selectionChanged } from '@zambezi/d3-utils'
import { isUndefined, find } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './highlight-active-cell.css'

const highlightContainer = appendIfMissing('div.active-cell-highlight.zambezi-grid-overlay')
const markerBox = appendIfMissing('div.marker-box')
const activePositionChanged = selectionChanged().key(d => d)

export function createHighlightActiveCell () {
  let activeCell
  let rowIndex

  function highlightActiveCell (s) {
    s.each(highlightActiveCellEach)
  }

  highlightActiveCell.activeCell = function (value) {
    if (!arguments.length) return activeCell
    rowIndex = undefined
    activeCell = value
    return highlightActiveCell
  }

  return highlightActiveCell

  function highlightActiveCellEach (d, i) {
    const { rowHeight, scroll } = d
    const marker = select(this)
            .on('data-dirty.invalidate-highlight-active-cell', d => (rowIndex = undefined))
          .select('.zambezi-grid-body')
          .select(highlightContainer)
          .select(markerBox)
            .style('position', 'absolute')
            .style('transform', `translate(${-scroll.left}px, ${-scroll.top}px)`)

    const columnClass = activeCell ? `c-${activeCell.column.id}` : ''

    if (activeCell && isUndefined(rowIndex)) {
      const wrappedRow = find(d.rows.free, r => unwrap(r) === activeCell.row)
      rowIndex = wrappedRow && wrappedRow.freeRowNumber
      if (!wrappedRow) activeCell = null  // we don't have the row, quit
                                          // searching
    }

    marker.datum(`${rowIndex}×${columnClass}`)
      .select(activePositionChanged)
        .attr('class', `marker-box ${columnClass}`)
        .style('top', `${rowIndex * rowHeight}px`)
        .style('height', `${rowHeight}px`)
        .style('display', isUndefined(rowIndex) ? 'none' : null)
  }
}

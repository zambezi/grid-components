import { appendIfMissing, selectionChanged }  from '@zambezi/d3-utils'
import { isUndefined, find } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './highlight-active-cell.css'

const highlightContainer = appendIfMissing('div.active-cell-highlight.zambezi-grid-overlay')
    , markerBox = appendIfMissing('div.marker-box')
    , activePositionChanged = selectionChanged().key(d => d)

export function createHighlightActiveCell() {
  let activeCell
    , rowIndex

  function highlightActiveCell(s) {
    s.each(highlightActiveCellEach)
  }

  highlightActiveCell.activeCell = function(value) {
    if (!arguments.length) return activeCell
    rowIndex = undefined
    activeCell = value
    return highlightActiveCell
  }

  return highlightActiveCell

  function highlightActiveCellEach(d, i) {
    const { rowHeight, scroll } = d
        , marker = select(this)
            .on('data-dirty.invalidate-highlight-active-cell', d => rowIndex = undefined)
          .select('.zambezi-grid-body')
          .select(highlightContainer)
          .select(markerBox)
            .style('position', 'absolute')
            .style('transform', `translate(${-d.scroll.left}px, ${-d.scroll.top}px)`)


    let wrappedRow
      , columnClass = activeCell ? `c-${activeCell.column.id}` : ''

    if (activeCell && isUndefined(rowIndex)) {
      wrappedRow = find(d.rows.free, r => unwrap(r) == activeCell.row)
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

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
    , columnClass

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
    const marker = select(this)
            .on('data-dirty.invalidate-highlight-active-cell', d => rowIndex = undefined)
          .select('.zambezi-grid-body')
          .select(highlightContainer)
          .select(markerBox)
            .style('position', 'absolute')
            .style('transform', `translate(0, ${-d.scroll.top}px)`)

    let wrappedRow
      , columnClass = activeCell ? `c-${activeCell.column.id}` : ''

    if (activeCell && isUndefined(rowIndex)) {
      wrappedRow = find(d.rows.free, r => unwrap(r) == activeCell.row)
      rowIndex = wrappedRow.freeRowNumber
    }

    marker.datum(`${rowIndex}×${columnClass}`)
        .select(activePositionChanged)
        .attr('data-grid-row-index', rowIndex)
        .attr('class', `marker-box zambezi-grid-row ${columnClass}`)
        .style('display', isUndefined(rowIndex) ? 'none' : null)

  }
}

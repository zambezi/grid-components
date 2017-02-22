import { appendIfMissing, selectionChanged }  from '@zambezi/d3-utils'
import { findIndex } from 'underscore'
import { select } from 'd3-selection'

import './highlight-selected-cells.css'

const highlightContainer = appendIfMissing('div.selected-cells-highlight.zambezi-grid-overlay')
    , borderDirty = selectionChanged()

export function createHighlightSelectedCells() {
  let selectedCells = []
    , borderCache
    , borderRedrawGen = 0

  function highlightSelectedCells(s) {
    s.each(highlightSelectedCellsEach)
  }

  highlightSelectedCells.selectedCells = function(value) {
    if (!arguments.length) return selectedCells
    selectedCells = value
    borderCache = null
    return highlightSelectedCells
  }

  return highlightSelectedCells

  function highlightSelectedCellsEach(bundle) {
    const { columns, rows, scroll, rowHeight } = bundle
        , container = select(this)
              .on(
                'data-dirty.highlight-selected-cells',
                () => borderCache = null
              )
            .select('.zambezi-grid-body')
            .select(highlightContainer)
              .style('transform', `translate(${-scroll.left}px, ${-scroll.top}px)`)

    if (!borderCache)  {
      borderCache = compileBorderLayout()
      borderRedrawGen++
    }

    container.select(borderDirty.key(() => borderRedrawGen))
        .call(renderCellHighlights)

    function renderCellHighlights(s) {
      const update = s.selectAll('.zambezi-grid-cell-highlight')
                .data(borderCache)
          , enter = update.enter().append('span')
          , exit = update.exit().remove()
          , merged = update.merge(enter)
                .attr('class', null)
                .classed('zambezi-grid-cell-highlight', true)
                .each(configureHighlightCell)
    }

    function configureHighlightCell(d, i) {
      const { column
            , hasBottomBorder
            , hasLeftBorder
            , hasRightBorder
            , hasTopBorder
            , rowIndex
            } = d

      select(this)
              .style('top', `${rowIndex * rowHeight}px`)
              .style('height', `${rowHeight}px`)
              .classed(`c-${column.id}`, true)
              .classed('has-bottom-border', hasBottomBorder)
              .classed('has-left-border', hasLeftBorder)
              .classed('has-top-border', hasTopBorder)
              .classed('has-right-border', hasRightBorder)
    }

    function compileBorderLayout() {
      const rowToIndex = new Map()
          , columnToIndex = new Map()
          , selectedCellGrid = []

      return selectedCells
          .reduce(toCoords, [])
          .reduce(toBorderCells, [])
          .filter(hasAnyBorder)

      function toCoords(acc, { row, column }) {
        let columnIndex = columnToIndex.has(column) ? 
                columnToIndex.get(column) : findIndex(columns, column)
          , rowIndex = rowToIndex.has(row) ?
                rowToIndex.get(row) : findIndex(rows, row)
          , gridRow = selectedCellGrid[rowIndex] || []
          , cell = { row, column, rowIndex, columnIndex }

        gridRow[columnIndex] = cell

        columnToIndex.set(column, columnIndex)
        rowToIndex.set(row, rowIndex)
        selectedCellGrid[rowIndex] = gridRow
        acc.push(cell)
        return acc
      }

      function toBorderCells(acc, cell) {
        const { rowIndex, columnIndex } = cell
            , hasLeftBorder = !selectedCellGrid[rowIndex][columnIndex - 1]
            , hasRightBorder = !selectedCellGrid[rowIndex][columnIndex + 1]
            , hasTopBorder = !selectedCellGrid[rowIndex - 1] 
                  || !selectedCellGrid[rowIndex -1][columnIndex]
            , hasBottomBorder = !selectedCellGrid[rowIndex + 1] 
                  || !selectedCellGrid[rowIndex + 1][columnIndex]
            , borderCell = Object.assign(
                cell
              , { hasLeftBorder, hasRightBorder, hasTopBorder, hasBottomBorder }
              )

        if (hasAnyBorder(borderCell)) acc.push(borderCell)
        return acc
      }

      function hasAnyBorder({ hasLeftBorder, hasRightBorder, hasTopBorder, hasBottomBorder }) {
        return hasLeftBorder || hasRightBorder || hasTopBorder || hasBottomBorder
      }
    }
  }
}

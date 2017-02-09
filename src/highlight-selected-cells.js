import { select } from 'd3-selection'
import { findIndex } from 'underscore'

export function createHighlightSelectedCells() {

  let selectedCells = []
    , borderCache

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
    const target = select(this)
              .on(
                'data-dirty.highlight-selected-cells',
                () => borderCache = null
              )
        , { columns, rows } = bundle

    if (!borderCache)  {
      console.log('compile border cache')
      borderCache = compileBorderLayout()
    }

    console.log('render border cache!', borderCache)

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

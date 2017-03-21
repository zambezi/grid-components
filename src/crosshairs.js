import { select } from 'd3-selection'
import './crosshairs.css'

export function createCrosshairs () {
  let vertical = true
  let horizontal = true
  let highlightedRow
  let highlightedColum

  function crosshairs (s) {
    s.each(crosshairsEach)
  }

  crosshairs.vertical = function (value) {
    if (!arguments.length) return vertical
    vertical = value
    return crosshairs
  }

  crosshairs.horizontal = function (value) {
    if (!arguments.length) return horizontal
    horizontal = value
    return crosshairs
  }

  return crosshairs

  function crosshairsEach ({ rows, dispatcher }, i) {
    const target = select(this)

    updateHeaders()

    dispatcher
          .on('cell-enter.crosshairs-column', vertical ? setColumnListeners : null)
          .on('cell-update.crosshairs-column', vertical ? updateColumnHighlight : null)
          .on('cell-exit.crosshairs-column', vertical ? clearColumnListeners : null)
          .on('row-enter.crosshairs-row', horizontal ? setRowListeners : null)
          .on('row-update.crosshairs-row', horizontal ? updateRowHighlight : null)
          .on('row-exit.crosshairs-row', horizontal ? clearRowListeners : null)

    function updateHeaders () {
      target.selectAll('.zambezi-grid-headers .zambezi-grid-header')
            .on('mouseover.crosshairs-column', vertical ? column => onColumnHover({ column }) : null)
            .each(updateHeaderHighlight)
    }

    function onRowHover ({ row }) {
      highlightedRow = row
      target.selectAll('.zambezi-grid-row')
          .each(updateRowHighlight)
    }

    function onColumnHover ({ column }) {
      highlightedColum = column
      target.selectAll('.zambezi-grid-cell')
          .each(updateColumnHighlight)

      updateHeaders()
    }

    function setRowListeners (d) {
      select(this).on('mouseover.crosshairs-row', onRowHover)
    }

    function updateRowHighlight ({ row }) {
      select(this).classed('is-crosshairs-over', row === highlightedRow)
    }

    function updateColumnHighlight ({ column }) {
      select(this).classed('is-crosshairs-over', column === highlightedColum)
    }

    function setColumnListeners (d) {
      select(this).on('mouseover.crosshairs-row', onColumnHover)
    }

    function clearRowListeners (d) {
      select(this).on('mouseover.crosshairs-row', null)
    }

    function clearColumnListeners (d) {
      select(this).on('mouseover.crosshairs-row', null)
    }

    function updateHeaderHighlight (column) {
      select(this).classed('is-crosshairs-over', column === highlightedColum)
    }
  }
}

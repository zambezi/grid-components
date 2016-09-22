import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'
import { reduce, indexBy, findWhere } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change')

  let gesture = 'click'
    , selected = []
    , selectedCandidates
    , selectedRowsByColumnId = {}
    , columnById = {}
    , active

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected
    selected = value
    selectedCandidates = value
    return cellSelection
  }

  cellSelection.active = function(value) {
    if (!arguments.length) return active
    active = value
    return cellSelection
  }

  return rebind().from(dispatch, 'on')(cellSelection)

  function cellSelectionEach(rows, i) {
    const target = select(this)

    if (selectedCandidates) updateFromCandidates()

    rows.dispatcher
        .on('cell-enter.cell-selection', onCellEnter)
        .on('cell-update.cell-selection', onCellUpdate)

    function updateFromCandidates() {
      selectedRowsByColumnId = selectedCandidates.reduce(toRealCells, {})
      compileSelected()
      selectedCandidates = null
    }

    function toRealCells(acc, { row, column }) {

      const columnFound = typeof column == 'string' ? columnById[column] : column
          , rowFound = typeof row == 'number' ? rows[row] : row

      if (!columnFound || !rowFound) {
        console.warn("Couldn't find cell for", { row, column })
        return acc
      }

      const columnId = columnFound.id
          , set = acc[columnId] || new Set()

      set.add(rowFound)
      acc[columnId] = set
      return acc
    }

    function compileSelected() {
      columnById = indexBy(rows.columns, 'id')
      selected = reduce(selectedRowsByColumnId, toCells, [])
      return selected
    }

    function onCellEnter(d, i) {
      select(this).on('click.cell-selection', onClick)
    }

    function onClick(d, i) {
      const column = d.column
          , columnId = column.id
          , set = selectedRowsByColumnId[columnId] || new Set()
          , row = unwrap(d.row)

      // Here'd be fancier Shift+Click all that jazz
      if (set.has(row)) {
        set.delete(row)
        if (areSameCell(d, active)) active = null
      } else {
        set.add(row)
        active = d
      }

      selectedRowsByColumnId[columnId] = set
      dispatch.call('cell-selected-change', this, compileSelected(), active)
      select(this).dispatch('redraw', { bubbles: true })
    }

    function toCells(acc, set, columnId) {
      const column = columnById[columnId]
      return acc.concat(Array.from(set.values()).map(row => ({ row, column })))
    }
  }

  function onCellUpdate(d, i){
    select(this)
        .classed('is-selected', isCellSelected)
        .classed('is-active', isCellActive)
  }

  function isCellSelected(d, i) {
    const rowSetForColumn = selectedRowsByColumnId[d.column.id]
    return rowSetForColumn && rowSetForColumn.has(unwrap(d.row))
  }

  function isCellActive(d) {
    return areSameCell(d, active)
  }
}

function areSameCell(a, b) {
  return a && b && a.row == b.row && a.column == b.column
}

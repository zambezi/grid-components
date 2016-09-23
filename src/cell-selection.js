import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'
import { reduce, indexBy, findWhere } from 'underscore'
import { select, event } from 'd3-selection'
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
      selectedRowsByColumnId = selectedCandidates.reduce(toRealSelection, {})
      selected = compileSelected()
      selectedCandidates = null
    }

    function toRealSelection(acc, { row, column }) {
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
      return reduce(selectedRowsByColumnId, toCells, [])
    }

    function onCellEnter(d, i) {
      select(this).on('click.cell-selection', onClick)
    }

    function onClick(d, i) {
      const column = d.column
          , columnId = column.id
          , set = selectedRowsByColumnId[columnId]
          , row = unwrap(d.row)
          , shift = event.shiftKey
          , ctrl = event.ctrlKey
          , target = { row, column }
          , isAlreadySelected = set && set.has(row)

      switch(true) {
        case ctrl && isAlreadySelected: 
          removeFromSelected(target)
          break
        case ctrl: 
          addToSelected(target)
          break
        default:
          selectOnly(target)
      }

      active = target
      selected = compileSelected()

      dispatch.call('cell-selected-change', this, selected, active)
      select(this).dispatch('redraw', { bubbles: true })
    }

    function selectOnly(target) {
      selectedRowsByColumnId = {}
      addToSelected(target)
    }

    function removeFromSelected({ row, column }) {
      const columnId = column.id
          , set = selectedRowsByColumnId[columnId] 

      if (set) set.delete(row)
    }

    function addToSelected({ row, column }) {
      const columnId = column.id
          , set = selectedRowsByColumnId[columnId] || new Set()

      set.add(row)
      selectedRowsByColumnId[columnId] = set
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
    if (!active) return false
    return areSameCell(d, active)
  }
}

function areSameCell(a, b) {
  return a && b && unwrap(a.row) == unwrap(b.row) && a.column == b.column
}

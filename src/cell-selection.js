import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'
import { reduce, indexBy } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change')

  let gesture = 'click'
    , selected
    , selectedCandidates
    , selectedRowsByColumnId = {}
    , columnById = {}
    , active

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected || compileSelected()
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

  function cellSelectionEach(d, i) {
    const target = select(this)

    if (selectedCandidates) consolidateSelected()

    d.dispatcher
        .on('cell-enter.cell-selection', onCellEnter)
        .on('cell-update.cell-selection', onCellUpdate)

    function consolidateSelected() {
      console.info('consolidateSelected', selectedCandidates)
      selectedCandidates = null
    }

    function onCellEnter(d, i) {
      select(this).on('click.cell-selection', onClick)
    }

    function onClick(d, i) {
      const column = d.column
          , columnId = column.id
          , set = selectedRowsByColumnId[columnId] || new Set()
          , row = unwrap(d.row)

      if (set.has(row)) {
        set.delete(row)
        if (areSameCell(d, active)) active = null
      } else {
        set.add(row)
        active = d
      }

      selectedRowsByColumnId[columnId] = set
      dispatch.call('cell-selected-change', this, compileSelected())
      select(this).dispatch('redraw', { bubbles: true })
    }

    function compileSelected() {
      columnById = indexBy(d.columns, 'id')
      selected = reduce(selectedRowsByColumnId, toCells, [])
      return selected
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

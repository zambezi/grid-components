import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'
import { select } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change')

  let gesture = 'click'
    , selected
    , selectedCandidates
    , selectedRowsByColumnId = {}

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected || compileSelected()
    selectedCandidates = value
    return cellSelection
  }

  return rebind().from(dispatch, 'on')(cellSelection)

  function cellSelectionEach(d, i) {
    const target = select(this)

    consolidateSelected()

    d.dispatcher
        .on('cell-enter.cell-selection', onCellEnter)
        .on('cell-update.cell-selection', onCellUpdate)
  }

  function consolidateSelected() {
    selected = null
    selectedCandidates = null
  }

  function compileSelected() {
    selected = 'whareva'
  }

  function onCellEnter(d, i) {
    select(this).on('click.cell-selection', onClick)
  }

  function onCellUpdate(d, i){
    select(this).classed('is-selected', isCellSelected)
  }

  function isCellSelected(d, i) {
    const rowSetForColumn = selectedRowsByColumnId[d.column.id]
    return rowSetForColumn && rowSetForColumn.has(unwrap(d.row))
  }

  function onClick(d, i) {
    const columnId = d.column.id
        , set = selectedRowsByColumnId[columnId] || new Set()

    set.add(unwrap(d.row))
    selectedRowsByColumnId[columnId] = set

    select(this).dispatch('redraw', { bubbles: true })
  }
}

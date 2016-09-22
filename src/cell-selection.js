import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'
import { select } from 'd3-selection'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change')

  let gesture = 'click'
    , selected = []
    , selectedRowsByColumnId = {}

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected
    selected = value
    return cellSelection
  }

  return rebind().from(dispatch, 'on')(cellSelection)

  function cellSelectionEach(d, i) {

    const target = select(this)

    console.info('CONSOLIDATE SELECTED CELLS')

    d.dispatcher
        .on('cell-enter.cell-selection', onCellEnter)
        .on('cell-update.cell-selection', onCellUpdate)
  }

  function onCellEnter(d, i) {
    select(this).on('click.cell-selection', onClick)
  }

  function onCellUpdate(d, i){
    select(this).classed('is-selected', isCellSelected)
  }

  function isCellSelected(d, i) {
    return Math.random() > 0.5
  }

  function onClick(d, i) {
    console.debug('onClick cell select', d.column.id, d.row)
  }
}

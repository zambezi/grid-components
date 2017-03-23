import { dispatch as createDispatch } from 'd3-dispatch'
import { select } from 'd3-selection'
import { selectionChanged, rebind } from '@zambezi/d3-utils'
import { unwrap } from '@zambezi/grid'

import './row-selection.css'

export function createRowSelection () {
  const activeChanged = selectionChanged()
  const dispatch = createDispatch('row-active-change')
  const api = rebind().from(dispatch, 'on')

  let active

  function rowSelection (s) {
    s.each(rowSelectionEach)
  }

  rowSelection.active = function (value) {
    if (!arguments.length) return active
    active = value
    return rowSelection
  }

  return api(rowSelection)

  function rowSelectionEach ({ dispatcher }) {
    dispatcher
        .on('row-enter.row-selection', attachListeners)
        .on('row-update.row-selection', updateRow)
        .on('row-exit.row-selection', removeListeners)
  }

  function updateRow ({ row }) {
    const isActive = unwrap(row) === active
    select(this).select(activeChanged.key(() => isActive)).classed('is-active', isActive)
  }

  function attachListeners () {
    select(this).on('click.row-selection', setActive)
  }

  function removeListeners () {
    select(this).on('click.row-selection', null)
  }

  function setActive ({ row }) {
    const newActive = unwrap(row)
    if (active === newActive) return
    active = newActive
    dispatch.call('row-active-change', this, newActive)
    select(this).dispatch('redraw', { bubbles: true })
  }
}

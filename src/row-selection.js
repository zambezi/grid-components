import { rebind, selectionChanged } from '@zambezi/d3-utils'
import { select, event } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './row-selection.css'


export function createRowSelection() {

  const activeChanged = selectionChanged()
  let active

  function rowSelection(s) {
    s.each(rowSelectionEach)
  }

  rowSelection.active = function(value) {
    if (!arguments.length) return active
    active = value
    return rowSelection
  }

  return rowSelection

  function rowSelectionEach({ dispatcher }) {
    dispatcher
        .on('row-enter.row-selection', attachListeners)
        .on('row-update.row-selection', updateRow)
        .on('row-exit.row-selection', removeListeners)
  }

  function updateRow({ row }) {
    const isActive = unwrap(row) === active
    select(this).select(activeChanged.key(() => isActive)).classed('is-active', isActive)
  }

  function attachListeners() {
    select(this).on('click.row-selection', setActive)
  }

  function removeListeners() {
    select(this).on('click.row-selection', null)
  }

  function setActive({ row }) {
    active = unwrap(row)
    select(this).dispatch('redraw', { bubbles: true })
  }
}

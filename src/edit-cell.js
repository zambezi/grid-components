import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { compose } from 'underscore'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, event } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './edit-cell.css'

const append = appendIfMissing('span.edit-cell-input')

export function createEditCell() {

  const rowToTemp = new WeakMap()
      , dispatch = createDispatch('change', 'validationerror', 'editstart', 'editend')
      , api = rebind().from(dispatch, 'on')
      , internalDispatch = createDispatch('external-edit-request')

  let gesture = 'dblclick'
    , component
    , validate = () => null
    , editable = () => true

  function editCellEach(d, i) {

    const isEditable = editable.call(this, d, i) 
        , row = unwrap(d.row)
        , column = d.column
        , temp = rowToTemp.get(row)
        , cellTarget = select(this)
        , rowNumber = d.row.freeRowNumber

    cellTarget.classed('editable-cell', isEditable)
        .on('click.quiet', isEditable ? () => event.stopPropagation() : null)
        .on(gesture + '.start', isEditable ? startEdit : null)

    internalDispatch.on(`external-edit-request.${column.id}`, startExternalEdit)
    draw()

    function startExternalEdit(cell, initValue) {

      const eventColumn = cell.column
          , eventRow = cell.row
          , isTargetRowEditable = editable.call(this, cell)

      if (eventColumn.id !== column.id) return
      if (!isTargetRowEditable) return

      startEdit(cell)
    }

    function draw() {

      if (isEditable && temp) {
        d.tempInput = temp.value
        d.isValidInput = !!temp.valid

        component
            .on('partialedit.cache', cacheTemp)
            .on('cancel.clear', removeTmp)
            .on('cancel.notify', notifyEditEnd)
            .on('commit.process', compose(notifyEditEnd, validateChange))
            .on('commit.redraw', () => cellTarget.dispatch('redraw', { bubbles: true }) )

        cellTarget.classed('is-editing', true)
            .select(append)
            .call(component)

      } else {
        cellTarget.classed('is-editing', false).select('.edit-cell-input').remove()
      }
    }


    function cacheTemp(d) {
      rowToTemp.set(unwrap(d.row), { value: this.value, valid: true })
    }

    function removeTmp(d) {
      rowToTemp.delete(unwrap(d.row))
    }

    function notifyEditEnd(d) {
      if (!d) return
      dispatch.call('editend', this, unwrap(d))
    }

    function validateChange(d) {
      const unwrappedRow = unwrap(d.row)
          , reason = validate.call(this, d, this.value)
          , isValid = !reason

      if (isValid)  {
        removeTmp(d)
        dispatch.call('change', this, unwrappedRow, this.value)
        return d
      } else {
        rowToTemp.set(unwrappedRow, { value: this.value, valid: false })
        dispatch.call('validationerror', this, reason)
        return null
      }
    }

    function startEdit(cell) {
      const unwrappedRow = unwrap(cell.row)
          , isAlreadyEditing = (rowToTemp.get(unwrappedRow) !== undefined)

      if (isAlreadyEditing) return

      rowToTemp.set(unwrappedRow, { value: cell.value, valid: true })
      dispatch.call('editstart', this, unwrappedRow)
      cellTarget.dispatch('redraw', { bubbles: true })
    }
  }


  editCellEach.component = function(value) {
    if (!arguments.length) return component
    component = value
    return editCellEach
  }

  editCellEach.validate = function(value) {
    if (!arguments.length) return validate
    validate = value
    return editCellEach
  }

  editCellEach.editable = function(value) {
    if (!arguments.length) return editable
    editable = value
    return editCellEach
  }

  editCellEach.gesture = function(value) {
    if (!arguments.length) return gesture
    gesture = value
    return editCellEach
  }

  editCellEach.startEdit = function(cell, initValue) {
    internalDispatch.call('external-edit-request', this, cell, initValue)
    return editCellEach
  }

  return api(editCellEach)

}

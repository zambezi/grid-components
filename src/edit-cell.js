import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { compose, isUndefined } from 'underscore'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, event } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './edit-cell.css'

const append = appendIfMissing('span.edit-cell-input')

export function createEditCell () {
  const rowToTemp = new WeakMap()
  const dispatch = createDispatch('change', 'validationerror', 'editstart', 'editend')
  const api = rebind().from(dispatch, 'on')
  const internalDispatch = createDispatch('external-edit-request')

  let gesture = 'dblclick'
  let component
  let validate = () => null
  let editable = () => true

  function editCellEach (d, i) {
    const isEditable = editable.call(this, d, i)
    const row = unwrap(d.row)
    const column = d.column
    const temp = rowToTemp.get(row)
    const cellTarget = select(this)

    cellTarget.classed('editable-cell', isEditable)
        .on('click.quiet', isEditable ? () => event.stopPropagation() : null)
        .on(gesture + '.start', isEditable ? cell => startEdit(cell) : null)

    internalDispatch.on(`external-edit-request.${column.id}`, startExternalEdit)
    draw()

    function startExternalEdit (cell, initValue) {
      const eventColumn = cell.column
      const isTargetRowEditable = editable.call(this, cell)

      if (eventColumn.id !== column.id) return
      if (!isTargetRowEditable) return

      startEdit(cell, initValue)
    }

    function draw () {
      if (isEditable && temp) {
        d.tempInput = temp.value
        d.isValidInput = !!temp.valid

        component
            .on('partialedit.cache', cacheTemp)
            .on('cancel.clear', removeTmp)
            .on('cancel.notify', notifyEditEnd)
            .on('cancel.redraw', () => cellTarget.dispatch('redraw', { bubbles: true }))
            .on('commit.process', compose(notifyEditEnd, validateChange))
            .on('commit.redraw', () => cellTarget.dispatch('redraw', { bubbles: true }))

        cellTarget.classed('is-editing', true)
            .select(append)
            .call(component)
      } else {
        cellTarget.classed('is-editing', false).select('.edit-cell-input').remove()
      }
    }

    function cacheTemp (d) {
      rowToTemp.set(unwrap(d.row), { value: this.value, valid: true })
    }

    function removeTmp (d) {
      rowToTemp.delete(unwrap(d.row))
    }

    function notifyEditEnd (d) {
      if (!d) return
      dispatch.call('editend', this, unwrap(d))
    }

    function validateChange (d) {
      const unwrappedRow = unwrap(d.row)
      const reason = validate.call(this, d, this.value)
      const isValid = !reason

      if (isValid) {
        removeTmp(d)
        dispatch.call('change', this, unwrappedRow, this.value)
        return d
      } else {
        rowToTemp.set(unwrappedRow, { value: this.value, valid: false })
        dispatch.call('validationerror', this, reason)
        return null
      }
    }

    function startEdit (cell, initValue) {
      const { row } = cell
      const unwrappedRow = unwrap(row)
      const isAlreadyEditing = (rowToTemp.get(unwrappedRow) !== undefined)

      if (isAlreadyEditing) return

      rowToTemp.set(
        unwrappedRow,
        {
          value: isUndefined(initValue) ? cell.value : initValue,
          valid: true
        }
      )

      dispatch.call('editstart', this, unwrappedRow)
      cellTarget.dispatch('redraw', { bubbles: true })
    }

    // Reconfigure row changed key function after first run
    editCellEach.rowChangedKey = function (targetRow) {
      const temp = rowToTemp.get(unwrap(targetRow))
      const isEditing = !!temp

      return !isEditing ? '-'
            : temp.valid ? '★'
            : '☆'
    }
  }

  editCellEach.rowChangedKey = function (targetRow) {
    return '-'
  }

  editCellEach.component = function (value) {
    if (!arguments.length) return component
    component = value
    return editCellEach
  }

  editCellEach.validate = function (value) {
    if (!arguments.length) return validate
    validate = value
    return editCellEach
  }

  editCellEach.editable = function (value) {
    if (!arguments.length) return editable
    editable = value
    return editCellEach
  }

  editCellEach.gesture = function (value) {
    if (!arguments.length) return gesture
    gesture = value
    return editCellEach
  }

  editCellEach.startEdit = function (cell, initValue) {
    internalDispatch.call('external-edit-request', this, cell, initValue)
    return editCellEach
  }

  return api(editCellEach)
}

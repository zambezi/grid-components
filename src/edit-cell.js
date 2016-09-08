import { appendIfMissing, rebind } from '@zambezi/d3-utils'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, event } from 'd3-selection'
import { unwrap } from '@zambezi/grid'

import './edit-cell.css'

const append = appendIfMissing('span.edit-cell-input')

export function createEditCell() {

  const rowToTemp = new WeakMap()
      , dispatch = createDispatch('change', 'validationerror')
      , api = rebind().from(dispatch, 'on')

  let gesture = 'dblclick'
    , component
    , validate = () => null
    , editable = () => true

  function editCellEach(d, i) {

    const isEditable = editable.call(this, d, i) // HHA
        , target = select(this)
              .classed('editable-cell', isEditable)
              .on('click.quiet', isEditable ? () => event.stopPropagation() : null)
              .on(gesture + '.start', isEditable ? startEdit : null)

    target.each(draw)

    function draw(d, i) {
      const isEditable = editable.call(this, d, i)
          , row = unwrap(d.row)
          , temp = rowToTemp.get(row)
          , cell = select(this)

      if (isEditable && temp && temp.value !== undefined) {

        d.tempInput = temp.value
        d.isValidInput = !!temp.valid

        component.on('partialedit.cache', cacheTemp)
            .on('cancel.clear', cancelTemp)
            .on('commit.clear', clearTemp)

        cell.select(append)
            .call(component)

      } else {
        cell.classed('is-editing', false).select('.edit-cell-input').remove()
      }

    }

    function startEdit(d, i) {
      const unwrappedRow = unwrap(d.row)
          , isAlreadyEditing = (rowToTemp.get(unwrappedRow) !== undefined)

      if (isAlreadyEditing) return

      rowToTemp.set(unwrappedRow, {value: d.value, valid: true})
      select(this)
          .classed('is-editing', true)
          .dispatch('redraw', { bubbles: true })
    }

    function cacheTemp(d) {
      rowToTemp.set(unwrap(d.row), {value: this.value, valid: true})
    }

    function cancelTemp(d) {
      rowToTemp.delete(unwrap(d.row))
      select(this).dispatch('redraw', { bubbles: true })
    }

    function clearTemp(d) {
      const reason = validate.call(this, d, i)
      if (!reason)  {
        cancelTemp(d)
        dispatch.call('change', this, unwrap(d.row), i)
      } else {
        rowToTemp.set(unwrap(d.row), {value: this.value, valid: false})
        select(this).dispatch('redraw', { bubble: true })
        dispatch.call('validationerror', this, reason)
      }
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

  return api(editCellEach)

}

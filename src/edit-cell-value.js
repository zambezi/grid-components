import { appendIfMissing, rebind, keyCodeHandler, createCharacterClassValidator } from '@zambezi/d3-utils'
import { createEditCell } from './edit-cell'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select } from 'd3-selection'
import { someResult as some } from '@zambezi/fun'

const appendInput = appendIfMissing('input.edit-value')

export function createEditCellValue() {
  const editValue = createEditValue()
      , editCell = createEditCell().component(editValue)

  return rebind().from(editValue, 'characterClass')(editCell)
}

function createEditValue() {
  const dispatch = createDispatch('partialedit', 'commit', 'cancel')
      , characterClassValidator = createCharacterClassValidator()
      , api = rebind()
                .from(dispatch, 'on')
                .from(characterClassValidator, 'characterClass')

  let keyDownHandlers = []

  function editValue(s) {
    s.each(editValueEach)
  }

  function editValue(s) {
    s.each(editValueEach)
  }

  editValue.keyDownHandlers = function(value) {
    if (!arguments.length) return keyDownHandlers
    keyDownHandlers = value
    return editValue
  }

  return api(editValue)

  function editValueEach(d, i) {

    const input = select(this)
            .select(appendInput)
              .classed('error', !d.isValidInput)
              .property('value', d.tempInput || '')
              .on('input', () => dispatch.call('partialedit', input.node(), d))
              .on('keypress.valid-character', characterClassValidator)
              .on(
                'keydown.process'
              , some.apply(
                    null
                  , keyDownHandlers.concat(
                      [
                        keyCodeHandler((d) => dispatch.call('commit', input.node(), d), 13)
                      , keyCodeHandler((d) => dispatch.call('cancel', input.node(), d), 27)
                      ]
                    )
                )
              )
              .on('blur.process', (d) => dispatch.call('commit', input.node(), d))

    if (d.isValidInput) input.node().focus()
  }
}

import { appendIfMissing, rebind, keyCodeHandler, createCharacterClassValidator } from '@zambezi/d3-utils'
import { createEditCell } from './edit-cell'
import { dispatch as createDispatch } from 'd3-dispatch'
import { isUndefined } from 'underscore'
import { select, event } from 'd3-selection'
import { someResult as some, batch } from '@zambezi/fun'

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

  editValue.keyDownHandlers = function(value) {
    if (!arguments.length) return keyDownHandlers
    keyDownHandlers = value
    return editValue
  }

  return api(editValue)

  function editValueEach(d, i) {
    let isCancelled
      , isCommited

    const input = select(this)
            .select(appendInput)
              .classed('error', !d.isValidInput)
              .property(
                'value'
              ,   !isUndefined(d.tempInput) ? d.tempInput 
                : !isUndefined(d.value)     ? d.value 
                :  ''
              )
              .on('input', () => dispatch.call('partialedit', input.node(), d))
              .on('keypress.valid-character', characterClassValidator)
              .on(
                'keydown.process'
              , some.apply(
                    null
                  , keyDownHandlers.concat(
                      [
                        keyCodeHandler(onCancel, 9)  // tab
                      , keyCodeHandler(batch(stopPropagation, onCancel), 27) // esc
                      , keyCodeHandler(batch(stopPropagation, onCommit), 13)  // enter
                      , keyCodeHandler(stopPropagation, 38) // up
                      , keyCodeHandler(stopPropagation, 40) // down
                      , keyCodeHandler(stopPropagation, 37) // left
                      , keyCodeHandler(stopPropagation, 39) // right
                      ]
                    )
                )
              )
              .on('blur.process', onCommit)

    if (d.isValidInput) input.node().focus()

    function stopPropagation() {
      event.stopPropagation()
    }

    function onCommit(d) {
      if (isCancelled) return
      if (isCommited) return
      isCommited = true
      dispatch.call('commit', input.node(), d)
    }

    function onCancel(d) {
      isCancelled = true
      dispatch.call('cancel', input.node(), d)
    }
  }
}

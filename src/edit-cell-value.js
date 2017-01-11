import { appendIfMissing, rebind, keyCodeHandler, createCharacterClassValidator } from '@zambezi/d3-utils'
import { createEditCell } from './edit-cell'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select, event } from 'd3-selection'
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
              .property('value', d.tempInput || '')
              .on('input', () => dispatch.call('partialedit', input.node(), d))
              .on('keypress.valid-character', characterClassValidator)
              .on(
                'keydown.process'
              , some.apply(
                    null
                  , keyDownHandlers.concat(
                      [
                        keyCodeHandler(onCancel, 27) // esc
                      , keyCodeHandler(onEnter, 13)  // enter
                      , keyCodeHandler(onCommit, 9)  // tab
                      , keyCodeHandler(onCommit, 38) // up
                      , keyCodeHandler(onCommit, 40) // down
                      , keyCodeHandler(onCommit, 37) // left
                      , keyCodeHandler(onCommit, 39) // right
                      ]
                    )
                )
              )
              .on('blur.process', onCommit)

    if (d.isValidInput) input.node().focus()

    function onEnter(d) {
      console.log('onEnter', d)
      event.stopPropagation()
      onCommit.call(this, d)
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

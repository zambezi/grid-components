import { appendIfMissing, rebind, keyCodeHandler } from '@zambezi/d3-utils'
import { createEditCell } from './edit-cell'
import { dispatch as createDispatch } from 'd3-dispatch'
import { select } from 'd3-selection'
import { someResult as some } from '@zambezi/fun'

const appendInput = appendIfMissing('input.edit-value')

export function createEditCellValue() {
  
  const editValueComponent = createEditValue()
  return rebind()
            // .from(editValueComponent, 'characterClass')
            (createEditCell().component(createEditValue()))
}

function createEditValue() {
  const dispatch = createDispatch('partialedit', 'commit', 'cancel')
      , api = rebind().from(dispatch, 'on')

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
              .on('input', () => dispatch.call('partialedit', this, d))
              // .on('keypress.valid-character', characterClassValidator)
              .on(
                'keydown.process'
              , some.apply(
                    null
                  , keyDownHandlers.concat(
                      [
                        keyCodeHandler(() => console.log('13', input.node()), 13)
                      , keyCodeHandler((d) => dispatch.call('cancel', this, d), 27)
                      ]
                    )
                )
              )
              .on('blur.process', (d) => dispatch.call('commit', this, d))

    if (d.isValidInput) input.node().focus()
  }
}

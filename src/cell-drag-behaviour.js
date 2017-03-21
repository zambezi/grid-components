import { dispatch as createDispatch } from 'd3-dispatch'
import { drag as createDrag } from 'd3-drag'
import { rebind } from '@zambezi/d3-utils'
import { select, event } from 'd3-selection'

export function createCellDragBehaviour () {
  const drag = createDrag().filter(ignoreDragSelector)
  const dispatch = createDispatch('dragover', 'dragstart', 'dragend')
  const api = rebind().from(dispatch, 'on')

  let isDragging = false
  let ignoreSelector = 'input, button'
  let debugIgnoreSelector = false

  function cellDragBehaviour (s) {
    s.each(cellDragBehaviourEach)
  }

  cellDragBehaviour.debugIgnoreSelector = function (value) {
    if (!arguments.length) return debugIgnoreSelector
    debugIgnoreSelector = value
    return cellDragBehaviour
  }

  cellDragBehaviour.ignoreSelector = function (value) {
    if (!arguments.length) return ignoreSelector
    ignoreSelector = value
    return cellDragBehaviour
  }

  return api(cellDragBehaviour)

  function cellDragBehaviourEach ({ dispatcher, scroll, columns }) {
    drag
        .on('start.activate', d => (isDragging = true))
        .on('start.redispatch', d => dispatch.call('dragstart', null, d))
        .on('end.deactivate', () => (isDragging = false))
        .on('end.redispatch', d => dispatch.call('dragend', null, d))

    dispatcher.on('cell-enter.drag-to-select', configureDragBehaviour)
  }

  function configureDragBehaviour () {
    select(this)
        .call(drag)
        .on('mouseover.drag-to-select', onMouseOver)
  }

  function onMouseOver (d) {
    if (!isDragging) return
    dispatch.call('dragover', this, d)
  }

  function ignoreDragSelector () {
    const ignore = select(event.target).filter(ignoreSelector).size()
    if (debugIgnoreSelector) {
      console.log(
        ignore ? 'ignore selection on'
      : 'accept selection on', event.target
      )
    }
    return !ignore
  }
}

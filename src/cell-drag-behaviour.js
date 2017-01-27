import { dispatch as createDispatch } from 'd3-dispatch'
import { drag as createDrag } from 'd3-drag'
import { redispatch, rebind } from '@zambezi/d3-utils'
import { select, event } from 'd3-selection'

export function createCellDragBehaviour() {

  const cellSelector = '.zambezi-grid-cell'
      , maxParentCheckJumps = 3
      , drag = createDrag()

      , dispatch = createDispatch('dragover', 'dragstart', 'dragend')
      , api = rebind().from(dispatch, 'on')

  let isDragging = false

  function cellDragBehaviour(s) {
    s.each(cellDragBehaviourEach)
  }

  return api(cellDragBehaviour)

  function cellDragBehaviourEach({ dispatcher, scroll, columns }) {
    drag
        .on('start.activate', d => isDragging = true)
        .on('start.redispatch', d => dispatch.call('dragstart', null, d))
        .on('end.deactivate', () => isDragging = false)
        .on('end.redispatch', d => dispatch.call('dragend', null, d))

    dispatcher.on('cell-enter.drag-to-select', configureDragBehaviour)
  }

  function configureDragBehaviour() {
    select(this)
        .call(drag)
        .on('mouseenter.drag-to-select', onMouseEnter)
  }

  function onMouseEnter(d) {
    if (!isDragging) return
    dispatch.call('dragover', this, d)
  }

  function findParentCell(dom, depth=0) {
    if (!dom) return null
    if (depth > maxParentCheckJumps) return null
    if (select(dom).filter(cellSelector).size()) return dom
    return findParentCell(dom.parentElement, depth++)
  }
}

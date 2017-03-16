import { createCellDragBehaviour } from './cell-drag-behaviour'
import { dispatch  as createDispatch }  from 'd3-dispatch'
import { modulo } from '@zambezi/fun'
import { rebind, keyCodeHandler, appendIfMissing } from '@zambezi/d3-utils'
import { reduce, indexBy, find, findIndex, debounce, uniqueId } from 'underscore'
import { select, event } from 'd3-selection'
import { someResult as some } from '@zambezi/fun'
import { unwrap } from '@zambezi/grid'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch(
          'cell-selected-change'
        , 'cell-selected-update'
        , 'cell-active-action'
        , 'cell-active-change'
        , 'cell-active-paste'
        )
      , clipboardKeydown = uniqueId('keydown.clipboard.')
      , clipboardKeyup = uniqueId('keyup.clipboard.')
      , cellDragBehaviour = createCellDragBehaviour()
      , api = rebind()
            .from(dispatch, 'on')
            .from(cellDragBehaviour, 'ignoreSelector')
            .from(cellDragBehaviour, 'debugIgnoreSelector')
      , defaultSelectionKey = d => d
      , clipboardProxy = appendIfMissing('textarea.zambezi-grid-clipboard-proxy')

  let selected = []
    , selectedCandidates
    , selectedRowsByColumnId = {}
    , acceptPasteFrom = []
    , active
    , selectable = true
    , trackPaste = true
    , typeToActivate = true
    , lastOverCell
    , rowSelectionKey = defaultSelectionKey
    , rowUpdateNeeded = true
    , clip
    , isIEPasting

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected
    selected = value
    selectedCandidates = value
    return cellSelection
  }

  cellSelection.trackPaste = function(value) {
    if (!arguments.length) return trackPaste
    trackPaste = value
    return cellSelection
  }

  cellSelection.acceptPasteFrom = function(value) {
    if (!arguments.length) return acceptPasteFrom
    acceptPasteFrom = value
    return cellSelection
  }

  cellSelection.typeToActivate = function(value) {
    if (!arguments.length) return typeToActivate
    typeToActivate = value
    return cellSelection
  }

  cellSelection.selectable = function(value) {
    if (!arguments.length) return selectable
    selectable = value
    return cellSelection
  }

  cellSelection.active = function(value) {
    if (!arguments.length) return active
    active = value
    return cellSelection
  }

  cellSelection.rowChangedKey = function(targetRow) {
    const unwrappedRow = unwrap(targetRow)
        , selectedColumnIds = []

    let key = ''

    selected.forEach(addSelected)

    function addSelected({row, column}) {
      if (unwrappedRow !== row) return
      selectedColumnIds.push(column.id)
    }

    key = selectedColumnIds.join('↑')

    if (active && rowSelectionKey(unwrappedRow) === rowSelectionKey(active.row)) {
      key += ('☆' + active.column.id)
    }
    return key
  }

  cellSelection.rowSelectionKey = function(value) {
    if (!arguments.length) return rowSelectionKey
    rowSelectionKey = value
    return cellSelection
  }

  return api(cellSelection)

  function cellSelectionEach(bundle) {
    const target = select(this)
            .on('data-dirty.cell-selection', () => rowUpdateNeeded = true)
        , { columns, rows } = bundle
        , columnById = indexBy(columns, 'id')

    setupDragEvents()
    setupPasteEvents()
    setupKeyboardNavEvents()

    if (rowUpdateNeeded) updateRowsFromKeys()
    if (selectedCandidates) updateFromCandidates()

    bundle.dispatcher
        .on('cell-update.cell-selection', onCellUpdate)

    function moveHorizontal(step) {
      if (!active) return

      const { column, row } = active
          , currentColumnIndex = columns.indexOf(column)
          , newColumn = columns[modulo(currentColumnIndex + step, columns.length)]

      setActive({ row, column: newColumn })
      target.dispatch('redraw', { bubbles: true })
    }

    function moveVertical(step, rows) {
      if (!active) return

      const { column, row } = active
          , currentRowIndex = findIndex(rows, r => rowSelectionKey(unwrap(r)) === rowSelectionKey(row))
          , newRow = rows[modulo(currentRowIndex + step, rows.length)]

      setActive({ row: newRow, column })
      target.dispatch('redraw', { bubbles: true })
    }

    function updateRowsFromKeys() {
      rowUpdateNeeded = false
      if (rowSelectionKey === defaultSelectionKey) return
      const newRowByOldRow = new Map()
      selectedCandidates = (selected || [])
          .reduce(updateRowFromSelectionKey, [])
          .concat(selectedCandidates || [])

      function updateRowFromSelectionKey(acc, {column, row}) {
        const rowSeen = newRowByOldRow.has(row)
        let newRow = newRowByOldRow.get(row)
        if (rowSeen && !newRow) return acc
        if (!newRow) {
          newRow = find(rows, r => rowSelectionKey(r) === rowSelectionKey(row))
          newRowByOldRow.set(row, newRow)
        }

        if (newRow) acc.push({column, row: newRow})
        return acc
      }
    }

    function setActiveIfNone() {
      if (active) return
      if (!bundle.length) return
      if (!columns.length) return
      setActive({ row: bundle[0], column: columns[0] })
      select(this).dispatch('redraw', { bubbles: true })
    }

    function updateFromCandidates() {
      selectedRowsByColumnId = selectedCandidates.reduce(toRealSelection, {})
      selected = compileSelected()
      selectedCandidates = null
      dispatch.call('cell-selected-update', this, selected, active)
    }

    function toRealSelection(acc, { row, column }) {
      const columnFound = typeof column == 'string' ? columnById[column] : column
          , rowFound = typeof row == 'number' ? bundle[row] : row

      if (!columnFound || !rowFound) {
        console.warn("Couldn't find cell for", { row, column })
        return acc
      }

      const columnId = columnFound.id
          , set = acc[columnId] || new Set()

      set.add(rowFound)
      acc[columnId] = set
      return acc
    }

    function compileSelected() {
      return reduce(selectedRowsByColumnId, toCells, [])
    }

    function setupKeyboardNavEvents() {
      target.attr('tabindex', '0')
          .on('focus', debounce(setActiveIfNone, 200))
          .on(
            'keydown.keyboard-cell-selection'
          , some(
              keyCodeHandler(() => dispatch.call('cell-active-action', this, active), 13) // enter
            , keyCodeHandler(d => moveVertical(-1, d.rows), 38) // up
            , keyCodeHandler(d => moveVertical(1, d.rows), 40)  // down
            , keyCodeHandler(() => moveHorizontal(-1), 37)      // left
            , keyCodeHandler(() => moveHorizontal(1), 39)       // right
            , keyCodeHandler(onTab, 9)
            , activateFromInput
            )
          )
    }

    function setupPasteEvents() {
      select(document)
          .on(clipboardKeydown, trackPaste ? onClipMaybe : null)
          .on(clipboardKeyup, trackPaste ? onClipAfter : null)
    }

    function setupDragEvents() {
      target.call(
        cellDragBehaviour
            .on('dragstart.select', d => mouseSelection(d))
            .on('dragstart.active', setActive)
            .on('dragstart.redraw', () => target.dispatch('redraw', { bubbles: true }))

            .on('dragend.set-active', activateLastCell)
            .on('dragend.redraw', () => target.dispatch('redraw', { bubbles: true }))

            .on('dragover.select', d => mouseSelection(d, true))
            .on('dragover.cache', d => lastOverCell = d)
            .on('dragover.redraw', () => target.dispatch('redraw', { bubbles: true }))
      )
    }

    function activateLastCell() {
      if (!lastOverCell) return
      setActive(lastOverCell)
      lastOverCell = null
    }

    function onClipMaybe() {
      const targetNode = target.node()
          , allAcceptedNodes = (acceptPasteFrom || []).concat(targetNode)
          , { ctrlKey } = event

      if (!allAcceptedNodes.some(n => n.contains(document.activeElement))) return
      if (!ctrlKey) return

      clip = select(document.body)
            .select(clipboardProxy)
              .on('paste.cell-selection', onPaste)

      clip.node().focus()
      clip.node().select()

      function onPaste() {
        const clipboardData = event.clipboardData

        if (!clipboardData) { 
          isIEPasting = true
          return
        }

        const text = clipboardData.getData('Text') 
        dispatch.call('cell-active-paste', targetNode, active, text)
      }
    }

    function onClipAfter() {
      const targetNode = target.node()
          , { key } = event

      if (!key == 'Control') return

      if (isIEPasting) {
        dispatch.call('cell-active-paste', targetNode, active, clip.property('value'))
        isIEPasting = false
      }

      if (clip) {
        clip.remove()
        clip = null
        targetNode.focus()
      }
    }

    function activateFromInput() {
      const { key, ctrlKey, altKey, metaKey } = event

      if (!typeToActivate) return
      if (ctrlKey || altKey || metaKey) return
      if (!active) return
      if (isASpecialKey(key)) return

      dispatch.call('cell-active-action', target.node(), active, key)
    }

    function onTab() {
      moveHorizontal(event.shiftKey ? -1 : 1)
      event.preventDefault()
    }

    function mouseSelection(d, forceAppend) {
      const column = d.column
          , columnId = column.id
          , set = selectedRowsByColumnId[columnId]
          , row = unwrap(d.row)
          , { shiftKey, ctrlKey } = event.sourceEvent ? event.sourceEvent : event
          , cell = { row, column }
          , isAlreadySelected = set && set.has(row)
          , hasActive = !!active

      if (selectable) {
        switch(true) {
          case ctrlKey && shiftKey && hasActive:
            addRangeToSelection(active, cell)
            break

          case forceAppend || shiftKey && hasActive:
            setSelectionToRange(active, cell)
            break

          case ctrlKey && isAlreadySelected:
            removeFromSelected(cell)
            break

          case ctrlKey:
            addToSelected(cell)
            break

          default:
            selectOnly(cell)
        }

        selected = compileSelected()
        dispatch.call('cell-selected-change', this, selected, active)
      }
    }

    function setActive(cell) {

      if (!cell) {
        active = null
        return
      }

      const { row, column } = cell
      active = { row: unwrap(row), column }
      dispatch.call('cell-active-change', this, active)
    }

    function setSelectionToRange(a, b) {
      selectedRowsByColumnId = {}
      rangeFrom(a, b).forEach(addToSelected)
    }

    function addRangeToSelection(a, b) {
      rangeFrom(a, b).forEach(addToSelected)
    }

    function rangeFrom(a, b) {
      const columnRange = rangeFromUnorderedIndices(
              columns
            , columns.indexOf(a.column)
            , columns.indexOf(b.column)
            )
          , rowRange = rangeFromUnorderedIndices(
              bundle.rows
            , findIndex(bundle.rows, r => unwrap(r) == a.row)
            , findIndex(bundle.rows, r => unwrap(r) == b.row)
            ).map(unwrap)

      return rowRange.reduce(allCellsInColumns, [])

      function allCellsInColumns(acc, row) {
        return acc.concat(columnRange.map(column => ({ column, row })))
      }
    }

    function selectOnly(target) {
      selectedRowsByColumnId = {}
      addToSelected(target)
    }

    function rangeFromUnorderedIndices(array, i1, i2) {
      return array.slice(
        Math.min(i1, i2)
      , Math.max(i1, i2) + 1
      )
    }

    function removeFromSelected({ row, column }) {
      const columnId = column.id
          , set = selectedRowsByColumnId[columnId]

      if (set) set.delete(row)
    }

    function addToSelected({ row, column }) {
      const columnId = column.id
          , set = selectedRowsByColumnId[columnId] || new Set()

      set.add(row)
      selectedRowsByColumnId[columnId] = set
    }

    function toCells(acc, set, columnId) {
      const column = columnById[columnId]
      return acc.concat(Array.from(set.values()).map(row => ({ row, column })))
    }
  }

  function onCellUpdate(){
    select(this)
        .classed('is-selected', isCellSelected)
        .classed('is-active', isCellActive)
  }

  function isCellSelected(d) {
    const rowSetForColumn = selectedRowsByColumnId[d.column.id]
    return rowSetForColumn && rowSetForColumn.has(unwrap(d.row))
  }

  function isCellActive(d) {
    if (!active) return false
    return areSameCell(d, active)
  }
}

function isASpecialKey(key) {
  return key && key.length > 1
}

function areSameCell(a, b) {
  return a && b && unwrap(a.row) == unwrap(b.row) && a.column == b.column
}

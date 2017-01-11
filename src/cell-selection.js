import { dispatch  as createDispatch }  from 'd3-dispatch'
import { modulo } from '@zambezi/fun'
import { rebind, keyCodeHandler } from '@zambezi/d3-utils'
import { reduce, indexBy, findIndex, range, debounce } from 'underscore'
import { select, event } from 'd3-selection'
import { someResult as some } from '@zambezi/fun'
import { unwrap } from '@zambezi/grid'

import './cell-selection.css'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change', 'cell-active-action')

  let gesture = 'click'
    , selected = []
    , selectedCandidates
    , selectedRowsByColumnId = {}
    , active

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  cellSelection.selected = function(value) {
    if (!arguments.length) return selected
    selected = value
    selectedCandidates = value
    return cellSelection
  }

  cellSelection.active = function(value) {
    if (!arguments.length) return active
    active = value
    return cellSelection
  }

  return rebind().from(dispatch, 'on')(cellSelection)

  function cellSelectionEach(bundle, i) {
    const target = select(this)
        , columns = bundle.columns
        , columnById = indexBy(columns, 'id')

    if (selectedCandidates) updateFromCandidates()

    setupKeyboardNavEvents()

    bundle.dispatcher
        .on('cell-enter.cell-selection', onCellEnter)
        .on('cell-update.cell-selection', onCellUpdate)

    function setupKeyboardNavEvents() {
      target.attr('tabindex', '0')
          .on('focus', debounce(setActiveIfNone, 200))
          .on('blur', d => console.log('on blur'))
          .on(
            'keydown.keyboard-cell-selection'
          , some(
              keyCodeHandler(() => dispatch.call('cell-active-action', this, active), 13) // enter
            , keyCodeHandler(() => moveHorizontal(-1), 37)  // left
            , keyCodeHandler(() => moveHorizontal(1), 39)   // right
            , keyCodeHandler(onUp, 38)
            , keyCodeHandler(onDown, 40)
            , keyCodeHandler(onTab, 9)
            )
          )
    }

    function moveHorizontal(step) { 
      if (!active) return
      const { column, row } = active
      const currentColumnIndex = columns.indexOf(column)
      const newColumn = columns[modulo(currentColumnIndex + step, columns.length)]
      active = { row, column: newColumn }
      target.dispatch('redraw', { bubbles: true })
    }

    function onUp(d) { console.log('on Up', event) }
    function onDown(d) { console.log('on Down', event) }
    function onTab(d) { console.log('on Tab', event); event.preventDefault() }

    function setActiveIfNone(d) {
      if (active) return
      if (!bundle.length) return
      if (!columns.length) return
      active = { row: bundle[0], column: columns[0] }
      select(this).dispatch('redraw', { bubbles: true })
    }

    function updateFromCandidates() {
      selectedRowsByColumnId = selectedCandidates.reduce(toRealSelection, {})
      selected = compileSelected()
      selectedCandidates = null
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

    function onCellEnter(d, i) {
      select(this).on('click.cell-selection', onClick)
    }

    function onClick(d, i) {
      const column = d.column
          , columnId = column.id
          , set = selectedRowsByColumnId[columnId]
          , row = unwrap(d.row)
          , { shiftKey, ctrlKey } = event
          , target = { row, column }
          , isAlreadySelected = set && set.has(row)
          , hasActive = !!active

      switch(true) {

        case ctrlKey && shiftKey && hasActive:
          addRangeToSelection(active, target)
          break

        case shiftKey && hasActive:
          setSelectionToRange(active, target)
          break

        case ctrlKey && isAlreadySelected:
          removeFromSelected(target)
          break

        case ctrlKey:
          addToSelected(target)
          break

        default:
          selectOnly(target)
      }

      active = target
      selected = compileSelected()

      dispatch.call('cell-selected-change', this, selected, active)
      select(this).dispatch('redraw', { bubbles: true })
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
          , rows = bundle.rows
          , rowRange = rangeFromUnorderedIndices(
              rows
            , findIndex(rows, r => unwrap(r) == a.row)
            , findIndex(rows, r => unwrap(r) == b.row)
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

  function onCellUpdate(d, i){
    select(this)
        .classed('is-selected', isCellSelected)
        .classed('is-active', isCellActive)
  }

  function isCellSelected(d, i) {
    const rowSetForColumn = selectedRowsByColumnId[d.column.id]
    return rowSetForColumn && rowSetForColumn.has(unwrap(d.row))
  }

  function isCellActive(d) {
    if (!active) return false
    return areSameCell(d, active)
  }
}

function areSameCell(a, b) {
  return a && b && unwrap(a.row) == unwrap(b.row) && a.column == b.column
}

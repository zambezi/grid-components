import { isUndefined, find } from 'underscore'
import { select } from 'd3-selection'
import { appendIfMissing } from '@zambezi/d3-utils'

import './gather-rows.css'

const rowLabelClass = 'zambezi-gather-group-label'
    , rowLabel = appendIfMissing(`span.${rowLabelClass}`)

export function createGatherRows() {
  let groups = []
    , cache
    , expandedRowByLabel = {}
    , expandedByDefault = false
    , defaultExpanded = true
    , defaultPredicate = () => true
    , renderLabel = true

  function gatherRows(s) {
    s.each(gatherRowsEach)
        .on('data-dirty.gather-rows', () => cache = null)
  }

  gatherRows.defaultExpanded = function(value) {
    if (!arguments.length) return defaultExpanded
    defaultExpanded = value
    return gatherRows
  }

  gatherRows.defaultPredicate = function(value) {
    if (!arguments.length) return defaultPredicate
    defaultPredicate = value
    return gatherRows
  }

  gatherRows.groups = function(value) {
    if (!arguments.length) return groups
    groups = value
    return gatherRows
  }

  return gatherRows

  function gatherRowsEach(d, i) {
    const { dispatcher } = d
    if (!cache) cache = d.rows.reduce(gather, groups.map(completeMissingFields))
    d.rows = cache
    dispatcher.on('row-update.gather-rows', onRowUpdate)
  }

  function gather(targets, row) {
    const target = find(targets, t => t.predicate(row))
    if (!target) return targets
    target.children.push(row)
    return targets
  }

  function completeMissingFields(group) {
    group.predicate = group.predicate || defaultPredicate
    group.children = []
    group.isGroupRow = true
    if (isUndefined(group.expanded)) group.expanded = defaultExpanded
    return group
  }

  function onRowUpdate({ row }) {
    const { label, isGroupRow } = row
        , target = select(this)
        , classed = target.classed('is-gather-group-row')

    if (classed !== isGroupRow) target.classed('is-gather-group-row', isGroupRow)
    if (!isGroupRow || !renderLabel)  {
      target.select(`.${rowLabelClass}`).remove()
    } else { 
      target.select(rowLabel).text(label)
    }
  }
}

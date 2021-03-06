import { isUndefined, find } from 'underscore'
import { select, event } from 'd3-selection'
import { appendIfMissing } from '@zambezi/d3-utils'
import { unwrap } from '@zambezi/grid'

import './gather-rows.css'

const rowLabelClass = 'zambezi-gather-group-label'
const rowLabel = appendIfMissing(`span.${rowLabelClass}`)
const rowIcon = appendIfMissing('i.zambezi-group-toggle')
const rowTitle = appendIfMissing('span.zambezi-group-title')

export function createGatherRows () {
  let groups = []
  let cache
  let defaultExpanded = true
  let defaultPredicate = () => true
  let renderLabel = true

  function gatherRows (s) {
    s.each(gatherRowsEach)
        .on('data-dirty.gather-rows', () => (cache = null))
  }

  gatherRows.defaultExpanded = function (value) {
    if (!arguments.length) return defaultExpanded
    defaultExpanded = value
    return gatherRows
  }

  gatherRows.defaultPredicate = function (value) {
    if (!arguments.length) return defaultPredicate
    defaultPredicate = value
    return gatherRows
  }

  gatherRows.groups = function (value) {
    if (!arguments.length) return groups
    groups = value
    return gatherRows
  }

  return gatherRows

  function gatherRowsEach (d, i) {
    const { dispatcher } = d
    if (!cache) cache = d.rows.reduce(gather, groups.map(completeMissingFields))
    d.rows = cache
    dispatcher
      .on('row-update.gather-rows', onRowUpdate)
  }

  function gather (targets, row) {
    const target = find(targets, t => t.predicate(row))
    if (!target) return targets
    target.children.push(row)
    return targets
  }

  function completeMissingFields (group) {
    group.predicate = group.predicate || defaultPredicate
    group.children = []
    group.isGroupRow = true
    if (isUndefined(group.expanded)) group.expanded = defaultExpanded
    return group
  }

  function onRowUpdate ({ row }) {
    const { label, isGroupRow, children, expanded } = row
    const target = select(this)
    let labelTarget

    target.classed('is-gather-group-row', isGroupRow)
        .classed('has-children', isGroupRow && children && children.length)
        .classed('is-expand', isGroupRow && children.length && expanded)
        .classed('is-collapse', isGroupRow && children.length && !expanded)

    if (!isGroupRow || !renderLabel) {
      target.select(`.${rowLabelClass}`).remove()
    } else {
      labelTarget = target.select(rowLabel)
          .on('click.gather-rows', toggleRowExpansion)

      labelTarget.select(rowIcon)
      labelTarget.select(rowTitle).text(label)
    }

    function toggleRowExpansion ({ row }) {
      const unwrapped = unwrap(row)
      unwrapped.expanded = !unwrapped.expanded
      event.stopImmediatePropagation()

      select(this)
        .dispatch('data-dirty', { bubbles: true })
        .dispatch('redraw', { bubbles: true })
    }
  }
}

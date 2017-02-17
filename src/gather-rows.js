import { isUndefined, find } from 'underscore'


export function createGatherRows() {

  let groups = []
    , cache
    , expandedRowByLabel = {}
    , expandedByDefault = false
    , defaultExpanded = true
    , defaultPredicate = () => true

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
    if (!cache) cache = d.rows.reduce(gather, groups.map(completeMissingFields))
    d.rows = cache
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
    if (isUndefined(group.expanded)) group.expanded = defaultExpanded
    return group
  }
}

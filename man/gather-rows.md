## gather rows

Row grouping can be extracted from the rows themselves by using [row grouping](https://github.com/zambezi/grid/blob/master/man/grouped-rows.md) on the Zambezi grid directly.
But sometimes we might have the groups first, and we would like to gather rows around them, and have them be active even if no rows match.

The `gatherRows` component is designed for this:  you pre-define the groups, and create a predicate for each that will be tested for each row to determine on which group it belongs.
Groups are tested in order, and the first one that matches will be used.

To use, configure the component with _group_ objects, that define the label and the predicate.
These groups will become the rows under which the data rows will be nested.
The grid will also render the summary rows with `+-` expanders.

Then tell the grid to use the component by passing it to the grid's `usePre` method.


```
const gatherRows = createGatherRows()
          .groups(
            [
              {
                label: 'Usernames with dots'
              , predicate:  row => row.username.indexOf('.') >= 0
              }
            , {
                label: 'Usernames with underscores'
              , predicate:  row => row.username.indexOf('_') >= 0
              }
            , {
                label: 'Something that does not match on this dataset'
              , predicate: () => false
              }
            , {
                label: 'Other usernames'
              }
            ]
          )
    , table = grid.createGrid()
          .columns(
            [
              { key: 'name', width: 200 }
            , { key: 'username' }
            , { key: 'email' }
            , { key: 'phone' }
            ]
          )
          .usePre(gatherRows)

d3.select('.grid-target')
      .style('height', '800px')
      .datum(rows)
      .call(table)

```

### further configuration

Additional configuration is available for this component:

* Use `defaultExpanded` if you want grouped rows to be expanded by default.
* Use `defaultPredicate` to configure which predicate to use when missing from the group configuration.  By default, a catch all `() => true` is provided, so all rows that have not been set to a previous group will be caught. 

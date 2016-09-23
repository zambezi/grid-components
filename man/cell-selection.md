## cell selection

Grid level component that add the ability to select cells programmatically or by user interaction.

Cells are specified by an array of paired `{ row, column }` objects.
There is also an `active` cell, which is the last cell selected by user interaction.c

NOTE: This component must be run on the `usePre` section of the grid (not on `use`):

```javascript
const cells = gridComponents.createCellSelection()
          .on('cell-selected-change' , (selected, active) => { })

    , table = grid.createGrid()
          .usePre(cells)

target.datum(data).call(table)
```

The component exposes getter/setters for querying or programmatically modifying the `selected` and `active` cells:

```javascript
cells.selected() // ⇒  [ { row, column }, { row, column } ]
cells.active() // ⇒  { row, column }

cells.selected([ { row, column }, { row, column }])
cells.active({ row, column})

target.call(table)  // table must be redraw once the component has been
                    // reconfigured with the new selection
```

The cell selection component supports alternatively specifying selected cells by row index and column id.

```javascript
cells.selected([ { row: 1, column: 'email' }, { row: 2, column: 'name' } ])
```

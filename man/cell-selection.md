## cell selection

Grid level component that add the ability to select cells programmatically or by user interaction.

Cells are specified by an array of paired `{ row, column }` objects.
There is also an `active` cell, which is the last cell selected by user interaction.

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
cells.selected()      // ⇒  [ { row, column }, { row, column } ]
cells.active()        // ⇒  { row, column }

cells.selected([ { row, column }, { row, column }])
cells.active({ row, column})

target.call(table)    // table must be redrawn once the component has been
                      // reconfigured with the new selection
```

The cell selection component supports alternatively specifying selected cells by row index and column id.

```javascript
cells.selected([ { row: 1, column: 'email' }, { row: 2, column: 'name' } ])
```

### keeping selection on data refresh 

By default the set of selected cells will be dependent of the identity of the underlying row objects.
On some cases, though, the grid will be redrawn with rows that are _logically_ the same, but not the same object reference.

For these cases you'll want to provide the component with a `rowSelectionKey` function that can be used to map the row object to a local identifier string that can be used to recognize the new row.

For example, if you can recognize a row by the `phone` field of its rows, you could do:

``` javascript
const cellSelection = gridComponents.createCellSelection()
      .rowSelectionKey(r => r.phone)
      // .etc.
```

### supported user interactions

The cell selection component supports 

* click and drag to select cell groups.
* shift + control to add to selected cell sets.
* keyboard arrows to move the active cell.

### cell selection events 

* `cell-selected-change`: the selected cells have changed by user interaction-- the handler will receive the  new list of selected cells (`{column, rows}` pairs). 
* `cell-active-change`: the active cell has changed by user interaction -- the handler will receive the new selected cell.
* `cell-selected-update`: the selected cells have been programmatically changed -- the handler will receive the  new list of selected cells (`{column, rows}` pairs). 
* `cell-active-update`: the active cell has been programmatically changed -- the handler will receive the new selected cell.

### additional cell related events

These other events allow _active cell_ context to be given to user interaction gestures:

* `cell-active-paste`: will dispatch if the grid is focused and someone pastes text from the clipboard -- it will provide the context of the active cell as well as a string with the clipboard contents.
* `cell-active-action`: will dispatch if the grid is focused and the user start typing.  The handler will receive the active cell and the _initial value_ from the typed text.

### additional highlight for active and selected cells

These two external components provide additional highlight layers if so needed:

```
grid
    .usePre(cellSelection)
    .use(highlightActiveCell)
    .use(highlightSelectedCells)
```

For these to work make sure you wire them up to the cell selection component:

```
, cellSelection = gridComponents.createCellSelection()
      .on('cell-active-change.highlight', highlightActiveCell.activeCell)
      .on('cell-selected-change.highlight', highlightSelectedCells.selectedCells)
```

For a full example, check `keyboard-cell-selection.html` under the `examples` folder.

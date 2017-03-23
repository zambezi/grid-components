`row-selection` is a simple component that will automatically highlight the active row.
A row can be made active by clicking on it.

To use this component, create an instance of it and configure it to run on by using the `usePre` method on the grid.

```
const rowSelection = gridComponents.createRowSelection()
    , table = grid.createGrid()
          .columns(
            [
              { key: 'name', width: 200 }
            , { key: 'username' }
            , { key: 'email' }
            , { key: 'phone' }
            ]
          )
          .usePre(rowSelection)
```

You can list to the `active-row-change` event to get the row as it is selected.

```
const rowSelection = gridComponents.createRowSelection()
    .on('row-active-change.log', r => console.log('row active change', r))
```

The active row is also available through the `active` getter/setter on the component.
You can also set the row and redraw the grid to see the active row change reflected.

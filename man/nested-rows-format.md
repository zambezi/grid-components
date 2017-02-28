## nested row format

The grid natively supports [nested rows](https://github.com/zambezi/grid/blob/master/man/nested-rows.md) as well as automatically nested rows from [groups](https://github.com/zambezi/grid/blob/master/man/grouped-rows.md) or from the [gather rows](./gather-rows.md) component on this repository.

Often, however, the rows at different nest depths mean different things and creating a 
[per column formatter](https://github.com/zambezi/grid/blob/master/man/column-configuration.md#column-formatters) that will understand this can become tricky.

The `nestedRowFormat` function allows you to assign formatters that will be applied depending on the nest level of the row.

```
table = grid.createGrid()
    .columns(
      [
        /// ....
      , {
          label: 'Price'
        , format: nestedRowFormat(
            priceSummary    // formatter for top level rows
          , r => r.price    // formatter for first level nested rows 
          )
        }
      ]
    )
```

This function supports arbitrarily nested rows.
The last formatter will be used for rows that level and deeper.

The `nestedRowFormat` function creates [functors](https://github.com/zambezi/fun/blob/master/man/functor.md)  for its arguments, so you can provide string instead of functions and these will be used for rows of that level.
A common use case for this is returning an empty string for levels that shouldn't have anything on them:


```
  .columns(
    [
      {
        format: nestedRowFormat(
          summary   // display a summary header
        , ''        // and nothing on the nested rows
        )
        // etc.
      }

      // etc.
    ]
  )
```

Check the `gather-rows.html` example on the `examples` folder for a live example.

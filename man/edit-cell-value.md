## edit cell value

Column component that allows free-text input on grid cells.

Supports,

* Programmatic validation
* Validation indication
* Programmatic configuration of which cells are editable.
* Programmatic configuration of input character class constraints.
* Invalid cells in editing support virtualization (being scrolled out, then back in)

The following example, available for running on the `/examples/edit-cells.html` file.
Showcases the `edit-cell-value` configuration.

* Username cannot be empty
* Username cannot use only one letter
* Character class for input: Only uppercase and lower case ASCII characters and numbers between 0 and 5 can used to input usernames.
* Non editable cells: Cells for rows in which the username begins with "Zac" cannot be edited
* Processing: Client can decide how to consolidate the change; in this case, it is turned into upper case

```javascript
var table = grid.createGrid()
        .columns(
          [
            { key: 'name', locked: 'left', width: 200 }
          , {
              key: 'username'
            , components: [
                gridComponents.createEditCellValue()
                    .on('change', onUsernameChange)
                    .on('validationerror', console.error.bind(console, 'VALIDATION'))
                    .characterClass('A-Za-z0-5')
                    .validate(validateUserName)
                    .editable(isNotZack)

              , grid.updateTextIfChanged
              ]
            }
          , { key: 'email', sortDescending: true }
          , { key: 'phone' }
          ]
        )
  , rows = _.range(1, 2000).map(faker.Helpers.createCard)

d3.select('.grid-target')
    .style('height', '500px')
    .datum(rows)
    .call(table)

function onUsernameChange(row, value) {
  row.username = value.toUpperCase()
}

function validateUserName(row, value) {
  if (!value) return 'Username cannot be empty'
  if (!value.split('').some(isDifferentCharacter())) return 'Cannot all be the same character'
}

function isDifferentCharacter() {
  let found
  return function check(ch) {
    if (found && !~found.indexOf(ch)) return true
    found = ch
    return false
  }
}

function isNotZack(cell) {
  return cell.row.username.indexOf('Zac') !== 0
}
```

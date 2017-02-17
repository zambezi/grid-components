export function createGatherRows() {
  function gatherRows(s) {
    s.each(gatherRowsEach)
  }

  return gatherRows

  function gatherRowsEach(d, i) {
    console.log('gather rows component running on', this, d)
  }
}




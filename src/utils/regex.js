// Create a generator for regex exec matches
// https://stackoverflow.com/a/40398479
const regex = {
  execAllGen: function*(regex, input) {
    for (let match; (match = regex.exec(input)) !== null;)
      yield match;
  },

  execAll: function(regex, input) {
    return [...this.execAllGen(regex, input)];
  }
}

export default regex;
// Create our own module
const today = new Date();
exports.getDate = function() {
  let options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };

  return today.toLocaleDateString('en-GB', options);
}

exports.getDay = function () {
  let options = {
    weekday: 'long',
  };

  return today.toLocaleDateString('en-GB', options);
}

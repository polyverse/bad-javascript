// bad - who cares about errors
exports.getUsers = (req, res) => {
  User.find({})
    .exec((err, data) => {
      res.send(data);
    });
};
module.exports = exports;

// good - we care about errors
exports.getUsers = (req, res) => {
  User.find({})
    .exec((err, data) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.send(data);
      }
    });
};
module.exports = exports;

// classic
return isDisabled == false ? false : true;

// why trust typeof
function clean(toClean, source) {
  if (typeof (toClean) !== 'string') return true;
  if (typeof (source) !== 'string') return true;

  return source.replace(toClean, String('CLEANED')).toString();
}
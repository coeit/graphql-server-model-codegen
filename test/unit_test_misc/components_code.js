module.exports.count_in_sequelize_model = `
static countRecords(search){
  let options = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }
  return super.count(options);
}
`

module.exports.count_in_webservice_model = `
static countRecords(search){

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countPubli_shers is not implemented');
}
`

module.exports.count_in_resolvers = `
/**
 * countDogs - Count number of records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} Search argument for filtering records
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {number}          Number of records that holds the conditions specified in the search argument
 */
countDogs: function({
    search
}, context) {
    return checkAuthorization(context, 'Dog', 'read').then(authorization => {
        if (authorization === true) {
            return dog.countRecords(search);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.individual_schema = `
countIndividuals(search: searchIndividualInput ): Int
`

module.exports.individual_resolvers = `
/**
 * countIndividuals - Count number of records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} Search argument for filtering records
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {number}          Number of records that holds the conditions specified in the search argument
 */
countIndividuals: function({
    search
}, context) {
    return checkAuthorization(context, 'individual', 'read').then(authorization => {
        if (authorization === true) {
            return individual.countRecords(search);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        handleError(error);
    })
}
`

module.exports.specie_resolvers = `
/**
 * countSpecies - Counts the number of records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} Search argument for filtering records
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {number}          Number of records that holds the conditions specified in the search argument
 */
countSpecies: function({search}, context){
  return specie.countRecords(search);
},
`

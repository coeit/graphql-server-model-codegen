module.exports.dog_owner_resolvers = `
/**
 * dog.prototype.owner - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.owner = function(_, context) {
    return resolvers.readOnePerson({
        "id": this.owner_id_test
    }, context);
}
`

module.exports.dog_owner_schema = `
    owner: Person
`

module.exports.dog_owner_model = `
Dog.belongsTo(models.person, {
    as: 'owner',
    foreignKey: 'owner_id_test'
});
`

module.exports.academicTeam_resolvers = `
/**
 * academicTeam.prototype.membersFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
academicTeam.prototype.membersFilter = function({
    search,
    order,
    pagination
}, context) {
    if (search === undefined) {
        return resolvers.researchers({
            "search": {
                "field": "academicTeamId",
                "value": {
                    "value": this.id
                },
                "operator": "eq"
            },
            order,
            pagination
        }, context);
    } else {
        return resolvers.researchers({
            "search": {
                "operator": "and",
                "search": [{
                    "field": "academicTeamId",
                    "value": {
                        "value": this.id
                    },
                    "operator": "eq"
                }, search]
            },
            order,
            pagination
        }, context)
    }
}
`

module.exports.academicTeam_schema = `
"""
@search-request
"""
membersFilter(search: searchResearcherInput, order: [ orderResearcherInput ], pagination: paginationInput): [Researcher]
`

module.exports.academicTeam_model = `
academicTeam.hasMany(models.researcher, {
    as: 'members',
    foreignKey: 'academicTeamId'
});
`

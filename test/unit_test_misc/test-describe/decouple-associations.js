module.exports.belongsTo_resolver  = `

/**
 * dog.prototype.researcher - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.researcher = function({search }, context) {
    return this.researcherImpl(search);
}
`

module.exports.belongsTo_model = `
researcherImpl(search){
 if(search === undefined){
   return models.researcher.readById( this.researcherId );
 }else{
   let id_search = {
       "field": "id",
       "value": {
         "value": this.researcherId
       },
       "operator": "eq"
   }

   let ext_search = {
     "operator": "and",
     "search": [id_search, search]
   }

   return models.researcher.readAll(ext_search)
   .then( found =>{
       if(found){
         return found[0]
       }
       return found;
   });
 }
}
`

module.exports.hasOne_resolver = `
/**
 * researcher.prototype.dog - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
researcher.prototype.dog = function({search}, context) {
   return this.dogImpl(search);
}

`
module.exports.hasOne_model = `
dogImpl(search){

  let simple_search = {
        "field": "researcherId",
        "value": {
        "value": this.id
          },
        "operator": "eq"
      }
  let ext_search = simple_search;

  if(search !== undefined){
    ext_search = {
      "operator": "and",
      "search": [simple_search, search]
    }
  }

  return models.dog.readAll(ext_search)
  .then(found =>{ if(found){
    return found[0];
  }
    return found;
  })

}

`

module.exports.belongsTo_schema = `
  researcher(search: searchResearcherInput) : Researcher
`

module.exports.hasOne_schema = `
  dog(search: searchDogInput): Dog

`

module.exports.hasMany_model = `
transcript_countsFilterImpl({
    search,
    order,
    pagination
}){

  if (search === undefined) {
      return models.transcript_count.readAll( {
              "field": "individual_id",
              "value": {
                  "value": this.id
              },
              "operator": "eq"
          },
          order,
          pagination);
  } else {
      return models.transcript_count.readAll({
              "operator": "and",
              "search": [{
                  "field": "individual_id",
                  "value": {
                      "value": this.id
                  },
                  "operator": "eq"
              }, search]
          },
          order,
          pagination)
  }
}
`

module.exports.hasMany_resolver = `
/**
 * individual.prototype.transcript_countsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
individual.prototype.transcript_countsFilter = function({
    search,
    order,
    pagination
}, context) {
  return this.transcript_countsFilterImpl({search, order, pagination});
}
`

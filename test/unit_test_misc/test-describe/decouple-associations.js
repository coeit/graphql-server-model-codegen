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

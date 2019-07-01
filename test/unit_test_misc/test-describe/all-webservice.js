module.exports.schema_book = `
type book{
  """
  @original-field
  """
  id: ID

  """
  @original-field
  """
  title: String

  """
  @original-field
  """
  subject: String

  """
  @original-field
  """
  Price: Float

  """
  @original-field
  """
  publisher_id: Int

  publisher: publi_sher

  """
  @search-request
  """
  authorsFilter(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput): [Person]

  """
  @count-request
  """
  countFilteredAuthors(search: searchPersonInput) : Int
}

`
module.exports.model_book = `
/**
 * constructor - Creates an instance of the model stored in webservice
 *
 * @param  {obejct} input    Data for the new instances. Input for each field of the model.
 */

constructor({
    id,
    title,
    subject,
    Price,
    publisher_id
}) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.Price = Price;
    this.publisher_id = publisher_id;
}
`

module.exports.resolvers_book = `
/**
 * book.prototype.publisher - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
book.prototype.publisher = function(_, context) {
    return resolvers.readOnePubli_sher({
        "id": this.publisher_id
    }, context);
}

`

module.exports.schema_person = `
type Query {
  people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
  readOnePerson(id: ID!): Person
  countPeople(search: searchPersonInput ): Int
  vueTablePerson : VueTablePerson    csvTableTemplatePerson: [String]
}

  type Mutation {
    addPerson( firstName: String, lastName: String, Age: Int, companyId: Int): Person!
  updatePerson(id: ID!, firstName: String, lastName: String, Age: Int, companyId: Int): Person!


deletePerson(id: ID!): String!
bulkAddPersonXlsx: [Person]
bulkAddPersonCsv: [Person] }

`
module.exports.model_person = `
static readById( id ){
  /*
  YOUR CODE GOES HERE
  */
  throw new Error('readOnePerson is not implemented');
}
`

module.exports.resolvers_person = `
person.prototype.worksFilter = function({
    search,
    order,
    pagination
}, context) {

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('worksFilter is not implemented');

}

`

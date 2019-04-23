module.exports.model_book = `
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'book',
    storageType: 'webservice',
    attributes: {
        title: 'String',
        subject: 'String',
        Price: 'Float',
        publisher_id: 'Int'
    },
    associations: {
        publisher: {
            type: 'belongsTo',
            target: 'publi_sher',
            targetKey: 'publisher_id',
            targetStorageType: 'webservice',
            name: 'publisher',
            name_lc: 'publisher',
            name_cp: 'Publisher',
            target_lc: 'publi_sher',
            target_lc_pl: 'publi_shers',
            target_pl: 'publi_shers',
            target_cp: 'Publi_sher',
            target_cp_pl: 'Publi_shers'
        },
        authors: {
            type: 'belongsToMany',
            target: 'Person',
            targetKey: 'person_id',
            sourceKey: 'book_id',
            targetStorageType: 'webservice',
            name: 'authors',
            name_lc: 'authors',
            name_cp: 'Authors',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People'
        }
    }
};

module.exports = class book {

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

    static get definition() {
        return definition;
    }
};
`

module.exports.schema_book = `
module.exports = \`
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

  type VueTableBook{
    data : [book]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum bookField {
    id 
    title  
    subject  
    Price  
    publisher_id  
  }

  input searchBookInput {
    field: bookField
    value: typeValue
    operator: Operator
    search: [searchBookInput]
  }

  input orderBookInput{
    field: bookField
    order: Order
  }

  type Query {
    books(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput ): [book]
    readOneBook(id: ID!): book
    countBooks(search: searchBookInput ): Int
    vueTableBook : VueTableBook    csvTableTemplateBook: [String]
  }

    type Mutation {
      addBook( title: String, subject: String, Price: Float, publisher_id: Int): book!
    updateBook(id: ID!, title: String, subject: String, Price: Float, publisher_id: Int): book!
  

  deleteBook(id: ID!): String!
  bulkAddBookXlsx: [book]
  bulkAddBookCsv: [book] }

\`;
`

module.exports.resolvers_book = `
const book = require('../models-webservice/book');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');

/**
 * book.prototype.authorsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
book.prototype.authorsFilter = function({
    search,
    order,
    pagination
}, context) {

  /*
  YOUR CODE GOES HERE
  */
  throw new Error('authorsFilter is not implemented');
}

/**
 * book.prototype.countFilteredAuthors - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredAuthors = function({search},context){
  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countFilteredAuthors is not implemented');
}


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

module.exports = {

  /**
   * books - Returns certain number, specified in pagination argument, of records that
   * holds the condition of search argument, all of them sorted as specified by the order argument.
   *
   * @param  {object} search     Search argument for filtering records
   * @param  {array} order       Type of sorting (ASC, DESC) for each field
   * @param  {object} pagination Offset and limit to get the records from and to respectively
   * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
   * @return {array}             Array of records holding conditions specified by search, order and pagination argument
   */
    books: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('books is not implemented');
    },

    /**
     * readOneBook - Returns one record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneBook: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('readOneBook is not implemented');
    },

    /**
     * addBook - Creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
     addBook: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('addBook is not implemented');
     },

     /**
      * bulkAddBookXlsx - Load xlsx file of records NO STREAM
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddBookXlsx: function(_, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddBookXlsx is not implemented');
     },

     /**
      * bulkAddBookCsv - Load csv file of records
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddBookCsv: function(_, context) {
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddBookCsv is not implemented');
     },

     /**
      * deleteBook - Deletes a record with the specified id in the id argument.
      *
      * @param  {number} {id}    Id of the record to delete
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {string}         Message indicating if deletion was successfull.
      */
     deleteBook: function({id}, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('deleteBook is not implemented');
     },

     /**
      * updateBook - Updates the record specified in the input argument
      *
      * @param  {object} input   record to update and new info to update
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {object}         Updated record
      */
     updateBook: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('updateBook is not implemented');
     },

     /**
      * countBooks - Counts the number of records that holds the conditions specified in the search argument
      *
      * @param  {object} {search} Search argument for filtering records
      * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {number}          Number of records that holds the conditions specified in the search argument
      */
    countBooks: function({search}, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('countBooks is not implemented');
    },

    /**
     * vueTableBook - Returns table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableBook: function(_,context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('vueTableBook is not implemented');
    },

    /**
     * csvTableTemplateBook - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateBook: function(_, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('csvTableTemplateBook is not implemented');
    }
}
`

module.exports.model_publisher = `
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'publi_sher',
    storageType: 'webservice',
    attributes: {
        name: 'String',
        phone: 'String'
    },
    associations: {
        publications: {
            type: 'hasMany',
            target: 'book',
            targetKey: 'publisher_id',
            targetStorageType: 'webservice',
            name: 'publications',
            name_lc: 'publications',
            name_cp: 'Publications',
            target_lc: 'book',
            target_lc_pl: 'books',
            target_pl: 'books',
            target_cp: 'Book',
            target_cp_pl: 'Books'
        },
        director: {
            type: 'hasOne',
            target: 'Person',
            targetKey: 'companyId',
            targetStorageType: 'webservice',
            name: 'director',
            name_lc: 'director',
            name_cp: 'Director',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People'
        }
    }
};

module.exports = class publi_sher {

    /**
     * constructor - Creates an instance of the model stored in webservice
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        id,
        name,
        phone
    }) {
        this.id = id;
        this.name = name;
        this.phone = phone;
    }

    static get definition() {
        return definition;
    }
};
`

module.exports.schema_publisher = `
module.exports = \`
  type publi_sher{
    """
    @original-field
    """
    id: ID

    """
    @original-field
    """
    name: String

    """
    @original-field
    """
    phone: String

    director: Person
    
    """
    @search-request
    """
    publicationsFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [book]

    """
    @count-request
    """
    countFilteredPublications(search: searchBookInput) : Int
  }

  type VueTablePubli_sher{
    data : [publi_sher]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum publi_sherField {
    id 
    name  
    phone  
  }

  input searchPubli_sherInput {
    field: publi_sherField
    value: typeValue
    operator: Operator
    search: [searchPubli_sherInput]
  }

  input orderPubli_sherInput{
    field: publi_sherField
    order: Order
  }

  type Query {
    publi_shers(search: searchPubli_sherInput, order: [ orderPubli_sherInput ], pagination: paginationInput ): [publi_sher]
    readOnePubli_sher(id: ID!): publi_sher
    countPubli_shers(search: searchPubli_sherInput ): Int
    vueTablePubli_sher : VueTablePubli_sher    csvTableTemplatePubli_sher: [String]
  }

    type Mutation {
      addPubli_sher( name: String, phone: String): publi_sher!
    updatePubli_sher(id: ID!, name: String, phone: String): publi_sher!
  

  deletePubli_sher(id: ID!): String!
  bulkAddPubli_sherXlsx: [publi_sher]
  bulkAddPubli_sherCsv: [publi_sher] }

\`;
`

module.exports.resolvers_publisher = `
const publi_sher = require('../models-webservice/publi_sher');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');

/**
 * publi_sher.prototype.publicationsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
publi_sher.prototype.publicationsFilter = function({
    search,
    order,
    pagination
}, context) {

  if(search === undefined)
  {
    return resolvers.books({"search":{"field" : "publisher_id", "value":{"value":this.id }, "operator": "eq"}, order, pagination},context);
  }else{
    return resolvers.books({"search":{"operator":"and", "search":[ {"field" : "publisher_id", "value":{"value":this.id }, "operator": "eq"} , search] }, order, pagination },context)
  }
}

/**
 * publi_sher.prototype.countFilteredPublications - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
publi_sher.prototype.countFilteredPublications = function({search},context){

  if(search === undefined)
  {
    return resolvers.countBooks({"search":{"field" : "publisher_id", "value":{"value":this.id }, "operator": "eq"} }, context);
  }else{
    return resolvers.countBooks({"search":{"operator":"and", "search":[ {"field" : "publisher_id", "value":{"value":this.id }, "operator": "eq"} , search] }},context)
  }
}


/**
 * publi_sher.prototype.director - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
publi_sher.prototype.director = function(_, context) {

  return resolvers.people({"search":{"field" : "companyId", "value":{"value":this.id }, "operator": "eq" } },context)
  .then((res)=>{
    return res[0];
  }).catch( error => {
    throw new Error(error);
  });
}

module.exports = {

  /**
   * publi_shers - Returns certain number, specified in pagination argument, of records that
   * holds the condition of search argument, all of them sorted as specified by the order argument.
   *
   * @param  {object} search     Search argument for filtering records
   * @param  {array} order       Type of sorting (ASC, DESC) for each field
   * @param  {object} pagination Offset and limit to get the records from and to respectively
   * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
   * @return {array}             Array of records holding conditions specified by search, order and pagination argument
   */
    publi_shers: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('publi_shers is not implemented');
    },

    /**
     * readOnePubli_sher - Returns one record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOnePubli_sher: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('readOnePubli_sher is not implemented');
    },

    /**
     * addPubli_sher - Creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
     addPubli_sher: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('addPubli_sher is not implemented');
     },

     /**
      * bulkAddPubli_sherXlsx - Load xlsx file of records NO STREAM
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddPubli_sherXlsx: function(_, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddPubli_sherXlsx is not implemented');
     },

     /**
      * bulkAddPubli_sherCsv - Load csv file of records
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddPubli_sherCsv: function(_, context) {
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddPubli_sherCsv is not implemented');
     },

     /**
      * deletePubli_sher - Deletes a record with the specified id in the id argument.
      *
      * @param  {number} {id}    Id of the record to delete
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {string}         Message indicating if deletion was successfull.
      */
     deletePubli_sher: function({id}, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('deletePubli_sher is not implemented');
     },

     /**
      * updatePubli_sher - Updates the record specified in the input argument
      *
      * @param  {object} input   record to update and new info to update
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {object}         Updated record
      */
     updatePubli_sher: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('updatePubli_sher is not implemented');
     },

     /**
      * countPubli_shers - Counts the number of records that holds the conditions specified in the search argument
      *
      * @param  {object} {search} Search argument for filtering records
      * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {number}          Number of records that holds the conditions specified in the search argument
      */
    countPubli_shers: function({search}, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('countPubli_shers is not implemented');
    },

    /**
     * vueTablePubli_sher - Returns table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePubli_sher: function(_,context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('vueTablePubli_sher is not implemented');
    },

    /**
     * csvTableTemplatePubli_sher - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplatePubli_sher: function(_, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('csvTableTemplatePubli_sher is not implemented');
    }
}

`

module.exports.model_person = `
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'Person',
    storageType: 'webservice',
    attributes: {
        firstName: 'String',
        lastName: 'String',
        Age: 'Int',
        companyId: 'Int'
    },
    associations: {
        works: {
            type: 'belongsToMany',
            target: 'book',
            targetKey: 'book_id',
            sourceKey: 'person_id',
            targetStorageType: 'webservice',
            name: 'works',
            name_lc: 'works',
            name_cp: 'Works',
            target_lc: 'book',
            target_lc_pl: 'books',
            target_pl: 'books',
            target_cp: 'Book',
            target_cp_pl: 'Books'
        },
        company: {
            type: 'belongsTo',
            target: 'publi_sher',
            targetKey: 'companyId',
            targetStorageType: 'webservice',
            name: 'company',
            name_lc: 'company',
            name_cp: 'Company',
            target_lc: 'publi_sher',
            target_lc_pl: 'publi_shers',
            target_pl: 'publi_shers',
            target_cp: 'Publi_sher',
            target_cp_pl: 'Publi_shers'
        }
    }
};

module.exports = class person {

    /**
     * constructor - Creates an instance of the model stored in webservice
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        id,
        firstName,
        lastName,
        Age,
        companyId
    }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.Age = Age;
        this.companyId = companyId;
    }

    static get definition() {
        return definition;
    }
};
`

module.exports.schema_person = `
module.exports = \`
  type Person{
    """
    @original-field
    """
    id: ID

    """
    @original-field
    """
    firstName: String

    """
    @original-field
    """
    lastName: String

    """
    @original-field
    """
    Age: Int

    """
    @original-field
    """
    companyId: Int

    company: publi_sher
    
    """
    @search-request
    """
    worksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [book]

    """
    @count-request
    """
    countFilteredWorks(search: searchBookInput) : Int
  }

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum PersonField {
    id 
    firstName  
    lastName  
    Age  
    companyId  
  }

  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }

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

\`;
`

module.exports.resolvers_person = `
const person = require('../models-webservice/person');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');

/**
 * person.prototype.worksFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
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

/**
 * person.prototype.countFilteredWorks - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
person.prototype.countFilteredWorks = function({search},context){
  /*
  YOUR CODE GOES HERE
  */
  throw new Error('countFilteredWorks is not implemented');
}


/**
 * person.prototype.company - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
person.prototype.company = function(_, context) {
    return resolvers.readOnePubli_sher({
        "id": this.companyId
    }, context);
}

module.exports = {

  /**
   * people - Returns certain number, specified in pagination argument, of records that
   * holds the condition of search argument, all of them sorted as specified by the order argument.
   *
   * @param  {object} search     Search argument for filtering records
   * @param  {array} order       Type of sorting (ASC, DESC) for each field
   * @param  {object} pagination Offset and limit to get the records from and to respectively
   * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
   * @return {array}             Array of records holding conditions specified by search, order and pagination argument
   */
    people: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('people is not implemented');
    },

    /**
     * readOnePerson - Returns one record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOnePerson: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */

        throw new Error('readOnePerson is not implemented');
    },

    /**
     * addPerson - Creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
     addPerson: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('addPerson is not implemented');
     },

     /**
      * bulkAddPersonXlsx - Load xlsx file of records NO STREAM
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddPersonXlsx: function(_, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddPersonXlsx is not implemented');
     },

     /**
      * bulkAddPersonCsv - Load csv file of records
      *
      * @param  {string} _       First parameter is not used
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      */
     bulkAddPersonCsv: function(_, context) {
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('bulkAddPersonCsv is not implemented');
     },

     /**
      * deletePerson - Deletes a record with the specified id in the id argument.
      *
      * @param  {number} {id}    Id of the record to delete
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {string}         Message indicating if deletion was successfull.
      */
     deletePerson: function({id}, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('deletePerson is not implemented');
     },

     /**
      * updatePerson - Updates the record specified in the input argument
      *
      * @param  {object} input   record to update and new info to update
      * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {object}         Updated record
      */
     updatePerson: function(input, context){
       /*
       YOUR CODE GOES HERE
       */
       throw new Error('updatePerson is not implemented');
     },

     /**
      * countPeople - Counts the number of records that holds the conditions specified in the search argument
      *
      * @param  {object} {search} Search argument for filtering records
      * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
      * @return {number}          Number of records that holds the conditions specified in the search argument
      */
    countPeople: function({search}, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('countPeople is not implemented');
    },

    /**
     * vueTablePerson - Returns table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePerson: function(_,context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('vueTablePerson is not implemented');
    },

    /**
     * csvTableTemplatePerson - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplatePerson: function(_, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('csvTableTemplatePerson is not implemented');
    }
}
`

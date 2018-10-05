module.exports.transcript_countSchema = `
module.exports = \`
  type transcript_count  {
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
        individual: individual
    }

  enum transcript_countField {
    id
    gene
    variable
    count
    tissue_or_condition
  }

  input searchTranscript_countInput {
    field: transcript_countField
    value: typeValue
    operator: Operator
    searchArg: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(input: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
  }

    type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int   ): transcript_count
    deleteTranscript_count(id: ID!): String!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int  ): transcript_count!
    bulkAddTranscript_countXlsx: [transcript_count]
    bulkAddTranscript_countCsv: [transcript_count]
}
  \`;

`

module.exports.individualResolvers = `
/*
    Resolvers for basic CRUD operations
*/

const individual = require('../models/index').individual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const globals = require('../config/globals');
var checkAuthorization = require('../utils/check-authorization');


individual.prototype.transcript_countsFilter = function({
    input,
    order,
    pagination
}, context) {

    let options = {};

    if (input !== undefined) {
        let arg = new searchArg(input);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countTranscript_counts(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total transcript_countsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getTranscript_counts(options);
    }).catch(error => {
        console.log("Catched the error in transcript_countsFilter ", error);
        return error;
    });
}



module.exports = {

    individuals: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            let options = {};
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return individual.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total individuals exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return individual.findAll(options);
            }).catch(error => {
                console.log("Catched the error in individuals ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return individual.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'create') == true) {
            return individual.create(input)
                .then(individual => {
                    return individual;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddIndividualXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return individual.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddIndividualCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return individual.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deleteIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'delete') == true) {
            return individual.findById(id)
                .then(individual => {
                    return individual.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'update') == true) {
            return individual.findById(input.id)
                .then(individual => {
                    return individual.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.individualModel = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var individual = sequelize.define('individual', {

        name: {
            type: Sequelize.STRING
        }
    });

    individual.associate = function(models) {
        individual.hasMany(models.transcript_count, {
            foreignKey: 'individual_id'
        });
    };

    return individual;
};
`

module.exports.transcript_count_no_assoc_schema = `
module.exports = \`
  type transcript_count  {
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
      }

  enum transcript_countField {
    id
    gene
    variable
    count
    tissue_or_condition
  }

  input searchTranscript_countInput {
    field: transcript_countField
    value: typeValue
    operator: Operator
    searchArg: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(input: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
  }

    type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String ): transcript_count
    deleteTranscript_count(id: ID!): String!
    updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String): transcript_count!
    bulkAddTranscript_countXlsx: [transcript_count]
    bulkAddTranscript_countCsv: [transcript_count]
}
  \`;
`

module.exports.individual_no_assoc_resolvers = `
/*
    Resolvers for basic CRUD operations
*/

const individual = require('../models/index').individual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const globals = require('../config/globals');
var checkAuthorization = require('../utils/check-authorization');

module.exports = {

    individuals: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            let options = {};
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return individual.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total individuals exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return individual.findAll(options);
            }).catch(error => {
                console.log("Catched the error in individuals ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'read') == true) {
            return individual.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'create') == true) {
            return individual.create(input)
                .then(individual => {
                    return individual;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddIndividualXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return individual.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddIndividualCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return individual.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deleteIndividual: function({
        id
    }, context) {
        if (checkAuthorization(context, 'individuals', 'delete') == true) {
            return individual.findById(id)
                .then(individual => {
                    return individual.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateIndividual: function(input, context) {
        if (checkAuthorization(context, 'individuals', 'update') == true) {
            return individual.findById(input.id)
                .then(individual => {
                    return individual.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.transcript_count_no_assoc_model = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var transcript_count = sequelize.define('transcript_count', {

        gene: {
            type: Sequelize.STRING
        },
        variable: {
            type: Sequelize.STRING
        },
        count: {
            type: Sequelize.FLOAT
        },
        tissue_or_condition: {
            type: Sequelize.STRING
        }
    });

    transcript_count.associate = function(models) {};

    return transcript_count;
};
`
module.exports.individual_no_assoc_model = `
'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var individual = sequelize.define('individual', {

        name: {
            type: Sequelize.STRING
        }
    });

    individual.associate = function(models) {};

    return individual;
};
`

module.exports.transcript_count_no_assoc_migration = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('transcript_counts', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            gene: {
                type: Sequelize.STRING
            },
            variable: {
                type: Sequelize.STRING
            },
            count: {
                type: Sequelize.FLOAT
            },
            tissue_or_condition: {
                type: Sequelize.STRING
            }

        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('transcript_counts');
    }

};
`

module.exports.transcript_count_resolvers =`
/*
    Resolvers for basic CRUD operations
*/

const transcript_count = require('../models/index').transcript_count;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const globals = require('../config/globals');
var checkAuthorization = require('../utils/check-authorization');

transcript_count.prototype.individual = function(_, context) {
    return this.getIndividual();
}




module.exports = {

    transcript_counts: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'read') == true) {
            let options = {};
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return transcript_count.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total transcript_counts exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return transcript_count.findAll(options);
            }).catch(error => {
                console.log("Catched the error in transcript_counts ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneTranscript_count: function({
        id
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'read') == true) {
            return transcript_count.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addTranscript_count: function(input, context) {
        if (checkAuthorization(context, 'transcript_counts', 'create') == true) {
            return transcript_count.create(input)
                .then(transcript_count => {
                    return transcript_count;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddTranscript_countXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return transcript_count.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddTranscript_countCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return transcript_count.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deleteTranscript_count: function({
        id
    }, context) {
        if (checkAuthorization(context, 'transcript_counts', 'delete') == true) {
            return transcript_count.findById(id)
                .then(transcript_count => {
                    return transcript_count.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateTranscript_count: function(input, context) {
        if (checkAuthorization(context, 'transcript_counts', 'update') == true) {
            return transcript_count.findById(input.id)
                .then(transcript_count => {
                    return transcript_count.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.person_resolvers = `
/*
    Resolvers for basic CRUD operations
*/

const person = require('../models/index').person;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const globals = require('../config/globals');
var checkAuthorization = require('../utils/check-authorization');


person.prototype.dogsFilter = function({
    input,
    order,
    pagination
}, context) {

    let options = {};

    if (input !== undefined) {
        let arg = new searchArg(input);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countDogs(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total dogsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getDogs(options);
    }).catch(error => {
        console.log("Catched the error in dogsFilter ", error);
        return error;
    });
}
person.prototype.booksFilter = function({
    input,
    order,
    pagination
}, context) {

    let options = {};

    if (input !== undefined) {
        let arg = new searchArg(input);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countBooks(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(\`Request of total booksFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getBooks(options);
    }).catch(error => {
        console.log("Catched the error in booksFilter ", error);
        return error;
    });
}



module.exports = {

    people: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'people', 'read') == true) {
            let options = {};
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return person.count(options).then(items => {
                if (order !== undefined) {
                    options['order'] = order.map((orderItem) => {
                        return [orderItem.field, orderItem.order];
                    });
                }

                if (pagination !== undefined) {
                    options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                    options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                } else {
                    options['offset'] = 0;
                    options['limit'] = items;
                }

                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(\`Request of total people exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                }
                return person.findAll(options);
            }).catch(error => {
                console.log("Catched the error in people ", error);
                return error;
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOnePerson: function({
        id
    }, context) {
        if (checkAuthorization(context, 'people', 'read') == true) {
            return person.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addPerson: function(input, context) {
        if (checkAuthorization(context, 'people', 'create') == true) {
            return person.create(input)
                .then(person => {
                    return person;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddPersonXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return person.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddPersonCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return person.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deletePerson: function({
        id
    }, context) {
        if (checkAuthorization(context, 'people', 'delete') == true) {
            return person.findById(id)
                .then(person => {
                    return person.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updatePerson: function(input, context) {
        if (checkAuthorization(context, 'people', 'update') == true) {
            return person.findById(input.id)
                .then(person => {
                    return person.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`

module.exports.book_resolver_limit = `
/*
    Resolvers for basic CRUD operations
*/

const book = require('../models/index').book;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const globals = require('../config/globals');
var checkAuthorization = require('../utils/check-authorization');
const publisher = require('./publisher');


book.prototype.peopleFilter = function({
    input,
    order,
    pagination
}, context) {

    let options = {};

    if (input !== undefined) {
        let arg = new searchArg(input);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options).then(items =>{

      if (order !== undefined) {
          options['order'] = order.map((orderItem) => {
              return [orderItem.field, orderItem.order];
          });
      }

      if(pagination !== undefined){
        options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
        options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
      }else{
        options['offset'] = 0;
        options['limit'] = items;
      }

      if(globals.LIMIT_RECORDS < options['limit']){
        throw new Error(\`Request of total peopleFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
      }

      return this.getPeople(options);

    }).catch(error =>{
      console.log("Catched the error in peopleFilter", error);
      return error;
    });
}
book.prototype.publisher = function(_, context) {
    return publisher.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    books: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            let options = {};
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            return book.count(options).then(items =>{

              if (order !== undefined) {
                  options['order'] = order.map((orderItem) => {
                      return [orderItem.field, orderItem.order];
                  });
              }

              if(pagination !== undefined){
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
              }else{
                options['offset'] = 0;
                options['limit'] = items;
              }

              if(globals.LIMIT_RECORDS < options['limit']){
                throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
              }

              return book.findAll(options);

            }).catch(error =>{
              console.log("Catched the error in books ", error);
              return error;
            });

        } else {
            return new Error("You don't have authorization to perform this action");
        }
    },

    readOneBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'read') == true) {
            return book.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'create') == true) {
            return book.create(input)
                .then(book => {
                    return book;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddBookXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return book.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddBookCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return book.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deleteBook: function({
        id
    }, context) {
        if (checkAuthorization(context, 'books', 'delete') == true) {
            return book.findById(id)
                .then(book => {
                    return book.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateBook: function(input, context) {
        if (checkAuthorization(context, 'books', 'update') == true) {
            return book.findById(input.id)
                .then(book => {
                    return book.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}

`

module.exports.local_graphql_project = `
module.exports = \`
  type Project  {
      name: String
      description: String
        specie: Specie
        researchersFilter(input: searchResearcherInput, order: [ orderResearcherInput ], pagination: paginationInput): [Researcher]
  }

  enum ProjectField {
    id
    name
    description
  }

  input searchProjectInput {
    field: ProjectField
    value: typeValue
    operator: Operator
    searchArg: [searchProjectInput]
  }

  input orderProjectInput{
    field: ProjectField
    order: Order
  }

  type Query {
    projects(input: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput ): [Project]
    readOneProject(id: ID!): Project
  }

    type Mutation {
    addProject( name: String, description: String, specieId: Int   ): Project
    deleteProject(id: ID!): String!
    updateProject(id: ID!, name: String, description: String, specieId: Int  ): Project!
    bulkAddProjectXlsx: [Project]
    bulkAddProjectCsv: [Project]
}
  \`;`;


module.exports.webservice_graphql_specie = `
module.exports = \`
  type Specie  {
      nombre: String
      e_nombre_comun_principal: String
      e_foto_principal: String
      nombre_cientifico: String
          projectsFilter(input: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput): [Project]
  }

  enum SpecieField {
    id
    nombre
    e_nombre_comun_principal
    e_foto_principal
    nombre_cientifico
  }

  input searchSpecieInput {
    field: SpecieField
    value: typeValue
    operator: Operator
    searchArg: [searchSpecieInput]
  }

  input orderSpecieInput{
    field: SpecieField
    order: Order
  }

  type Query {
    species(input: searchSpecieInput, order: [ orderSpecieInput ], pagination: paginationInput ): [Specie]
    readOneSpecie(id: ID!): Specie
  }

  \`;`;

module.exports.local_resolver_project = `
/*
    Resolvers for basic CRUD operations
*/

const project = require('../models/index').project;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
var checkAuthorization = require('../utils/check-authorization');
const specie = require('./specie');

project.prototype.researchersFilter = function({
    input,
    order,
    pagination
}, context) {

    let options = {
        include: [{
            all: true
        }]
    };

    if (input !== undefined) {
        let arg = new searchArg(input);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    if (order !== undefined) {
        options['order'] = order.map((orderItem) => {
            return [orderItem.field, orderItem.order];
        });
    }

    if (pagination !== undefined) {
        if (pagination.limit !== undefined) {
            options['limit'] = pagination.limit;
        }
        if (pagination.offset !== undefined) {
            options['offset'] = pagination.offset;
        }
    }

    return this.getResearchers(options);
}
project.prototype.specie = function(_, context) {
    return specie.readOneSpecie({
        "id": this.specieId
    }, context);
}




module.exports = {

    projects: function({
        input,
        order,
        pagination
    }, context) {
        if (checkAuthorization(context, 'projects', 'read') == true) {
            let options = {
                include: [{
                    all: true
                }]
            };
            if (input !== undefined) {
                let arg = new searchArg(input);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }

            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }

            if (pagination !== undefined) {
                if (pagination.limit !== undefined) {
                    options['limit'] = pagination.limit;
                }
                if (pagination.offset !== undefined) {
                    options['offset'] = pagination.offset;
                }
            }

            return project.findAll(options);
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    readOneProject: function({
        id
    }, context) {
        if (checkAuthorization(context, 'projects', 'read') == true) {
            return project.findOne({
                where: {
                    id: id
                },
                include: [{
                    all: true
                }]
            });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    addProject: function(input, context) {
        if (checkAuthorization(context, 'projects', 'create') == true) {
            return project.create(input)
                .then(project => {
                    return project;
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    bulkAddProjectXlsx: function(_, context) {
        let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
        return project.bulkCreate(xlsxObjs, {
            validate: true
        });
    },

    bulkAddProjectCsv: function(_, context) {
        //delim = context.request.body.delim;
        //cols = context.request.body.cols;
        return fileTools.parseCsv(context.request.files.csv_file.data.toString())
            .then((csvObjs) => {
                return project.bulkCreate(csvObjs, {
                    validate: true
                });
            });
    },

    deleteProject: function({
        id
    }, context) {
        if (checkAuthorization(context, 'projects', 'delete') == true) {
            return project.findById(id)
                .then(project => {
                    return project.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    },

    updateProject: function(input, context) {
        if (checkAuthorization(context, 'projects', 'update') == true) {
            return project.findById(input.id)
                .then(project => {
                    return project.update(input);
                });
        } else {
            return "You don't have authorization to perform this action";
        }
    }
}
`;


module.exports.webservice_resolver_specie = `
const specie = require('../models-webservice/specie');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');

specie.prototype.projectsFilter = function({
    input,
    order,
    pagination
}, context) {
    if (input === undefined) {
        return resolvers.projects({
            "input": {
                "field": "specieId",
                "value": {
                    "value": this.id
                },
                "operator": "eq"
            },
            order,
            pagination
        }, context);
    } else {
        return resolvers.projects({
            "input": {
                "operator": "and",
                "searchArg": [{
                    "field": "specieId",
                    "value": {
                        "value": this.id
                    },
                    "operator": "eq"
                }, input]
            },
            order,
            pagination
        }, context)
    }

}



module.exports = {
    species: function({
        input
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
    },

    readOneSpecie: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
    }
}
`;

module.exports.webservice_model_specie = `
module.exports = class specie {

    constructor({
        id,
        nombre,
        e_nombre_comun_principal,
        e_foto_principal,
        nombre_cientifico
    }) {
        this.id = id;
        this.nombre = nombre;
        this.e_nombre_comun_principal = e_nombre_comun_principal;
        this.e_foto_principal = e_foto_principal;
        this.nombre_cientifico = nombre_cientifico;
    }
}
`;

module.exports.local_model_researcher = `
'use strict';

module.exports = function(sequelize, DataTypes) {
    var Researcher = sequelize.define('researcher', {

        firstName: {
            type: Sequelize.STRING
        },

        lastName: {
            type: Sequelize.STRING
        },

        email: {
            type: Sequelize.STRING
        },



    });

    Researcher.associate = function(models) {
        Researcher.belongsToMany(models.project, {
            through: 'project_to_researcher'
        });
    };

    return Researcher;
};
`;

module.exports.local_migration_researcher = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('researchers', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },


            firstName: {
                type: Sequelize.STRING
            },

            lastName: {
                type: Sequelize.STRING
            },

            email: {
                type: Sequelize.STRING
            },



        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('researchers');
    }

};
`;

module.exports.through_migration = `
'use strict';

module.exports = {

    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('project_to_researcher', {

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            projectId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'projects',
                    key: 'id'
                }
            },

            researcherId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'researchers',
                    key: 'id'
                }
            }

        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('project_to_researcher');
    }

};
`;

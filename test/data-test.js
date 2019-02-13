module.exports.transcript_countSchema = `
  module.exports = \`
  type transcript_count  {
    id: ID
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
        individual: individual
    }

  type VueTableTranscript_count{
    data : [transcript_count]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
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
    search: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    vueTableTranscript_count : VueTableTranscript_count  }

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
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')



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

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
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

/**
 * individual.prototype.countFilteredTranscript_counts - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
individual.prototype.countFilteredTranscript_counts = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countTranscript_counts(options);
}




module.exports = {

    /**
     * individuals - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    individuals: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'individuals', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
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
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneIndividual - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneIndividual: function({
        id
    }, context) {
        return checkAuthorization(context, 'individuals', 'read').then(authorization => {
            if (authorization === true) {
                return individual.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addIndividual - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addIndividual: function(input, context) {
        return checkAuthorization(context, 'individuals', 'create').then(authorization => {
            if (authorization === true) {
                return individual.create(input)
                    .then(individual => {
                        if (input.addTranscript_counts) {
                            individual.setTranscript_counts(input.addTranscript_counts);
                        }
                        return individual;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddIndividualXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddIndividualXlsx: function(_, context) {
        return checkAuthorization(context, 'individuals', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return individual.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddIndividualCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddIndividualCsv: function(_, context) {
        return checkAuthorization(context, 'individuals', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, individual, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteIndividual - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteIndividual: function({
        id
    }, context) {
        return checkAuthorization(context, 'individuals', 'delete').then(authorization => {
            if (authorization === true) {
                return individual.findById(id)
                    .then(individual => {
                        return individual.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateIndividual - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateIndividual: function(input, context) {
        return checkAuthorization(context, 'individuals', 'update').then(authorization => {
            if (authorization === true) {
                return individual.findById(input.id)
                    .then(individual => {
                        if (input.addTranscript_counts) {
                            individual.addTranscript_counts(input.addTranscript_counts);
                        }
                        if (input.removeTranscript_counts) {
                            individual.removeTranscript_counts(input.removeTranscript_counts);
                        }
                        return individual.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

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
        return checkAuthorization(context, 'individuals', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return individual.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableIndividual - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableIndividual: function(_, context) {
        return checkAuthorization(context, 'individuals', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, individual, ["id", "name"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}
`

module.exports.individualModel = `
'use strict';

const Sequelize = require('sequelize');

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
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
      id: ID
      gene: String
      variable: String
      count: Float
      tissue_or_condition: String
      }

    type VueTableTranscript_count{
      data : [transcript_count]
      total: Int
      per_page: Int
      current_page: Int
      last_page: Int
      prev_page_url: String
      next_page_url: String
      from: Int
      to: Int
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
    search: [searchTranscript_countInput]
  }

  input orderTranscript_countInput{
    field: transcript_countField
    order: Order
  }

  type Query {
    transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
    readOneTranscript_count(id: ID!): transcript_count
    countTranscript_counts(search: searchTranscript_countInput ): Int
    vueTableTranscript_count : VueTableTranscript_count
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
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

module.exports = {

  /**
   * individuals - Check user authorization and return certain number, specified in pagination argument, of records that
   * holds the condition of search argument, all of them sorted as specified by the order argument.
   *
   * @param  {object} search     Search argument for filtering records
   * @param  {array} order       Type of sorting (ASC, DESC) for each field
   * @param  {object} pagination Offset and limit to get the records from and to respectively
   * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
   * @return {array}             Array of records holding conditions specified by search, order and pagination argument
   */
    individuals: function({
        search,
        order,
        pagination
    }, context) {
      return checkAuthorization(context, 'individuals', 'read').then( authorization =>{
          if (authorization === true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
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
        }).catch( error =>{
            return error;
        })
    },

    /**
     * readOneIndividual - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneIndividual: function({
        id
    }, context) {
      return checkAuthorization(context, 'individuals', 'read').then( authorization =>{
        if (authorization === true) {
            return individual.findOne({
                where: {
                    id: id
                }
            });
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    },

    /**
     * addIndividual - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addIndividual: function(input, context) {
      return checkAuthorization(context, 'individuals', 'create').then( authorization =>{
        if (authorization === true) {
            return individual.create(input)
                .then(individual => {
                    return individual;
                });
              } else {
                  return new Error("You don't have authorization to perform this action");
              }
            }).catch( error =>{
                return error;
            })
    },

    /**
     * bulkAddIndividualXlsx - Load xlsx file of records  NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddIndividualXlsx: function(_, context) {
      return checkAuthorization(context, 'individuals', 'create').then( authorization =>{
        if (authorization === true) {
          let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
          return individual.bulkCreate(xlsxObjs, {
              validate: true
          });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * bulkAddIndividualCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddIndividualCsv: function(_, context) {
      return checkAuthorization(context, 'individuals', 'create').then( authorization =>{
        if (authorization === true) {
          delim = context.request.body.delim;
          cols = context.request.body.cols;
          tmpFile = path.join(__dirname, uuidv4()+'.csv')
          return context.request.files.csv_file.mv(tmpFile).then(() => {
            return fileTools.parseCsvStream(tmpFile, individual, delim, cols)
          }).catch((err) => {
            return new Error(err);
          }).then(() => {
            fs.unlinkSync(tmpFile)
          })
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * deleteIndividual - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteIndividual: function({
        id
    }, context) {
      return checkAuthorization(context, 'individuals', 'delete').then( authorization =>{
        if (authorization === true) {
            return individual.findById(id)
                .then(individual => {
                    return individual.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
              } else {
                  return new Error("You don't have authorization to perform this action");
              }
            }).catch( error =>{
                return error;
            })
    },

    /**
     * updateIndividual - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateIndividual: function(input, context) {
      return checkAuthorization(context, 'individuals', 'update').then( authorization =>{
        if (authorization === true) {
            return individual.findById(input.id)
                .then(individual => {
                    return individual.update(input);
                });
              } else {
                  return new Error("You don't have authorization to perform this action");
              }
            }).catch( error =>{
                return error;
            })
    },
    /**
     * countIndividuals - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countIndividuals: function({search}, context){
      return checkAuthorization(context, 'individuals', 'read').then( authorization =>{
          if (authorization === true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }
            return individual.count(options);
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    },
    /**
     * vueTableIndividual - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableIndividual: function(_, context) {
      return checkAuthorization(context, 'individuals', 'read').then( authorization =>{
        if (authorization === true) {
            return helper.vueTable(context.request, individual, ["id", "name"]);
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    }
}
`

module.exports.transcript_count_no_assoc_model = `
'use strict';

const Sequelize = require('sequelize');

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
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

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
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

/**
 * @module - Migrations to create and to undo a table correpondant to a sequelize model.
 */
module.exports = {

  /**
   * up - Creates a table with the fields specified in the the createTable function.
   *
   * @param  {object} queryInterface Used to modify the table in the database.
   * @param  {object} Sequelize      Sequelize instance with data types included
   * @return {promise}                Resolved if the table was created successfully, rejected otherwise.
   */
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

    /**
     * down - Deletes a table.
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was deleted successfully, rejected otherwise.
     */
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
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

/**
 * transcript_count.prototype.individual - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
transcript_count.prototype.individual = function(_, context) {
    return this.getIndividual();
}




module.exports = {

    /**
     * transcript_counts - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    transcript_counts: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'transcript_counts', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
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
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneTranscript_count - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneTranscript_count: function({
        id
    }, context) {
        return checkAuthorization(context, 'transcript_counts', 'read').then(authorization => {
            if (authorization === true) {
                return transcript_count.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addTranscript_count - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addTranscript_count: function(input, context) {
        return checkAuthorization(context, 'transcript_counts', 'create').then(authorization => {
            if (authorization === true) {
                return transcript_count.create(input)
                    .then(transcript_count => {
                        return transcript_count;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddTranscript_countXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTranscript_countXlsx: function(_, context) {
        return checkAuthorization(context, 'transcript_counts', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return transcript_count.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddTranscript_countCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTranscript_countCsv: function(_, context) {
        return checkAuthorization(context, 'transcript_counts', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, transcript_count, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteTranscript_count - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteTranscript_count: function({
        id
    }, context) {
        return checkAuthorization(context, 'transcript_counts', 'delete').then(authorization => {
            if (authorization === true) {
                return transcript_count.findById(id)
                    .then(transcript_count => {
                        return transcript_count.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateTranscript_count - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateTranscript_count: function(input, context) {
        return checkAuthorization(context, 'transcript_counts', 'update').then(authorization => {
            if (authorization === true) {
                return transcript_count.findById(input.id)
                    .then(transcript_count => {
                        return transcript_count.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countTranscript_counts - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countTranscript_counts: function({
        search
    }, context) {
        return checkAuthorization(context, 'transcript_counts', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return transcript_count.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableTranscript_count - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableTranscript_count: function(_, context) {
        return checkAuthorization(context, 'transcript_counts', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, transcript_count, ["id", "gene", "variable", "tissue_or_condition"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
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
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')



/**
 * person.prototype.dogsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
person.prototype.dogsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
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

/**
 * person.prototype.countFilteredDogs - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
person.prototype.countFilteredDogs = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countDogs(options);
}


/**
 * person.prototype.booksFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
person.prototype.booksFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
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

/**
 * person.prototype.countFilteredBooks - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
person.prototype.countFilteredBooks = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countBooks(options);
}




module.exports = {

    /**
     * people - Check user authorization and return certain number, specified in pagination argument, of records that
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
        return checkAuthorization(context, 'people', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
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
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOnePerson - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOnePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'people', 'read').then(authorization => {
            if (authorization === true) {
                return person.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addPerson - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addPerson: function(input, context) {
        return checkAuthorization(context, 'people', 'create').then(authorization => {
            if (authorization === true) {
                return person.create(input)
                    .then(person => {
                        if (input.addDogs) {
                            person.setDogs(input.addDogs);
                        }
                        if (input.addBooks) {
                            person.setBooks(input.addBooks);
                        }
                        return person;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddPersonXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddPersonXlsx: function(_, context) {
        return checkAuthorization(context, 'people', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return person.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddPersonCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddPersonCsv: function(_, context) {
        return checkAuthorization(context, 'people', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, person, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deletePerson - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deletePerson: function({
        id
    }, context) {
        return checkAuthorization(context, 'people', 'delete').then(authorization => {
            if (authorization === true) {
                return person.findById(id)
                    .then(person => {
                        return person.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updatePerson - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updatePerson: function(input, context) {
        return checkAuthorization(context, 'people', 'update').then(authorization => {
            if (authorization === true) {
                return person.findById(input.id)
                    .then(person => {
                        if (input.addDogs) {
                            person.addDogs(input.addDogs);
                        }
                        if (input.removeDogs) {
                            person.removeDogs(input.removeDogs);
                        }
                        if (input.addBooks) {
                            person.addBooks(input.addBooks);
                        }
                        if (input.removeBooks) {
                            person.removeBooks(input.removeBooks);
                        }
                        return person.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countPeople - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countPeople: function({
        search
    }, context) {
        return checkAuthorization(context, 'people', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return person.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTablePerson - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTablePerson: function(_, context) {
        return checkAuthorization(context, 'people', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, person, ["id", "firstName", "lastName", "email"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
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
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')
const publisher = require('./publisher');



/**
 * book.prototype.peopleFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
book.prototype.peopleFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options).then(items => {
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
            throw new Error(\`Request of total peopleFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getPeople(options);
    }).catch(error => {
        console.log("Catched the error in peopleFilter ", error);
        return error;
    });
}

/**
 * book.prototype.countFilteredPeople - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredPeople = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options);
}


/**
 * book.prototype.publisher - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
book.prototype.publisher = function(_, context) {
    return publisher.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    /**
     * books - Check user authorization and return certain number, specified in pagination argument, of records that
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
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options).then(items => {
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
                        throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                    }
                    return book.findAll(options);
                }).catch(error => {
                    console.log("Catched the error in books ", error);
                    return error;
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneBook - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return book.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addBook - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addBook: function(input, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                return book.create(input)
                    .then(book => {
                        if (input.addPeople) {
                            book.setPeople(input.addPeople);
                        }
                        return book;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddBookXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookXlsx: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return book.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddBookCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookCsv: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, book, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteBook - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'delete').then(authorization => {
            if (authorization === true) {
                return book.findById(id)
                    .then(book => {
                        return book.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateBook - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateBook: function(input, context) {
        return checkAuthorization(context, 'books', 'update').then(authorization => {
            if (authorization === true) {
                return book.findById(input.id)
                    .then(book => {
                        if (input.addPeople) {
                            book.addPeople(input.addPeople);
                        }
                        if (input.removePeople) {
                            book.removePeople(input.removePeople);
                        }
                        return book.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countBooks - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countBooks: function({
        search
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableBook - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableBook: function(_, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, book, ["id", "title", "genre"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}

`
module.exports.researcher_schema = `
module.exports = \`
  type Researcher  {
    id: ID
      firstName: String
      lastName: String
      email: String
        dog: Dog
        projectsFilter(search: searchProjectInput, order: [ orderProjectInput ], pagination: paginationInput): [Project]
    countFilteredProjects(search: searchProjectInput) : Int
  }

  type VueTableResearcher{
    data : [Researcher]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum ResearcherField {
    id
    firstName
    lastName
    email
  }

  input searchResearcherInput {
    field: ResearcherField
    value: typeValue
    operator: Operator
    search: [searchResearcherInput]
  }

  input orderResearcherInput{
    field: ResearcherField
    order: Order
  }

  type Query {
    researchers(search: searchResearcherInput, order: [ orderResearcherInput ], pagination: paginationInput ): [Researcher]
    readOneResearcher(id: ID!): Researcher
    countResearchers(search: searchResearcherInput ): Int
    vueTableResearcher : VueTableResearcher
  }

    type Mutation {
    addResearcher( firstName: String, lastName: String, email: String, addProjects:[ID] ): Researcher
    deleteResearcher(id: ID!): String!
    updateResearcher(id: ID!, firstName: String, lastName: String, email: String, addProjects:[ID], removeProjects:[ID]): Researcher!
    bulkAddResearcherXlsx: [Researcher]
    bulkAddResearcherCsv: [Researcher]
}
  \`;
`

module.exports.researcher_resolver = `
/*
    Resolvers for basic CRUD operations
*/

const researcher = require('../models/index').researcher;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

/**
 * researcher.prototype.dog - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
researcher.prototype.dog = function(_, context) {
    return this.getDog();
}


/**
 * researcher.prototype.projectsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
researcher.prototype.projectsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countProjects(options).then(items => {
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
            throw new Error(\`Request of total projectsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getProjects(options);
    }).catch(error => {
        console.log("Catched the error in projectsFilter ", error);
        return error;
    });
}

/**
 * researcher.prototype.countFilteredProjects - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
researcher.prototype.countFilteredProjects = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countProjects(options);
}




module.exports = {

    /**
     * researchers - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    researchers: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'researchers', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return researcher.count(options).then(items => {
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
                        throw new Error(\`Request of total researchers exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                    }
                    return researcher.findAll(options);
                }).catch(error => {
                    console.log("Catched the error in researchers ", error);
                    return error;
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneResearcher - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneResearcher: function({
        id
    }, context) {
        return checkAuthorization(context, 'researchers', 'read').then(authorization => {
            if (authorization === true) {
                return researcher.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addResearcher - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addResearcher: function(input, context) {
        return checkAuthorization(context, 'researchers', 'create').then(authorization => {
            if (authorization === true) {
                return researcher.create(input)
                    .then(researcher => {
                        if (input.addProjects) {
                            researcher.setProjects(input.addProjects);
                        }
                        return researcher;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddResearcherXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddResearcherXlsx: function(_, context) {
        return checkAuthorization(context, 'researchers', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return researcher.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddResearcherCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddResearcherCsv: function(_, context) {
        return checkAuthorization(context, 'researchers', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, researcher, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteResearcher - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteResearcher: function({
        id
    }, context) {
        return checkAuthorization(context, 'researchers', 'delete').then(authorization => {
            if (authorization === true) {
                return researcher.findById(id)
                    .then(researcher => {
                        return researcher.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateResearcher - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateResearcher: function(input, context) {
        return checkAuthorization(context, 'researchers', 'update').then(authorization => {
            if (authorization === true) {
                return researcher.findById(input.id)
                    .then(researcher => {
                        if (input.addProjects) {
                            researcher.addProjects(input.addProjects);
                        }
                        if (input.removeProjects) {
                            researcher.removeProjects(input.removeProjects);
                        }
                        return researcher.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countResearchers - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countResearchers: function({
        search
    }, context) {
        return checkAuthorization(context, 'researchers', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return researcher.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableResearcher - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableResearcher: function(_, context) {
        return checkAuthorization(context, 'researchers', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, researcher, ["id", "firstName", "lastName", "email"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}
`
module.exports.individual_schema = `
module.exports = \`
  type individual  {
    id: ID
      name: String
          transcript_countsFilter(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput): [transcript_count]
      countFilteredTranscript_counts(search: searchTranscript_countInput): Int
  }

  type VueTableIndividual{
    data : [individual]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum individualField {
    id
    name
  }

  input searchIndividualInput {
    field: individualField
    value: typeValue
    operator: Operator
    search: [searchIndividualInput]
  }

  input orderIndividualInput{
    field: individualField
    order: Order
  }

  type Query {
    individuals(search: searchIndividualInput, order: [ orderIndividualInput ], pagination: paginationInput ): [individual]
    readOneIndividual(id: ID!): individual
    countIndividuals(search: searchIndividualInput): Int
    vueTableIndividual : VueTableIndividual
  }

    type Mutation {
    addIndividual( name: String, addTranscript_counts:[ID] ): individual
    deleteIndividual(id: ID!): String!
    updateIndividual(id: ID!, name: String, addTranscript_counts:[ID], removeTranscript_counts:[ID]): individual!
    bulkAddIndividualXlsx: [individual]
    bulkAddIndividualCsv: [individual]
}
  \`;
`

module.exports.specie_resolvers = `
const specie = require('../models-webservice/specie');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');



specie.prototype.projectsFilter = function({
    search,
    order,
    pagination
}, context) {
    if (search === undefined) {
        return resolvers.projects({
            "search": {
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
            "search": {
                "operator": "and",
                "search": [{
                    "field": "specieId",
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

specie.prototype.countFilteredProjects = function({search},context){
  if (search === undefined) {
      return resolvers.countProjects({
          "search": {
              "field": "specieId",
              "value": {
                  "value": this.id
              },
              "operator": "eq"
          }
      }, context);
  } else {
      return resolvers.countProjects({
          "search": {
              "operator": "and",
              "search": [{
                  "field": "specieId",
                  "value": {
                      "value": this.id
                  },
                  "operator": "eq"
              }, search]
          }
      }, context)
  }
}

module.exports = {
    species: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('species is not implemented');
    },

    readOneSpecie: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('readOneSpecie is not implemented');
    },

    countSpecies: function({search}, context){
      /*
      YOUR CODE GOES HERE
      */
      throw new Error('countSpecies is not implemented');
    }
}
`

module.exports.book_schema = `
module.exports = \`
  type Book  {
      id: ID
      title: String
      genre: String
        publisher: Publisher
        peopleFilter(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput): [Person]
    countFilteredPeople(search: searchPersonInput) : Int
  }

type VueTableBook{
  data : [Book]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

  enum BookField {
    id
    title
    genre
  }

  input searchBookInput {
    field: BookField
    value: typeValue
    operator: Operator
    search: [searchBookInput]
  }

  input orderBookInput{
    field: BookField
    order: Order
  }

  type Query {
    books(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput ): [Book]
    readOneBook(id: ID!): Book
    countBooks(search: searchBookInput ): Int
    vueTableBook : VueTableBook
  }

    type Mutation {
    addBook( title: String, genre: String, publisherId: Int, addPeople:[ID]   ): Book
    deleteBook(id: ID!): String!
    updateBook(id: ID!, title: String, genre: String, publisherId: Int, addPeople:[ID], removePeople:[ID]  ): Book!
    bulkAddBookXlsx: [Book]
    bulkAddBookCsv: [Book]
}
  \`;
`

module.exports.book_resolver_table = `
/*
    Resolvers for basic CRUD operations
*/

const book = require('../models/index').book;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')
const publisher = require('./publisher');



/**
 * book.prototype.peopleFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
book.prototype.peopleFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options).then(items => {
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
            throw new Error(\`Request of total peopleFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getPeople(options);
    }).catch(error => {
        console.log("Catched the error in peopleFilter ", error);
        return error;
    });
}

/**
 * book.prototype.countFilteredPeople - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredPeople = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countPeople(options);
}


/**
 * book.prototype.publisher - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
book.prototype.publisher = function(_, context) {
    return publisher.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    /**
     * books - Check user authorization and return certain number, specified in pagination argument, of records that
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
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options).then(items => {
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
                        throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                    }
                    return book.findAll(options);
                }).catch(error => {
                    console.log("Catched the error in books ", error);
                    return error;
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneBook - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return book.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addBook - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addBook: function(input, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                return book.create(input)
                    .then(book => {
                        if (input.addPeople) {
                            book.setPeople(input.addPeople);
                        }
                        return book;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddBookXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookXlsx: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return book.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddBookCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookCsv: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, book, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteBook - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'delete').then(authorization => {
            if (authorization === true) {
                return book.findById(id)
                    .then(book => {
                        return book.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateBook - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateBook: function(input, context) {
        return checkAuthorization(context, 'books', 'update').then(authorization => {
            if (authorization === true) {
                return book.findById(input.id)
                    .then(book => {
                        if (input.addPeople) {
                            book.addPeople(input.addPeople);
                        }
                        if (input.removePeople) {
                            book.removePeople(input.removePeople);
                        }
                        return book.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countBooks - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countBooks: function({
        search
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableBook - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableBook: function(_, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, book, ["id", "title", "genre"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}
`

module.exports.person_schema = `
module.exports = \`
  type Person  {
    id: ID
    firstName: String
    lastName: String
    email: String
      dogsFilter(search: searchDogInput, order: [ orderDogInput ], pagination: paginationInput): [Dog]
    countFilteredDogs(search: searchDogInput) : Int
  booksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]
    countFilteredBooks(search: searchBookInput) : Int
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
    email
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
    vueTablePerson : VueTablePerson  }

    type Mutation {
    addPerson( firstName: String, lastName: String, email: String, addDogs:[ID], addBooks:[ID]): Person
    deletePerson(id: ID!): String!
    updatePerson(id: ID!, firstName: String, lastName: String, email: String, addDogs:[ID], removeDogs:[ID], addBooks:[ID], removeBooks:[ID]): Person!
    bulkAddPersonXlsx: [Person]
    bulkAddPersonCsv: [Person]
}
  \`;
`

module.exports.dog_resolvers =`
/*
    Resolvers for basic CRUD operations
*/

const dog = require('../models/index').dog;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

/**
 * dog.prototype.person - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.person = function(_, context) {
    return this.getPerson();
}
/**
 * dog.prototype.researcher - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
dog.prototype.researcher = function(_, context) {
    return this.getResearcher();
}

module.exports = {

    /**
     * dogs - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    dogs: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'dogs', 'read').then( authorization =>{
            if (authorization === true) {

              let options = {};
              if (search !== undefined) {
                  let arg = new searchArg(search);
                  let arg_sequelize = arg.toSequelize();
                  options['where'] = arg_sequelize;
              }

              return dog.count(options).then(items => {
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
                      throw new Error(\`Request of total dogs exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                  }
                  return dog.findAll(options);
              }).catch(error => {
                  console.log("Catched the error in dogs ", error);
                  return error;
              });
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    },

    /**
     * readOneDog - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneDog: function({
        id
    }, context) {
      return checkAuthorization(context, 'dogs', 'read').then( authorization =>{
        if (authorization === true) {
            return dog.findOne({
                where: {
                    id: id
                }
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * addDog - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addDog: function(input, context) {
      return checkAuthorization(context, 'dogs', 'create').then( authorization =>{
        if (authorization === true) {
              return dog.create(input)
                  .then(dog => {
                      return dog;
                  });
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    },

    /**
     * bulkAddDogXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddDogXlsx: function(_, context) {
      return checkAuthorization(context, 'dogs', 'create').then( authorization =>{
        if (authorization === true) {
            let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
            return dog.bulkCreate(xlsxObjs, {
                validate: true
            });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * bulkAddDogCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddDogCsv: function(_, context) {
      return checkAuthorization(context, 'dogs', 'create').then( authorization =>{
        if (authorization === true) {
          delim = context.request.body.delim;
          cols = context.request.body.cols;
          tmpFile = path.join(__dirname, uuidv4() + '.csv')
          return context.request.files.csv_file.mv(tmpFile).then(() => {
              return fileTools.parseCsvStream(tmpFile, dog, delim, cols)
          }).catch((err) => {
              return new Error(err);
          }).then(() => {
              fs.unlinkSync(tmpFile)
          })
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * deleteDog - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteDog: function({
        id
    }, context) {
      return checkAuthorization(context, 'dogs', 'delete').then( authorization =>{
        if (authorization === true) {
            return dog.findById(id)
                .then(dog => {
                    return dog.destroy()
                        .then(() => {
                            return 'Item succesfully deleted';
                        });
                });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

    /**
     * updateDog - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateDog: function(input, context) {
      return checkAuthorization(context, 'dogs', 'update').then( authorization =>{
        if (authorization === true) {
            return dog.findById(input.id)
                .then(dog => {
                    return dog.update(input);
                });
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    },

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
      return checkAuthorization(context, 'dogs', 'read').then( authorization =>{
          if (authorization === true) {
            let options = {};
            if (search !== undefined) {
                let arg = new searchArg(search);
                let arg_sequelize = arg.toSequelize();
                options['where'] = arg_sequelize;
            }
            return dog.count(options);
          } else {
              return new Error("You don't have authorization to perform this action");
          }
        }).catch( error =>{
            return error;
        })
    },

    /**
     * vueTableDog - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableDog: function(_, context) {
      return checkAuthorization(context, 'dogs', 'read').then( authorization =>{
        if (authorization === true) {
            return helper.vueTable(context.request, dog, ["id", "name", "breed"]);
        } else {
            return new Error("You don't have authorization to perform this action");
        }
      }).catch( error =>{
          return error;
      })
    }
}
`

module.exports.project_to_researcher_migration = `
'use strict';

/**
 * @module - Migrations to creates a through table correspondant to manay-to-many association between two sequelize models.
 */
module.exports = {

  /**
   * up - Creates a table in the database for storing a many-to-many association
   *
   * @param  {object} queryInterface Used to modify the table in the database.
   * @param  {object} Sequelize      Sequelize instance with data types included
   * @return {promise}                Resolved if the table was succesfully created.
   */
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('project_to_researcher', {

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            researcherId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'researchers',
                    key: 'id'
                }
            },

            projectId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'projects',
                    key: 'id'
                }
            }
        }).then(()=> {
            return queryInterface.addIndex('project_to_researcher', ['researcherId']);
        }).then(()=>{
            return queryInterface.addIndex('project_to_researcher', ['projectId']);
        });
    },

    /**
     * down - Deletes a table in the database for storing a many-to-many association
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was succesfully deleted.
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('project_to_researcher');
    }

};
`
module.exports.researcher_model = `
'use strict';

const Sequelize = require('sequelize');

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
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
        }
    });

    Researcher.associate = function(models) {
        Researcher.hasOne(models.dog, {
            foreignKey: 'researcherId'
        });
        Researcher.belongsToMany(models.project, {
            through: 'project_to_researcher',
            onDelete: 'CASCADE'
        });
    };

    return Researcher;
};
`
module.exports.add_column_dogs_migration = `
'use strict';

/**
 * @module - Migrations to add a column and to delete a column from a table correpondant to a sequelize model.
 */
module.exports = {

  /**
   * up - Adds a column to a specified table
   *
   * @param  {object} queryInterface Used to modify the table in the database.
   * @param  {object} Sequelize      Sequelize instance with data types included
   * @return {promise}                Resolved if the column was succesfully added.
   */
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn('dogs', 'researcherId', {
            type: Sequelize.INTEGER,
            references: {
                model: 'researchers',
                key: 'id'
            }
        }).then(()=>{
          return queryInterface.addIndex('dogs',['researcherId']);
        });
    },

    /**
     * down - Deletes a column to a specified table
     *
     * @param  {type} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the column was succesfully deleted.
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('dogs', 'researcherId');
    }

};
`
module.exports.schema_webservice_aminoAcid = `
module.exports = \`
  type aminoAcidSequence  {
    id: ID
    accession: String
    sequence: String
  }

  type VueTableAminoAcidSequence{
    data : [aminoAcidSequence]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum aminoAcidSequenceField {
    id
    accession
    sequence
  }

  input searchAminoAcidSequenceInput {
    field: aminoAcidSequenceField
    value: typeValue
    operator: Operator
    search: [searchAminoAcidSequenceInput]
  }

  input orderAminoAcidSequenceInput{
    field: aminoAcidSequenceField
    order: Order
  }

  type Query {
    aminoAcidSequences(search: searchAminoAcidSequenceInput, order: [ orderAminoAcidSequenceInput ], pagination: paginationInput ): [aminoAcidSequence]
    readOneAminoAcidSequence(id: ID!): aminoAcidSequence
    countAminoAcidSequences(search: searchAminoAcidSequenceInput ): Int
    vueTableAminoAcidSequence : VueTableAminoAcidSequence  }

  \`;
`

module.exports.model_webservice_aminoAcid = `
module.exports = class aminoAcidSequence {

    /**
     * constructor - Creates an instance of the model stored in webservice
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */
    constructor({
        id,
        accession,
        sequence
    }) {
        this.id = id;
        this.accession = accession;
        this.sequence = sequence;
    }
}

`

module.exports.resolvers_webservice_aminoAcid = `
const aminoAcidSequence = require('../models-webservice/aminoAcidSequence');
const searchArg = require('../utils/search-argument');
const resolvers = require('./index');

module.exports = {
    aminoAcidSequences: function({
        search,
        order,
        pagination
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('aminoAcidSequences is not implemented');
    },

    readOneAminoAcidSequence: function({
        id
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('readOneAminoAcidSequence is not implemented');
    },

    countAminoAcidSequences: function({
        search
    }, context) {
        /*
        YOUR CODE GOES HERE
        */
        throw new Error('countAminoAcidSequences is not implemented');
    }
}

`

module.exports.individual_schema_camelcase = `
module.exports = \`
  type inDiVIdual  {
    id: ID
    name: String
      transcriptCountsFilter(search: searchTranscriptCountInput, order: [ orderTranscriptCountInput ], pagination: paginationInput): [transcriptCount]
    countFilteredTranscriptCounts(search: searchTranscriptCountInput) : Int
  }

  type VueTableInDiVIdual{
    data : [inDiVIdual]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum inDiVIdualField {
    id
    name
  }

  input searchInDiVIdualInput {
    field: inDiVIdualField
    value: typeValue
    operator: Operator
    search: [searchInDiVIdualInput]
  }

  input orderInDiVIdualInput{
    field: inDiVIdualField
    order: Order
  }

  type Query {
    inDiVIduals(search: searchInDiVIdualInput, order: [ orderInDiVIdualInput ], pagination: paginationInput ): [inDiVIdual]
    readOneInDiVIdual(id: ID!): inDiVIdual
    countInDiVIduals(search: searchInDiVIdualInput ): Int
    vueTableInDiVIdual : VueTableInDiVIdual  }

    type Mutation {
    addInDiVIdual( name: String , addTranscriptCounts:[ID] ): inDiVIdual
    deleteInDiVIdual(id: ID!): String!
    updateInDiVIdual(id: ID!, name: String , addTranscriptCounts:[ID], removeTranscriptCounts:[ID] ): inDiVIdual!
    bulkAddInDiVIdualXlsx: [inDiVIdual]
    bulkAddInDiVIdualCsv: [inDiVIdual]
}
  \`;
`

module.exports.individual_model_camelcase = `
'use strict';

const Sequelize = require('sequelize');

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
module.exports = function(sequelize, DataTypes) {
    var inDiVIdual = sequelize.define('inDiVIdual', {

        name: {
            type: Sequelize.STRING
        }
    });

    inDiVIdual.associate = function(models) {
        inDiVIdual.hasMany(models.transcriptCount, {
            foreignKey: 'individual_id'
        });
    };

    return inDiVIdual;
};
`
module.exports.individual_resolvers_camelcase = `
/*
    Resolvers for basic CRUD operations
*/

const inDiVIdual = require('../models/index').inDiVIdual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')



/**
 * inDiVIdual.prototype.transcriptCountsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
inDiVIdual.prototype.transcriptCountsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countTranscriptCounts(options).then(items => {
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
            throw new Error(\`Request of total transcriptCountsFilter exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
        }
        return this.getTranscriptCounts(options);
    }).catch(error => {
        console.log("Catched the error in transcriptCountsFilter ", error);
        return error;
    });
}

/**
 * inDiVIdual.prototype.countFilteredTranscriptCounts - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
inDiVIdual.prototype.countFilteredTranscriptCounts = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countTranscriptCounts(options);
}




module.exports = {

    /**
     * inDiVIduals - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    inDiVIduals: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'inDiVIduals', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return inDiVIdual.count(options).then(items => {
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
                        throw new Error(\`Request of total inDiVIduals exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                    }
                    return inDiVIdual.findAll(options);
                }).catch(error => {
                    console.log("Catched the error in inDiVIduals ", error);
                    return error;
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneInDiVIdual - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneInDiVIdual: function({
        id
    }, context) {
        return checkAuthorization(context, 'inDiVIduals', 'read').then(authorization => {
            if (authorization === true) {
                return inDiVIdual.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addInDiVIdual - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addInDiVIdual: function(input, context) {
        return checkAuthorization(context, 'inDiVIduals', 'create').then(authorization => {
            if (authorization === true) {
                return inDiVIdual.create(input)
                    .then(inDiVIdual => {
                        if (input.addTranscriptCounts) {
                            inDiVIdual.setTranscriptCounts(input.addTranscriptCounts);
                        }
                        return inDiVIdual;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddInDiVIdualXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddInDiVIdualXlsx: function(_, context) {
        return checkAuthorization(context, 'inDiVIduals', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return inDiVIdual.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddInDiVIdualCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddInDiVIdualCsv: function(_, context) {
        return checkAuthorization(context, 'inDiVIduals', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, inDiVIdual, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteInDiVIdual - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteInDiVIdual: function({
        id
    }, context) {
        return checkAuthorization(context, 'inDiVIduals', 'delete').then(authorization => {
            if (authorization === true) {
                return inDiVIdual.findById(id)
                    .then(inDiVIdual => {
                        return inDiVIdual.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateInDiVIdual - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateInDiVIdual: function(input, context) {
        return checkAuthorization(context, 'inDiVIduals', 'update').then(authorization => {
            if (authorization === true) {
                return inDiVIdual.findById(input.id)
                    .then(inDiVIdual => {
                        if (input.addTranscriptCounts) {
                            inDiVIdual.addTranscriptCounts(input.addTranscriptCounts);
                        }
                        if (input.removeTranscriptCounts) {
                            inDiVIdual.removeTranscriptCounts(input.removeTranscriptCounts);
                        }
                        return inDiVIdual.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countInDiVIduals - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countInDiVIduals: function({
        search
    }, context) {
        return checkAuthorization(context, 'inDiVIduals', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return inDiVIdual.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableInDiVIdual - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableInDiVIdual: function(_, context) {
        return checkAuthorization(context, 'inDiVIduals', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, inDiVIdual, ["id", "name"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}
`;

module.exports.transcriptCount_schema_camelcase  =`
module.exports = \`
  type transcriptCount  {
    id: ID
    gene: String
    variable: String
    count: Float
    tissue_or_condition: String
    inDiVIdual: inDiVIdual
    }

  type VueTableTranscriptCount{
    data : [transcriptCount]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum transcriptCountField {
    id
    gene
    variable
    count
    tissue_or_condition
  }

  input searchTranscriptCountInput {
    field: transcriptCountField
    value: typeValue
    operator: Operator
    search: [searchTranscriptCountInput]
  }

  input orderTranscriptCountInput{
    field: transcriptCountField
    order: Order
  }

  type Query {
    transcriptCounts(search: searchTranscriptCountInput, order: [ orderTranscriptCountInput ], pagination: paginationInput ): [transcriptCount]
    readOneTranscriptCount(id: ID!): transcriptCount
    countTranscriptCounts(search: searchTranscriptCountInput ): Int
    vueTableTranscriptCount : VueTableTranscriptCount  }

    type Mutation {
    addTranscriptCount( gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int   ): transcriptCount
    deleteTranscriptCount(id: ID!): String!
    updateTranscriptCount(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String, individual_id: Int  ): transcriptCount!
    bulkAddTranscriptCountXlsx: [transcriptCount]
    bulkAddTranscriptCountCsv: [transcriptCount]
}
  \`;
`

module.exports.transcriptCount_resolvers_camelcase = `
/*
    Resolvers for basic CRUD operations
*/

const transcriptCount = require('../models/index').transcriptCount;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path')
const fs = require('fs')
const uuidv4 = require('uuidv4')

/**
 * transcriptCount.prototype.individual - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
transcriptCount.prototype.individual = function(_, context) {
    return this.getIndividual();
}




module.exports = {

    /**
     * transcriptCounts - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    transcriptCounts: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'transcriptCounts', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return transcriptCount.count(options).then(items => {
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
                        throw new Error(\`Request of total transcriptCounts exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
                    }
                    return transcriptCount.findAll(options);
                }).catch(error => {
                    console.log("Catched the error in transcriptCounts ", error);
                    return error;
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * readOneTranscriptCount - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneTranscriptCount: function({
        id
    }, context) {
        return checkAuthorization(context, 'transcriptCounts', 'read').then(authorization => {
            if (authorization === true) {
                return transcriptCount.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * addTranscriptCount - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addTranscriptCount: function(input, context) {
        return checkAuthorization(context, 'transcriptCounts', 'create').then(authorization => {
            if (authorization === true) {
                return transcriptCount.create(input)
                    .then(transcriptCount => {
                        return transcriptCount;
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddTranscriptCountXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTranscriptCountXlsx: function(_, context) {
        return checkAuthorization(context, 'transcriptCounts', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return transcriptCount.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * bulkAddTranscriptCountCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTranscriptCountCsv: function(_, context) {
        return checkAuthorization(context, 'transcriptCounts', 'create').then(authorization => {
            if (authorization === true) {
                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv')
                return context.request.files.csv_file.mv(tmpFile).then(() => {
                    return fileTools.parseCsvStream(tmpFile, transcriptCount, delim, cols)
                }).catch((err) => {
                    return new Error(err);
                }).then(() => {
                    fs.unlinkSync(tmpFile)
                })
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteTranscriptCount - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteTranscriptCount: function({
        id
    }, context) {
        return checkAuthorization(context, 'transcriptCounts', 'delete').then(authorization => {
            if (authorization === true) {
                return transcriptCount.findById(id)
                    .then(transcriptCount => {
                        return transcriptCount.destroy()
                            .then(() => {
                                return 'Item succesfully deleted';
                            });
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * updateTranscriptCount - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateTranscriptCount: function(input, context) {
        return checkAuthorization(context, 'transcriptCounts', 'update').then(authorization => {
            if (authorization === true) {
                return transcriptCount.findById(input.id)
                    .then(transcriptCount => {
                        return transcriptCount.update(input);
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * countTranscriptCounts - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countTranscriptCounts: function({
        search
    }, context) {
        return checkAuthorization(context, 'transcriptCounts', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return transcriptCount.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * vueTableTranscriptCount - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableTranscriptCount: function(_, context) {
        return checkAuthorization(context, 'transcriptCounts', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, transcriptCount, ["id", "gene", "variable", "tissue_or_condition"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    }
}
`

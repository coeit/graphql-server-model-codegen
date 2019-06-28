module.exports.transcript_count_no_assoc_schema = `
type Query {
  transcript_counts(search: searchTranscript_countInput, order: [ orderTranscript_countInput ], pagination: paginationInput ): [transcript_count]
  readOneTranscript_count(id: ID!): transcript_count
  countTranscript_counts(search: searchTranscript_countInput ): Int
  vueTableTranscript_count : VueTableTranscript_count    csvTableTemplateTranscript_count: [String]
}

  type Mutation {
    addTranscript_count( gene: String, variable: String, count: Float, tissue_or_condition: String  ): transcript_count!
  updateTranscript_count(id: ID!, gene: String, variable: String, count: Float, tissue_or_condition: String ): transcript_count!


deleteTranscript_count(id: ID!): String!
bulkAddTranscript_countXlsx: [transcript_count]
bulkAddTranscript_countCsv: [transcript_count] }
`

module.exports.individual_no_assoc_resolvers = `
const path = require('path');
const individual = require(path.join(__dirname, '..', 'models_index.js')).individual;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const uuidv4 = require('uuidv4');
const resolvers = require('./index');
const {
    handleError
} = require('../utils/errors');
const email = require('../utils/email');
const helpersAcl = require('../utils/helpers-acl');
const validatorUtil = require('../utils/validatorUtil');
const os = require('os');

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

`
module.exports.transcript_count_no_assoc_model = `
static associate(models) {

}
`

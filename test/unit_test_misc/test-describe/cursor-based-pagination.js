module.exports.connection_book_schema = `
type BookConnection{
  edges: [BookEdge]
  pageInfo: pageInfo!
}

type BookEdge{
  cursor: String!
  node: Book!
}
`

module.exports.connection_book_query = `
booksConnection(search: searchBookInput, order: [orderBookInput], pagination: paginationCursorInput): BookConnection
`

module.exports.model_read_all_connection = `
static readAllCursor(search, order, pagination){
  let options = {};
  options['where'] = {};
  if (search !== undefined) {
      let arg = new searchArg(search);
      let arg_sequelize = arg.toSequelize();
      options['where'] = arg_sequelize;
  }

  return super.count(options).then( items =>{
    options['offset'] = 0;
    options['order'] = [];

    if (order !== undefined) {
        options['order'] = order.map((orderItem) => {
            return [orderItem.field, orderItem.order];
        });
    }

    if( !options['order'].map( orderItem=>{return orderItem[0] }).includes("id") ){
        options['order'] = [ ...options['order'], ...[ ["id", "ASC"] ]];
    }

    if(pagination!== undefined && pagination.cursor ){
        let decoded_cursor = JSON.parse(this.base64Decode(pagination.cursor));
        options['where'] = {...options['where'], ...helper.parseOrderCursor(options['order'], decoded_cursor) } ;
    }

    options['limit'] = (pagination !== undefined && pagination.first!==undefined) ? pagination.first : items;


    if (globals.LIMIT_RECORDS < options['limit']) {
        throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
    }
    return super.findAll(options).then( records =>{
      let edges = records.map( record=>{ return {
        node: record,
        cursor: record.base64Enconde()
      }})
      let last = options.limit;
      delete options.limit;
      let pageInfo = {
        hasNextPage: super.count(options).then(num =>{return num > last}),
        endCursor: edges[ edges.length - 1 ].cursor
      }

      return {
        edges,
        pageInfo
      };
    }).catch(error =>{
      console.log(error)
    });

  });

}

`

module.exports.server_url = `
  const url = "http://something.other:7000/graphql";
`

module.exports.read_by_id = `
static readById(id) {
  let query = \`query readOneBook{ readOneBook(id: \${id}){id  title genre publisher_id} }\`

  return axios.post(url,{query:query}).then( res => {
    let data = res.data.data.readOneBook;
    return new Book(data);
  }).catch( error =>{
    handleError(error);
  });
}
`

const { expect } = require('chai')
const request = require('sync-request')
const baseUrl = 'http://0.0.0.0:3000/graphql'

describe(
  'Generated GraphQL Server for models in ./test/integration-test-input/',
  function() {

    it('Should have zero individuals', function() {
      let res = request('POST', baseUrl, {
        json: {
          query: '{ individuals(pagination: { limit: 2 }) { id name } }'
        }
      })
      let resBody = JSON.parse(res.body.toString('utf8'))
      expect(res.statusCode).to.equal(200)
      expect(resBody).to.deep.equal({
        data: { individuals: [] }
      })
    })

})

const { expect } = require('chai')
const request = require('sync-request')
const baseUrl = 'http://0.0.0.0:3000/graphql'

//dev_hint: ALTER SEQUENCE individuals_id_seq RESTART WITH 1;

describe(
  'Clean GraphQL Server: one new basic function per test ("Individual" model)',
  function() {

    it('01. table is empty', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ countIndividuals }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.countIndividuals).equal(0);
    });


    it('02. add', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: \"1 First\") { id } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        //TODO: Why individual.id is string, is it correct?
        expect(resBody.data.addIndividual.id).equal("1");
    });


    it('03. update', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { updateIndividual(id: 1, name: "1 Update: First has Second in name") {id name} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                updateIndividual: {
                    id: "1",
                    name: "1 Update: First has Second in name"
                }
            }
        })
    });

    it('04. add one more and find both', function() {
        request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: "2 Second") {id} }'
            }
        });

        let res = request('POST', baseUrl, {
            json: {
                query: '{ individuals {id} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(2);
    });


    it('05. read one', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ readOneIndividual(id : 2) { id name } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                readOneIndividual: {
                    id: "2",
                    name: "2 Second"
                }
            }
        })
    });

    it('06. search with like', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{individuals(search:{field:name, value:{value:"%Second%"}, operator:like}) {name}}'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        // returns both records because both have word "Second" in their names
        expect(resBody.data.individuals.length).equal(2);
    });

    it('07. paginate', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{individuals(pagination:{limit:1}) {id name}}'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(1);
    });

    it('08. vue table', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ vueTableIndividual {total} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.vueTableIndividual.total).equal(2);
    });

    it('09. sort', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ individuals(pagination: {limit:2}, order: [{field: name, order: DESC}]) {name} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                individuals: [
                    {name: "2 Second"},
                    {name: "1 Update: First has Second in name"}
                ]
            }
        })
    });

    it('10. delete all', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ individuals {id} }'
            }
        });

        let individuals = JSON.parse(res.body.toString('utf8')).data.individuals;
        for(let i = 0; i < individuals.length; i++){
            res = request('POST', baseUrl, {
                json: {
                    query: `mutation { deleteIndividual (id: ${individuals[i].id}) }`
                }
            });
            expect(res.statusCode).to.equal(200);
        }

        res = request('POST', baseUrl, {
            json: {
                query: '{ countIndividuals }'
            }
        });

        let cnt = JSON.parse(res.body.toString('utf8')).data.countIndividuals;
        expect(cnt).to.equal(0);
    });

});
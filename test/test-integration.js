const { expect } = require('chai');
const request = require('sync-request');
const baseUrl = 'http://0.0.0.0:3000/graphql';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const FormData = require('form-data');

//HINT:
//DELETE FROM transcript_counts;
//DELETE FROM individuals;
//ALTER SEQUENCE individuals_id_seq RESTART WITH 1;
//ALTER SEQUENCE transcript_counts_id_seq RESTART WITH 1;

describe(
  'Clean GraphQL Server: one new basic function per test ("Individual" model)',
  function() {

    it('01. Individual table is empty', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ countIndividuals }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.countIndividuals).equal(0);
    });


    it('02. Individual add', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: \"First\") { id } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody.data.addIndividual.id).equal("1");
    });


    it('03. Individual update', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { updateIndividual(id: 1, name: "FirstToSecondUpdated") {id name} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                updateIndividual: {
                    id: "1",
                    name: "FirstToSecondUpdated"
                }
            }
        })
    });

    it('04. Individual add one more and find both', function() {
        request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: "Second") {id} }'
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


    it('05. Individual read one', function() {
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
                    name: "Second"
                }
            }
        })
    });

    it('06. Individual search with like', function() {
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

    it('07. Individual paginate', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{individuals(pagination:{limit:1}) {id name}}'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.individuals.length).equal(1);
    });

    it('08. Individual vue table', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ vueTableIndividual {total} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.vueTableIndividual.total).equal(2);
    });

    it('09. Individual sort', function() {
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
                    {name: "Second"},
                    {name: "FirstToSecondUpdated"}
                ]
            }
        })
    });

    it('10. Individual delete all', function() {
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

    // transcript_count model tests start here:
    it('11. TranscriptCount table is empty', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ countTranscript_counts }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.countTranscript_counts).equal(0);
    });


    it('12. TranscriptCount add', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addTranscript_count(gene: \"Gene A\", variable: \"RPKM\", count: 123.32, tissue_or_condition: \"Root\") { id } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody.data.addTranscript_count.id).equal("1");
    });


    it('13. TranscriptCount update', function() {
        let res = request('POST', baseUrl, {
            json: {
              query: 'mutation { updateTranscript_count(id: 1, gene: \"Gene B\") {id gene} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                updateTranscript_count: {
                    id: "1",
                    gene: "Gene B"
                }
            }
        })
    });

    it('14. TranscriptCount add one more and find both', function() {
        request('POST', baseUrl, {
            json: {
                query: 'mutation { addTranscript_count(gene: \"Gene C\", variable: \"RPKM\", count: 321.23, tissue_or_condition: \"Stem\") {id} }'
            }
        });

        let res = request('POST', baseUrl, {
            json: {
                query: '{ transcript_counts {id} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(2);
    });


    it('15. TranscriptCount read one', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ readOneTranscript_count(id : 2) { id gene variable count tissue_or_condition } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                readOneTranscript_count: {
                    id: "2",
                    gene: "Gene C",
                    variable: "RPKM",
                    count: 321.23,
                    tissue_or_condition: "Stem"
                }
            }
        })
    });

    it('16. TranscriptCount search with like', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{transcript_counts(search:{field:gene, value:{value:"%ene%"}, operator:like}) {gene}}'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        // returns both records because both have word "Second" in their names
        expect(resBody.data.transcript_counts.length).equal(2);
    });

    it('17. TranscriptCount paginate', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{transcript_counts(pagination:{limit:1}) {id gene}}'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.transcript_counts.length).equal(1);
    });

    it('18. TranscriptCount vue table', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ vueTableTranscript_count {total} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody.data.vueTableTranscript_count.total).equal(2);
    });

    it('19. TranscriptCount sort', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: '{ transcript_counts(pagination: {limit:2}, order: [{field: gene, order: DESC}]) {gene} }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(resBody).to.deep.equal({
            data: {
                transcript_counts: [
                    {gene: "Gene C"},
                    {gene: "Gene B"}
                ]
            }
        })
    });


    // Test belongs-to relation between transcript_count and individual data
    // model:
    it('20. TranscriptCount assign new Individual', function() {
        // Create Plant to subjected to RNA-Seq analysis from which the
      // transcript_counts result:
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: \"IncredibleMaizePlantOne\") { id name } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody.data.addIndividual.name).equal("IncredibleMaizePlantOne");
        let plantId = resBody.data.addIndividual.id;

        // Create TranscriptCount with above Plant assigned as Individual
        let tcRes = request('POST', baseUrl, {
            json: {
              query: `mutation { addTranscript_count(gene: \"Gene D\", variable: \"RPKM\", count: 321.23, tissue_or_condition: \"Stem\", individual_id: ${plantId}) {id gene individual { id name } } }`
            }
        });
        let tcResBody = JSON.parse(tcRes.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);
        expect(tcResBody).to.deep.equal({
            data: {
              addTranscript_count: {
                id: "3",
                gene: "Gene D",
                individual: {
                  id: "3",
                  name: "IncredibleMaizePlantOne"
                }
              }
            }
        })
    });

  it('21. TranscriptCount delete all', function() {
      let res = request('POST', baseUrl, {
          json: {
              query: '{ transcript_counts {id} }'
          }
      });

      let transcript_counts = JSON.parse(res.body.toString('utf8')).data.transcript_counts;
      for(let i = 0; i < transcript_counts.length; i++){
          res = request('POST', baseUrl, {
              json: {
                  query: `mutation { deleteTranscript_count (id: ${transcript_counts[i].id}) }`
              }
          });
          expect(res.statusCode).to.equal(200);
      }

      res = request('POST', baseUrl, {
          json: {
              query: '{ countTranscript_counts }'
          }
      });

      let cnt = JSON.parse(res.body.toString('utf8')).data.countTranscript_counts;
      expect(cnt).to.equal(0);
  });

});

describe(
    'Web service model',
    function() {

        it('01. Webservice simulator is up', function() {
            let res = request('get', 'http://localhost:3344/aminoAcidSequence/63165');

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            expect(resBody).to.deep.equal({
                "accession": "P63165",
                "id": 63165,
                "sequence": "MSDQEAKPSTEDLGDKKEGEYIKLKVIGQDSSEIHFKVKMTTHLKKLKESYCQRQGVPMNSLRFLFEGQRIADNHTPKELGMEEEDVIEVYQEQTGGHSTV"
            });
        });

        it('02. Webservice read one', function() {
            let res = request('POST', baseUrl, {
                json: {
                    query: '{ readOneAminoacidsequence(id : 69905) { id accession sequence} }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            expect(resBody).to.deep.equal({
                "data": {
                    "readOneAminoacidsequence": {
                        "accession": "P69905",
                        "id": "69905",
                        "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
                    }
                }
            });
        });

        it('03. Webservice associate new TranscriptCount', function() {
            let res = request('POST', baseUrl, {
                json: {
                    query: 'mutation { addTranscript_count(gene: "new_gene", \n' +
                        '  aminoacidsequence_id: 63165) { id } }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            let tcId = resBody.data.addTranscript_count.id;

            res = request('POST', baseUrl, {
                json: {
                    query: `{ readOneTranscript_count(id : ${tcId}) ` +
                        '{ id aminoacidsequence{id accession} } }'
                }
            });

            resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            expect(resBody).to.deep.equal({
                "data": {
                    "readOneTranscript_count": {
                        "aminoacidsequence": {
                            "accession": "P63165",
                            "id": "63165"
                        },
                        "id": `${tcId}`
                    }
                }
            });
        });
});




describe(
'CSV Batch Upload',
function() {

    it('01. Check individual validation', function() {
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: \"Not an alpha name\") { id } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        //The server shell return an error
        expect(res.statusCode).to.equal(500);
    });

    // The user e-mail here is the same that is used for sending data, it is sci.db.service@gmail.com (pwd: SciDbServiceQAZ)
    // but you can place any other recipient address. This test wont add anything into the database, because individual.csv
    // contains two lines that are rejected by the isAlpha validator for the individual name. If you remove these lines,
    // the test will make a batch add.

    it('02. Batch upload', function () {

        // Count the initial number of individuals
        let res = request('POST', baseUrl, {
            json: {
                query: '{ countIndividuals }'
            }
        });
        let cnt1 = JSON.parse(res.body.toString('utf8')).data.countIndividuals;

        // some dummy token for no_acl server mode (the const secret-key can be invalid with time)
        let token = jsonwebtoken.sign({
            id: 1,
            email: "sci.db.service@gmail.com",
            roles: "admin"
        }, 'something-secret', { expiresIn: '1h' });

        let formData = new FormData();
        let success = true;
        let csvPath = path.join(__dirname, 'individual.csv');


        formData.append('csv_file', fs.createReadStream(csvPath));
        formData.append('query', 'mutation {bulkAddIndividualCsv{ id}}');

        axios.post(baseUrl, formData,  {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Accept': 'application/graphql',
                'authorization' : token
            }
        }).then(function(response) {
            console.log("normal execution");
        }).catch(function(res) {
            if (res.response && res.response.data && Array
                .isArray(res.response.data)) {
                console.log("error 1");
            } else {
                let err = (res && res.response && res.response.data && res.response
                    .data.message ?
                    res.response.data.message : res);
                console.log(err);
            }
            success = false;
        });

        expect(success).equal(true);

        // Count the final number of individuals
        res = request('POST', baseUrl, {
            json: {
                query: '{ countIndividuals }'
            }
        });
        let cnt2 = JSON.parse(res.body.toString('utf8')).data.countIndividuals;

        expect(cnt1).equal(cnt2);
    });
});


describe(
    'Joi Validation tests',
    function() {

        it('01. Validate on add', function () {
            let res = request('POST', baseUrl, {
                json: {
                    query: 'mutation { addIndividual(name: "@#$%^&") { name } }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');
        });

        it('02. Validate on update', function () {

            // Add correct record
            let res = request('POST', baseUrl, {
                json: {
                    query: 'mutation { addIndividual(name: \"ToBeUpdated\") { id } }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            // Try to update to incorrect
            res = request('POST', baseUrl, {
                json: {
                    query: `mutation { updateIndividual(id: ${resBody.data.addIndividual.id}, name: "#$%^&*") {id name} }`
                }
            });

            resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');
        });

        it('03. Validate on delete', function () {

            // Add a record with a special name that can't be deleted
            let res = request('POST', baseUrl, {
                json: {
                    query: 'mutation { addIndividual(name: "Undeletable") { id } }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            // Try to delete an item with a special name that can't be deleted (see individual-validate-joi.patch for details)
            res = request('POST', baseUrl, {
                json: {
                    query: `mutation { deleteIndividual (id: ${resBody.data.addIndividual.id}) }`
                }
            });

            resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(500);
            expect(resBody).to.have.property('errors');
        });

    });

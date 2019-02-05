const { expect } = require('chai')
const request = require('sync-request')
const baseUrl = 'http://0.0.0.0:3000/graphql'

//dev_hint: ALTER SEQUENCE individuals_id_seq RESTART WITH 1;

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
                query: 'mutation { addIndividual(name: \"1 First\") { id } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        //TODO: Why individual.id is string, is it correct?
        expect(resBody.data.addIndividual.id).equal("1");
    });


    it('03. Individual update', function() {
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

    it('04. Individual add one more and find both', function() {
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
                    name: "2 Second"
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
                    {name: "2 Second"},
                    {name: "1 Update: First has Second in name"}
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

    it('20. TranscriptCount delete all', function() {
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


    // Test belongs-to relation between transcript_ount and individual data
    // model:
    it('21. Add Individual and assign it to TranscriptCount', function() {
        // Create Plant to subjected to RNA-Seq analysis from which the
      // transcript_counts result:
        let res = request('POST', baseUrl, {
            json: {
                query: 'mutation { addIndividual(name: \"Incredible Maize Plant One\") { id name } }'
            }
        });

        let resBody = JSON.parse(res.body.toString('utf8'));
        expect(res.statusCode).to.equal(200);

        expect(resBody.data.addIndividual.name).equal("Incredible Maize Plant One");
        let plantId = resBody.data.addIndividual.id

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
                  name: "Incredible Maize Plant One"
                }
              }
            }
        })
    });

});

describe(
    'Web service model',
    function() {

        it('01. Data server simulator is up', function() {
            let res = request('get', 'http://localhost:3344/aminoAcidSequence/P63165');

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            expect(resBody).to.deep.equal({
                "accession": "P63165",
                "id": "P63165",
                "sequence": "MSDQEAKPSTEDLGDKKEGEYIKLKVIGQDSSEIHFKVKMTTHLKKLKESYCQRQGVPMNSLRFLFEGQRIADNHTPKELGMEEEDVIEVYQEQTGGHSTV"
            });
        });

        it('02. Read one', function() {
            let res = request('POST', baseUrl, {
                json: {
                    query: '{ readOneAminoacidsequence(id : "P69905") { id accession sequence} }'
                }
            });

            let resBody = JSON.parse(res.body.toString('utf8'));
            expect(res.statusCode).to.equal(200);

            expect(resBody).to.deep.equal({
                "data": {
                    "readOneAminoacidsequence": {
                        "accession": "P69905",
                        "id": "P69905",
                        "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
                    }
                }
            });
        });
});

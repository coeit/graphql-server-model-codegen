const expect = require('chai').expect;
const test = require('./unit_test_misc/data_test');
const models = require('./unit_test_misc/data_models');
const funks = require('../funks');

describe('Lower-case models', function(){

  it('GraphQL Schema - transcript_count', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.transcript_countSchema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolver - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.individualResolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('Sequelize Model - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.individualModel.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });

});

describe('Empty associations', function(){

  it('GraphQL Schema - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.transcript_count_no_assoc_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - individual (no assoc)', async function(){
    let opts = funks.getOptions(models.individual_no_assoc);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.individual_no_assoc_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('Sequelize Model - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.transcript_count_no_assoc_model.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });


});

describe('Superfluous comma', function(){

  it('Sequelize Model - individual (no assoc)', async function(){
    let opts = funks.getOptions(models.individual_no_assoc);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.individual_no_assoc_model.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });

  it('Migration - transcript_count (no assoc)', async function(){
    let opts = funks.getOptions(models.transcript_count_no_assoc);
    let generated_migration =await funks.generateJs('create-migrations', opts);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = test.transcript_count_no_assoc_migration.replace(/\s/g, '');
    expect(g_migration).to.be.equal(test_migration);
  });
});

describe('No include associations by default', function(){
  it('Resolvers - transcript_count', async function(){
    let opts = funks.getOptions(models.transcript_count);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.transcript_count_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('Resolvers - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.person_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

});

describe('Limit for resolvers', function(){
  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.book_resolver_limit.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });
});

describe('Better name for search argument', function(){

  it('GraphQL Schema - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.researcher_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.researcher_resolver.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });
});

describe('Count for model', function(){

  it('GraphQL Schema - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.individual_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - individual', async function(){
    let opts = funks.getOptions(models.individual);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.individualResolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('Resolvers - specie', async function(){
    let opts = funks.getOptions(models.specie);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.specie_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });
});


describe('VueTable', function(){

  it('GraphQL Schema - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.book_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - book', async function(){
    let opts = funks.getOptions(models.book);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.book_resolver_table.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });
});

describe('Add instances query with associated records', function(){

  it('GraphQL Schema - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.person_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - person', async function(){
    let opts = funks.getOptions(models.person);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.person_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });
});

describe('Stream upload file', function(){

  it('Resolver - dog', async function(){
    let opts = funks.getOptions(models.dog);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.dog_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

});

describe('Migrations extend table', function(){

  it('Migration cross table - project_to_researcher', async function(){
    let assoc = models.assoc_through_project_researcher;
    let generated_migration =await funks.generateJs('create-through-migration', assoc);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = test.project_to_researcher_migration.replace(/\s/g, '');
    expect(g_migration).to.be.equal(test_migration);
  });

  it('Migration add column - dogs', async function(){
    let assoc = models.assoc_dogs_researcher;
    let generated_migration =await funks.generateJs('create-association-migration', assoc);
    let g_migration = generated_migration.replace(/\s/g, '');
    let test_migration = test.add_column_dogs_migration.replace(/\s/g, '');
    expect(g_migration).to.be.equal(test_migration);
  });

  it('Sequelize Model - researcher', async function(){
    let opts = funks.getOptions(models.researcher);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.researcher_model.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });


});



describe('Model naming - camelCase or any upper-lowe caser ', function(){

  it('Resolvers - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_resolvers =await funks.generateJs('create-resolvers-webservice', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.resolvers_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('GraphQL Schema - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.schema_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Model - aminoAcidSequence', async function(){
    let opts = funks.getOptions(models.aminoAcidSequence);
    let generated_model =await funks.generateJs('create-models-webservice', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.model_webservice_aminoAcid.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });

  it('Resolvers - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.individual_resolvers_camelcase.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('GraphQL Schema - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.individual_schema_camelcase.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Model - inDiVIdual', async function(){
    let opts = funks.getOptions(models.inDiVIdual_camelcase);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.individual_model_camelcase.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });

  it('GraphQL Schema - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_camelcase);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.transcriptCount_schema_camelcase.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Resolvers - transcriptCount', async function(){
    let opts = funks.getOptions(models.transcriptCount_indiv);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.transcriptCount_resolvers_camelcase.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

});

describe('Association name in resolver and queries', function(){
  it('Resolvers - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.dog_owner_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('GraphQL Schema - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.dog_owner_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });

  it('Model - Dog', async function(){
    let opts = funks.getOptions(models.dog_owner);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.dog_owner_model.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });

  it('Resolvers - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_resolvers =await funks.generateJs('create-resolvers', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.academicTeam_resolvers.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('GraphQL Schema - academicTeam', async function(){
    let opts = funks.getOptions(models.academicTeam);
    let generated_schema =await funks.generateJs('create-schemas', opts);
    let g_schema = generated_schema.replace(/\s/g, '');
    let test_schema = test.academicTeam_schema.replace(/\s/g, '');
    expect(g_schema).to.be.equal(test_schema);
  });
  //
  // it('Model - academicTeam', async function(){
  //   let opts = funks.getOptions(models.academicTeam);
  //   let generated_model =await funks.generateJs('create-models', opts);
  //   let g_model = generated_model.replace(/\s/g, '');
  //   let test_model = test.academicTeam_model.replace(/\s/g, '');
  //   expect(g_model).to.be.equal(test_model);
  // });


});

describe('Indices', function(){

  it('Migration - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_resolvers =await funks.generateJs('create-migrations', opts);
    let g_resolvers = generated_resolvers.replace(/\s/g, '');
    let test_resolvers = test.person_indices_migration.replace(/\s/g, '');
    expect(g_resolvers).to.be.equal(test_resolvers);
  });

  it('Model - Person', async function(){
    let opts = funks.getOptions(models.person_indices);
    let generated_model =await funks.generateJs('create-models', opts);
    let g_model = generated_model.replace(/\s/g, '');
    let test_model = test.person_indices_model.replace(/\s/g, '');
    expect(g_model).to.be.equal(test_model);
  });
});

describe('Monkey patching templates', function(){

    it('Validation - transcriptCount_indiv', async function(){
        let opts = funks.getOptions(models.transcriptCount_indiv);
        let generated_validation =await funks.generateJs('create-validations', opts);
        let g_resolvers = generated_validation.replace(/\s/g, '');
        let test_resolvers = test.transcriptCount_indiv_validation.replace(/\s/g, '');
        expect(g_resolvers).to.be.equal(test_resolvers);
    });

    it('Patch - dog_owner', async function(){
        let opts = funks.getOptions(models.dog_owner);
        let generated_patch =await funks.generateJs('create-patches', opts);
        let g_model = generated_patch.replace(/\s/g, '');
        let test_model = test.dog_owner_patch.replace(/\s/g, '');
        expect(g_model).to.be.equal(test_model);
    });
});

module.exports.transcriptCount_indiv_validation = `
transcriptCount.prototype.validatorSchema = Joi.object().keys({
    gene: Joi.string(),
    variable: Joi.string(),
    count: Joi.number(),
    tissue_or_condition: Joi.string()
}).options({
    allowUnknown: true
});
`

module.exports.dog_owner_patch = `
// Dear user, edit the schema to adjust it to your model
module.exports.logic_patch = function(dog) {

    // Write your patch code here
    // Hint 1: dog.prototype.function_name = function(...) {};
    // Hint 2: dog.prototype.property_name = {};

    return dog;
};
`

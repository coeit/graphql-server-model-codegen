module.exports.limit_records_model = `
if (globals.LIMIT_RECORDS < options['limit']) {
    throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
}
`

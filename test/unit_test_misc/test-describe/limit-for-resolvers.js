module.exports.book_resolver_limit = `
if (globals.LIMIT_RECORDS < options['limit']) {
    throw new Error(\`Request of total books exceeds max limit of \${globals.LIMIT_RECORDS}. Please use pagination.\`);
}
`

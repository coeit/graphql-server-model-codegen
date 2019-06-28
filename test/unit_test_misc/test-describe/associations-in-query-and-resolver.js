module.exports.person_schema = `
addPerson( firstName: String, lastName: String, email: String , addDogs:[ID], addBooks:[ID] ): Person!
updatePerson(id: ID!, firstName: String, lastName: String, email: String , addDogs:[ID], removeDogs:[ID] , addBooks:[ID], removeBooks:[ID] ): Person!

`

module.exports.person_resolvers = `
.then(person => {
    if (input.addDogs) {
        person.setDogs(input.addDogs);
    }
    if (input.addBooks) {
        person.setBooks(input.addBooks);
    }
    return person;
});
`

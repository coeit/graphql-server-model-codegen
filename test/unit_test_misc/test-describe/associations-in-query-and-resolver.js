module.exports.person_schema = `
addPerson( firstName: String, lastName: String, email: String , addDogs:[ID], addBooks:[ID] ): Person!
updatePerson(id: ID!, firstName: String, lastName: String, email: String , addDogs:[ID], removeDogs:[ID] , addBooks:[ID], removeBooks:[ID] ): Person!

`

module.exports.person_model = `
.then(item => {
    if (input.addDogs) {
        super.setDogs(input.addDogs);
    }
    if (input.addBooks) {
        super.setBooks(input.addBooks);
    }
    return item;
});
`

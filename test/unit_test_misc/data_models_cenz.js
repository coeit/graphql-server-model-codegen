module.exports.book = {
  "model" : "Book",
  "storageType" : "cenz_server",
  "url": "http://something.other:7000/graphql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisher_id": "Int"
  },
  "associations":{

      "Authors" : {
          "type" : "to_many",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "cenz_server",
          "label" : "firstName",
          "sublabel" : "email"
        },
      "publisher" : {
        "type" : "to_one",
        "target" : "publi_sher",
        "targetKey" : "publisher_id",
        "keyIn" : "Book",
        "targetStorageType" : "webservice",
        "label" : "name"
        }
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "cenz_server",
  "url": "http://something.other:7000/graphql",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "companyId": "Int"
  },
  "associations":{
    "works":{
      "type" : "to_many",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "cenz_server",
      "label" : "title"
    },

    "company":{
      "type": "to_one",
      "target": "publi_sher",
      "targetKey": "companyId",
      "keyIn": "Person",
      "targetStorageType": "webservice"
    }
  }
}

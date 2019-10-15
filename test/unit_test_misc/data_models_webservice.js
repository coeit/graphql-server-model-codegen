module.exports.book =
{
  "model": "book",
  "storageType": "webservice",
  "attributes": {
    "title": "String",
    "subject": "String",
    "Price": "Float",
    "publisher_id": "Int"
  },
  "associations": {
      "publisher" : {
        "type": "to_one",
        "target": "publi_sher",
        "targetKey": "publisher_id",
        "keyIn": "book",
        "targetStorageType": "webservice"
      },

      "authors": {
        "type": "to_many",
        "target": "Person",
        "targetKey": "person_id",
        "sourceKey": "book_id",
        "targetStorageType": "webservice"
      }
  }
}

module.exports.person =
{
  "model": "Person",
  "storageType": "webservice",
  "attributes" :{
    "firstName": "String",
    "lastName": "String",
    "Age": "Int",
    "companyId": "Int"
  },

  "associations" : {
    "works" : {
      "type": "to_many",
      "target": "book",
      "targetKey": "book_id",
      "sourceKey": "person_id",
      "targetStorageType": "webservice"
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

module.exports.publisher =
{
  "model" : "publi_sher",
  "storageType" : "webservice",
  "attributes": {
    "name" : "String",
    "phone" : "String"
  },

  "associations": {
    "publications" : {
      "type": "to_many",
      "target": "book",
      "targetKey": "publisher_id",
      "keyIn": "book",
      "targetStorageType": "webservice"
    },

    "director":{
      "type":"to_one",
      "target": "Person",
      "targetKey": "companyId",
      "keyIn": "Person",
      "targetStorageType": "webservice"
    }
  }
}

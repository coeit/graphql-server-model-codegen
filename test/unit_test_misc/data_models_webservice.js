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
        "type": "belongsTo",
        "target": "publi_sher",
        "targetKey": "publisher_id",
        "targetStorageType": "webservice"
      },

      "authors": {
        "type": "belongsToMany",
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
      "type": "belongsToMany",
      "target": "book",
      "targetKey": "book_id",
      "sourceKey": "person_id",
      "targetStorageType": "webservice"
    },

    "company":{
      "type": "belongsTo",
      "target": "publi_sher",
      "targetKey": "companyId",
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
      "type": "hasMany",
      "target": "book",
      "targetKey": "publisher_id",
      "targetStorageType": "webservice"
    },

    "director":{
      "type":"hasOne",
      "target": "Person",
      "targetKey": "companyId",
      "targetStorageType": "webservice"
    }
  }
}

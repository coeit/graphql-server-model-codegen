module.exports.transcript_count = {
  "model" : "transcript_count",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String",
    "individual_id": "Int"
  },
  "associations":{
    "individual":{
      "type" : "belongsTo",
      "target" : "individual",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.individual = {
  "model" : "individual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  },
  "associations": {
    "transcript_counts": {
      "type" : "hasMany",
      "target" : "transcript_count",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.individual_no_assoc = {
  "model" : "individual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  }
}

module.exports.transcript_count_no_assoc =  {
  "model" : "transcript_count",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "hasMany",
      "target" : "Dog",
      "targetKey" : "personId",
      "targetStorageType" : "sql"
    },

    "books":{
      "type" : "belongsToMany",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.book = {
  "model" : "Book",
  "storageType" : "sql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisherId": "Int"
  },
  "associations":{

      "people" : {
          "type" : "belongsToMany",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "sql"
        },
      "publisher" : {
        "type" : "belongsTo",
        "target" : "Publisher",
        "targetKey" : "publisherId",
        "targetStorageType" : "webservice"
        }
  }
}

module.exports.researcher = {
  "model" : "Researcher",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "projects":{
      "type" : "belongsToMany",
      "target" : "Project",
      "targetKey" : "projectId",
      "sourceKey" : "researcherId",
      "keysIn" : "project_to_researcher",
      "targetStorageType" : "sql"
    },
    "dog":{
      "type": "hasOne",
      "target": "Dog",
      "targetKey": "researcherId",
      "targetStorageType": "sql"
    }
  }
}

module.exports.specie = {
  "model" : "Specie",
  "storageType" : "webservice",
  "attributes" : {
    "nombre" : "String",
    "e_nombre_comun_principal" : "String",
    "e_foto_principal" : "String",
    "nombre_cientifico" : "String"
  },

  "associations":{
    "projects" : {
      "type" : "hasMany",
      "target" : "Project",
      "targetKey" : "specieId",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.dog = {
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String"
  },

  "associations" : {
    "person" : {
      "type" : "belongsTo",
      "target" : "Person",
      "targetKey" : "personId",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    },
    "researcher":{
      "type" : "belongsTo",
      "target": "Researcher",
      "targetKey": "researcherId",
      "targetStorageType": "SQL",
      "label": "firstName"
    }
  }
}

module.exports.assoc_through_project_researcher = {
  "type" : "sql_belongsToMany",
  "target" : "Project",
  "targetKey" : "projectId",
  "sourceKey" : "researcherId",
  "keysIn" : "project_to_researcher",
  "targetStorageType" : "sql",
  "source": "researchers",
  "target_lc": "project",
  "target_lc_pl": "projects",
  "target_pl": "Projects",
  "target_cp": "Project",
  "target_cp_pl": "Projects"
}

module.exports.assoc_dogs_researcher = {
  "type" : "sql_belongsTo",
  "target": "Researcher",
  "targetKey": "researcherId",
  "targetStorageType": "SQL",
  "target_lc": "researcher",
  "target_lc_pl": "researchers",
  "target_pl": "Researchers",
  "target_cp": "Researcher",
  "target_cp_pl": "Researchers",
  "source": "dogs",
  "cross": false
}

module.exports.aminoAcidSequence = {
  "model": "aminoAcidSequence",
  "storageType": "webservice",
  "attributes": {
    "accession": "String",
    "sequence": "String"
  }
}

//upper an lower case models name
module.exports.inDiVIdual_camelcase = {
  "model" : "inDiVIdual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  },
  "associations": {
    "transcriptCounts": {
      "type" : "hasMany",
      "target" : "transcriptCount",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "gene",
      "sublabel" : "variable"
    }
  }
}

//upper an lower case models name
module.exports.transcriptCount_camelcase = {
  "model" : "transcriptCount",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String",
    "individual_id": "Int"
  },
  "associations":{
    "inDiVIdual":{
      "type" : "belongsTo",
      "target" : "inDiVIdual",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}


//upper an lower case models name
module.exports.transcriptCount_indiv= {
  "model" : "transcriptCount",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  },
  "associations":{
    "individual":{
      "type" : "belongsTo",
      "target" : "Individual",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}


module.exports.dog_owner = {
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "owner_id_test": "Int",
    "keeperId": "Int"
  },

  "associations" : {
    "owner" : {
      "type" : "belongsTo",
      "target" : "Person",
      "targetKey" : "owner_id_test",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    },
    "keeper":{
      "type" : "belongsTo",
      "target": "Researcher",
      "targetKey": "keeperId",
      "targetStorageType": "SQL",
      "label": "firstName"
    }
  }
}

module.exports.person_indices = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "phone" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "hasMany",
      "target" : "Dog",
      "targetKey" : "personId",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "books":{
      "type" : "belongsToMany",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql",
      "label" : "title"
    }
  },

  "indices": ["email", "phone"]
}

module.exports.academicTeam = {
  "model" : "academicTeam",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "department" : "String",
    "subject": "String"
  },
  "associations":{
    "members":{
      "type" : "hasMany",
      "target" : "Researcher",
      "targetKey" : "academicTeamId",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  }

}

module.exports.person_date = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "birthday": "Date"
  },
  "associations":{
    "dogs":{
      "type" : "hasMany",
      "target" : "Dog",
      "targetKey" : "personId",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "patients":{
      "type" : "hasMany",
      "target" : "Dog",
      "targetKey" : "doctor_Id",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "books":{
      "type" : "belongsToMany",
      "target" : "Book",
      "targetKey" : "book_Id",
      "sourceKey" : "person_Id",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql",
      "label" : "title"
    }

  }
}

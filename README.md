# Code-generator

Command line utility to auto-generate the structure files that [this server](https://github.com/ScienceDb/graphql-server)
will use to perform CRUD operations for each model created.

## Set up:
Clone the repository and run:
```
$ npm install -g
```
If you only want to install it locally run `npm install` instead

## Usage:

To run the unit-test case:
```
$ npm run test-unit
```

To run the integration-test case
```
$ npm run test-integration <-- params>
```
Note: intergation-test case creates a docker-compose ambient with three servers `gql_postgres`,
`gql_science_db_graphql_server` and `gql_ncbi_sim_srv`. By default, after the test run, all
corresponding images will be completely removed from the docker. However, to speed-up the
development process it is possible to not remove the selected images. Each of the images that
wou prefer to keep alive shell be preceeded with the `-k` or `--keep-image` key. For example:
```
$ npm run test-integration -- -k gql_ncbi_sim_srv -k gql_science_db_graphql_server
```


And to generate the structure files:
```
$ code-generator -f <input-json-files> -o <output-directory>
```
```
INPUT:
<input-json-files> - directory where json models are stored
<output-directory> - directory where the generated code will be written
```
This command will create(if doesn't exist) four folders containing the generated files for each model in the ```input-json-files```:

* models ----> sequelize model
* schemas ----> graphQL schema
* resolvers ----> basic CRUD resolvers
* migrations ----> create and delete table migration file


## Example of use:
In the same directory of this repository run:

```
$ code-generator -f ./example_json_files -o /your_path_directory
```
If you want to complete the example with the [server](https://github.com/ScienceDb/graphql-server)
make ```/your_path_directory``` the same directory where the server repository is stored.

NOTE: For displaying the explanation about usage we can run the help flag:
```
$ code-generator -h
```
```
Code generator for GraphQL server

 Options:

   -f, --jsonFiles <filesFolder>      Folder containing one json file for each model
   -o, --outputDirectory <directory>  Directory where generated code will be written
   -h, --help                         output usage information
```

## JSON files Spec

Each json file describes one and only one model. (i.e if an association involves two models, this association needs to be specified in both json files, corresponding to each model).

For each model we need to specify the following fields in the json file:

Name | Type | Description
------- | ------- | --------------
*model* | String | Name of the model (it is recommended uppercase for the initial character).
*storageType* | String | Type of storage where the model is stored. So far can be one of __sql__ or __Webservice__
*attributes* | Object | The key of each entry is the name of the attribute and theres two options for the value . Either can be a string indicating the type of the attribute or an object where the user can indicates the type of the attribute(in the _type_ field) but also can indicates an attribute's description (in the _description_ field). See the [table](#types-spec) below for allowed types. Example of option one: ```{ "attribute1" : "String", "attribute2: "Int" }``` Example of option two: ``` { "attribute1" : {"type" :"String", "description": "Some description"}, "attribute2: "Int ```
*associations* | Object | The key of each entry is the name of the association and the value should be an object describing the associations. See [Associations Spec](associations-spec) section below for the specifications of the associations.

EXAMPLES OF VALID JSON FILES

```
//Dog.json
{
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String"
  },

  "associations" : {
    "person" : {
      "type" : "sql_belongsTo",
      "target" : "Person",
      "targetKey" : "personId",
      "targetStorageType" : "sql"
    }
  }
}

```

```
//Publisher.json
{
  "model" : "Publisher",
  "storageType" : "webservice",
  "attributes" : {
    "name" : "String",
    "phone" : "String"
  },
  "associations":{
      "books" : {
          "type" : "cross_hasMany",
          "target" : "Book",
          "targetKey" : "publisherId",
          "targetStorageType" : "sql"
        }
  }
}
```



### Types Spec
The following types are allowed for the attributes field

 Type |
------- |
String |
Int |
Float |
Boolean |
Date |
Time |
DateTime |

For more info about `Date`, `Time`, and `DateTime` types, please see this [info](https://github.com/excitement-engineer/graphql-iso-date/blob/HEAD/rfc3339.txt).

Example:
* Date: A date string, such as `2007-12-03`.
* Time: A time string at UTC, such as `10:15:30Z`.
* DateTime: A date-time string at UTC, such as `2007-12-03T10:15:30Z`

### Associations Spec

We will consider four possible types of associations:
1. belongsTo
2. hasOne
3. hasMany
4. belongsToMany

For all type of association, except for association of type 4 (belongsToMany), the necessary arguments would be:

name | Type | Description
------- | ------- | --------------
*type* | String | Type of association (like belongsTo, etc.)
*target* | String | Name of model to which the current model will be associated with.
*targetKey* | String | A unique identifier of the association for the case where there appear more than one association with the same model.
*targetStorageType* | String | Type of storage where the target model is stored. So far can be one of __sql__ or __Webservice__.
*label* | String | Name of the column in the target model to be used as a display name in the GUI.
*sublabel* | String | Optional name of the column in the target model to be used as a sub-label in the GUI.

When association is of type 4, it's necessary to describe two extra arguments given that the association is made with a cross table. These arguments are:

name | Type | Description
------- | ------- | --------------
*sourceKey* | String | Key to identify the source id
*keysIn* | String | Name of the cross table

## NOTE:
Be aware that in the case of an association _belongsToMany_ the user is required to describe the cross table used in the field _keysIn_ as a model in its own. For example, if we have a model `User` and a model `Role` and they are associated in a _manytomany_ way, then we also need to describe the `role_to_user` model:

```
//User model
{
  "model" : "User",
  "storageType" : "SQL",
  "attributes" : {
    "email" : "String",
    "password" : "String"
  },
  "associations" :{
    "roles" : {
      "type" : "belongsToMany",
      "target" : "Role",
      "targetKey" : "role_Id",
      "sourceKey" : "user_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "name"
    }
  }

}
```

```
//Role model
{
  "model" : "Role",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "description" : "String"
  },
  "associations" : {
    "users" : {
      "type" : "belongsToMany",
      "target" : "User",
      "targetKey" : "user_Id",
      "sourceKey" : "role_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "email"
    }
  }
}
```

```
//role_to_user model
{
  "model" : "role_to_user",
  "storageType" : "SQL",
  "attributes" : {
    "user_Id" : "Int",
    "role_Id" : "Int"
  }
}

```

## NOTE:
 It's important to notice that when a model involves a _belongsTo_ association then foreign key that refers remote elements should be explicitly written into the attributes field of the given local model.

Example:
```
{
  "model" : "book",
  "storageType" : "sql",
  "attributes" : {
    "title" : {"type":"String", "description": "The book's title"},
    "publisher_id": "Int"
  },
  "associations":{
      "publisher" : {
        "type" : "belongsTo", // FK to publisher will be stored in the Book model
        "target" : "publisher", // Model's name is `publisher`
        "targetKey" : "publisher_id", // Local alias for this association
        "targetStorageType" : Webservice", //  It's a remote database
        "label" : "name" // Show in GUI the name of the publisher taken from external DB
        }
  }
}
```

## NOTE:
THE SAME DATA MODELS DESCRIPTION(.json files) WILL BE USEFUL FOR GENERATING BOTH, THE BACKEND DESCRIBED HERE AND [THE FRONTEND OR GUI](https://github.com/ScienceDb/single-page-app-codegen).

Fields *`label`* and *`sublabel`* in the specification are only needed by the GUI generator, but backend generator will only read required information, therefore extra fields such as *`label`* and *`sublabel`* will be ignored by the backend generator.
Example:
```
//book.json
{
 "model" : "Book",
 "storageType" : "SQL",
 "attributes" : {
        "id" : Int,
        "title" : {"type":"String", "description": "The book's title"},
        "ISBN": Int
    },
 "associations" : {
        "authors" : {
            "type" : "sql_belongsToMany",
            "target" : "Person",
            "targetKey" : "person_id",
            "sourceKey" : "book_id",
            "keysIn" : "person_to_book",
            "targetStorageType" : "sql",
            "label": "name",
            "sublabel": "lastname"
        }
    }
}
```

## Testing

For relevant files see `package.json` (section scripts), directories `.test` and `docker`. Test framework is `mocha` and `chai`.

### Unit tests

Run all existing unit tests with
```
npm run test-unit
```

### Integration tests

#### Requirements

You need to be on a \*nix operating system, and have bash and Docker installed and running.

Integration tests are carried out using Docker to setup a GraphQL web server and generate code for example data models. The last step of the setup is to create databases and migrate schemas. After that the server is started using `localhost:3000`, which can than be accessed using HTTP. Solely via such HTTP connections the generated API (GraphQL web server) is tested, just as a user might be doing with e.g. `curl`.

All related Docker files are stored in `./docker`; especially `docker-compose-test.yml`.

The test pipeline is defined and executed in `./test/integration-test.bash` for reasons of simplicity. The actual integration tests are written using `mocha` and can be found in `./test/mocha_integration_test.js`, which is invoked by the above bash script.

To ecexute the integration tests run
```
npm run test-integration
```

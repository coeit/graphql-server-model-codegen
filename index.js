#!/usr/bin/env node

const program = require('commander');
var fs = require('fs');
const funks = require('./funks');

program
  .description('Code generator for GraphQL server')
  .option('-f, --jsonFiles <filesFolder>', 'Folder containing one json file for each model')
  .option('-o, --outputDirectory <directory>', 'Directory where generated code will be written')
  .parse(process.argv);
// program
//   .command('generate <json-files-folder> [dir_to_write]')
//   .alias('g')
//   .description('Generate code for each model described by each input json file in the \'json-files-folder\'')
//   .action((json_dir, dir_write) => {
//       //Generate full code : models, schemas, resolvers, migrations
//       funks.generateCode(json_dir, dir_write);
//
//   });

//program.parse(process.argv);


if(!program.jsonFiles){
  console.log("ERROR: You must indicate the json files in order to generate the code.");
  process.exit(1);
}

let directory = program.outputDirectory || __dirname;

funks.generateCode(program.jsonFiles, directory);

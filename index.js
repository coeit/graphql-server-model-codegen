#!/usr/bin/env node

const program = require('commander');
var fs = require('fs');
const funks = require('./funks');

program
  .description('Code generator for GraphQL server')
  .option('-f, --jsonFiles <filesFolder>', 'Folder containing one json file for each model')
  .option('-o, --outputDirectory <directory>', 'Directory where generated code will be written')
  .parse(process.argv);


if(!program.jsonFiles){
  console.log("ERROR: You must indicate the json files in order to generate the code.");
  process.exit(1);
}

let directory = program.outputDirectory || __dirname;

funks.generateCode(program.jsonFiles, directory);

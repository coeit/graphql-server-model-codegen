module.exports.dog_resolvers = `
/**
 * bulkAddDogCsv - Load csv file of records
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
bulkAddDogCsv: function(_, context) {
    return checkAuthorization(context, 'Dog', 'create').then(authorization => {
        if (authorization === true) {

            delim = context.request.body.delim;
            cols = context.request.body.cols;
            tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

            context.request.files.csv_file.mv(tmpFile).then(() => {

                fileTools.parseCsvStream(tmpFile, dog, delim, cols).then((addedZipFilePath) => {
                    try {
                        console.log(\`Sending \${addedZipFilePath} to the user.\`);

                        let attach = [];
                        attach.push({
                            filename: path.basename("added_data.zip"),
                            path: addedZipFilePath
                        });

                        email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                            'ScienceDB batch add',
                            'Your data has been successfully added to the database.',
                            attach).then(function(info) {
                            fileTools.deleteIfExists(addedZipFilePath);
                            console.log(info);
                        }).catch(function(err) {
                            fileTools.deleteIfExists(addedZipFilePath);
                            console.log(err);
                        });

                    } catch (error) {
                        console.log(error.message);
                    }

                    fs.unlinkSync(tmpFile);
                }).catch((error) => {
                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add', \`\${error.message}\`).then(function(info) {
                        console.log(info);
                    }).catch(function(err) {
                        console.log(err);
                    });

                    fs.unlinkSync(tmpFile);
                });

            }).catch((error) => {
                return new Error(error);
            });

        } else {
            return new Error("You don't have authorization to perform this action");
        }
    }).catch(error => {
        return error;
    })
}
`

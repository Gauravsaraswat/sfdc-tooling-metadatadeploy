var path = require('path');
var fs = require('fs');

class FileSystemIO{

    constructor(){
        this.backupDir = '/Users/gaurav/SFDX/DevOrg/metadata/BackUp';
    }

    createBackup(fileName){
        console.log('Copying Started of-> ' +fileName + ' to ' + path.dirname(fileName).replace('/unpackaged/','/BackUp/')+'/'+path.basename(fileName));
        fs.createReadStream(fileName).pipe(fs.createWriteStream(path.dirname(fileName).replace('/unpackaged','/BackUp')+'/'+path.basename(fileName)));
    }
    

    readFile(fileName){
        return new Promise(function(resolve,reject){
            fs.createReadStream(fileName).on('data', (chunk) => {
                resolve(`${chunk}`);
            });
        });
    }

    matchFileContent(SourceFileName, StringToCompare){
        return new Promise(function(resolve,reject){
            fs.createReadStream(SourceFileName).on('data', (chunk) => {
                resolve(StringToCompare.replace(/\s/g, "") == `${chunk}`.replace(/\s/g, ""));
            });
        });
    }
}

module.exports = new FileSystemIO();
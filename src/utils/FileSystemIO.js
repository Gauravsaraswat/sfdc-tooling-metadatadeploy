var path = require('path');
var fs = require('fs');

class FileSystemIO{

    constructor(){
        this.backupDir = '/Users/gaurav/SFDX/DevOrg/metadata/BackUp';
    }

    createBackup(fileName){
        console.log('Copying Started of-> ' +fileName + ' to ' + path.dirname(fileName).replace('/unpackaged/','/BackUp/')+'/'+path.basename(fileName));
        return new Promise(function(resolve,reject){
            var reqStream = fs.createReadStream(fileName).pipe(fs.createWriteStream(path.dirname(fileName).replace('/unpackaged','/BackUp')+'/'+path.basename(fileName)));
            reqStream.on('finish', function () { resolve() });
        });
    }
    

    readFile(fileName){
        return new Promise(function(resolve,reject){
            fs.createReadStream(fileName).on('data', (chunk) => {
                resolve(`${chunk}`);
            });
        });
    }

    saveFileContent(fileName,StringContent){
        return new Promise(function(resolve,reject){
            fs.writeFile(fileName, StringContent, function (err) {
                if (err) throw err;
                resolve(true);
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
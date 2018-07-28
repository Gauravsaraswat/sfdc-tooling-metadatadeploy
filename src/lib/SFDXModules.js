var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var jsforce = require('./JSForceConnection');
var ApexCode = require('../metadata/Schema/ApexCodeSchema');
var Bundle = require('../metadata/Schema/AuraDefinitionSchema');

const username = 'gauravsaraswat@appirio.com.training';
const password = 'vlocity@2018O03GtBIe0OerymihshdGzk1WO';
const readline = require('readline');
const mapping = require('../utils/MetadataMapping');
const depoyDirectory = '/Users/gaurav/SFDX/DevOrg/metadata/DeployDir';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

exports.listOrgs = function(){
    return execPromise("sfdx force:org:list");
}

exports.authSetup = function(AliasName){
    return execPromise("sfdx force:auth:web:login --setalias "+AliasName);
}

exports.validationAsync = function(fileName){
    jsforce.createConnection(username,password)
    .then(function(response){
        if(!fileName.includes('/aura/')){
            var MetadataName = mapping[mapping['ExtensionToFolder'][path.extname(fileName)]]['xmlName'];
            var code = new ApexCode(MetadataName,fileName,path.extname(fileName));
            code.deployCode(fileName);
        }
        else{
            var bundle = new Bundle('AuraDefinition',fileName);
            bundle.deployCode(fileName);
        }
    }).catch(function(error){
        console.log(error);
    });
}

exports.saveCurrentFile = function(AliasName,fileName){
    return new Promise(function(resolve,reject){
        validateCurrentFile(fileName)
        .then(function(value){
            // var str = "sfdx force:mdapi:deploy -d "+depoyDirectory+' -l NoTestRun -u '+AliasName+' -w 10';
            // console.log('Deploying with...'+str);
            // execPromise(str).then(
            //     function(value){
            //         resolve(value);
            //     }
            // ).catch(
            //     function(value){
            //         console.log('exception occured in deploying');
            //         reject(value);
            //     }
            // );
        })
        .catch(function(){
            console.log('exception occured in saving current file');
        });
    });
}

function validateCurrentFile(fileName){
    return new Promise(function(resolve,reject){
        deleteFolderRecursive(depoyDirectory);
        if (!fs.existsSync(depoyDirectory)){
            console.log('creating deploy direct');
            fs.mkdirSync(depoyDirectory);
        }
        moveCurrentFile(fileName);
        console.log('pakaging started');
        preparePackageXML()
        .then(
            function(value){
                resolve(value);
            })
        .catch(
            function(value){
                reject(value);
            }
        );
    });
}

function preparePackageXML(){
    return execPromise('sgp -s '+depoyDirectory+' -o ' + depoyDirectory);
}

function moveCurrentFile(fileName){
    fs.stat(fileName,function(err,stats){
        if(stats.isFile()){
            var folderName = mapping['ExtensionToFolder'][path.extname(fileName)];
            var destination = depoyDirectory + '/' + folderName;
            if (!fs.existsSync(destination)){
                fs.mkdirSync(destination);
            }
            moveFile(fileName,destination);
            if (fs.existsSync(fileName+'-meta.xml')){
                moveFile(fileName+'-meta.xml',destination);
            }
            else{
                console.log('metadata File Does Not Exist');
            }
        }
    });
}

function moveDirectoryFiles(sourceDirectory,destinationDirectory){
    fs.readdir(sourceDirectory, function(err, filenames) {
        if(err){
            return ;
        }
        filenames.forEach(file => {
            fs.state(sourceDirectory+'/'+file,function(err,stats){
                if(stats.isFile()){
                    moveFile(sourceDirectory+'/'+file,destinationDirectory);
                }
                else{
                    moveDirectoryFiles(sourceDirectory+'/'+file,destinationDirectory);
                }
            });
        });
    });
}

function createBackup(fileName){
    movefile(fileName,path.dirname(fileName).replace('/unpackaged/','/BackUp/'));
}

function moveFile(fileName,destinationDirectory){
    console.log('Copying Started of-> ' +fileName + ' to ' + destinationDirectory+'/'+path.basename(fileName));
    fs.createReadStream(fileName).pipe(fs.createWriteStream(destinationDirectory+'/'+path.basename(fileName)));
    console.log('Copy Done...');
}

exports.preparePackageXML = function(){
    return execPromise("sfdx force:org:list");
}

exports.promptInput = function(message){
    return new Promise(function(resolve, reject){
        rl.setPrompt(message);
        rl.prompt();
        rl.on('line', (answer) => {
            if(answer){
                rl.close();
                resolve(answer);
            }
            else{
                rl.setPrompt('* '+message);
                rl.prompt();
            }
        });
    });
}

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

function readFile(fileName){
    return new Promise(function(resolve,reject){
        fs.createReadStream(fileName).on('data', (chunk) => {
            resolve(`${chunk}`);
        });
    });
}
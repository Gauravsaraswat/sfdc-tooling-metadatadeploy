var path = require('path');
var jsforce = require('./JSForceConnection');
var ApexCode = require('../metadata/Schema/ApexCodeSchema');
var Bundle = require('../metadata/Schema/AuraDefinitionSchema');

const username = 'gauravsaraswat@appirio.com.training';
const password = 'vlocity@2018O03GtBIe0OerymihshdGzk1WO';
const mapping = require('../utils/MetadataMapping');

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

exports.refreshMetadata = function(fileName){
    jsforce.createConnection(username,password)
    .then(function(response){
        if(!fileName.includes('/aura/')){
            var MetadataName = mapping[mapping['ExtensionToFolder'][path.extname(fileName)]]['xmlName'];
            var code = new ApexCode(MetadataName,fileName,path.extname(fileName));
            code.refreshCode(fileName);
        }
        else{
            var bundle = new Bundle('AuraDefinition',fileName);
            bundle.refreshCode(fileName);
        }
    }).catch(function(error){
        console.log(error);
    });

}
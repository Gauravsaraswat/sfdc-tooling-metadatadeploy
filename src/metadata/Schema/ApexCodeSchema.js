var jsforce = require('../../lib/JSForceConnection');
var path = require('path');
var fs = require('fs');
var fileIO = require('../../utils/FileSystemIO');

class ApexCode{

    constructor(MetadataName,fileName,extensionName){
        this.MetadataName = MetadataName;
        this.fileName = fileName;
        this.extensionName = extensionName;
    }

    deployCode(fileName){
        var apexBody,contentId,containerId,memberId;
        let MetadataName = this.MetadataName;
        let extensionName = this.extensionName; 
        var self = this;
        this.readFile(fileName).
        then(function(response){
            apexBody = response;
            return jsforce.QueryRecordByObjectNameForApexCode(MetadataName,path.basename(fileName,extensionName));
        }).
        then(function(response){
            contentId = response[0].id != null ? response[0].id : response[0].Id;
            return fileIO.matchFileContent(fileName.replace('/unpackaged','/BackUp'),response[0].Body);
        }).
        then(function(response){
            if(response){
                return jsforce.QueryRecordByObjectName('MetadataContainer','ThirdContainer');
            }
            else{
                throw Error ('Going to override');
            }
        }).
        then(function(response){
            if(!response){
                return jsforce.createToolingMetadata('MetadataContainer',{'Name': "ThirdContainer"});
            }
            else{
                return response[0];
            }
        }).
        then(function(response){
            containerId = response.id != null ? response.id : response.Id;
            return jsforce.createToolingMetadata(MetadataName+'Member',{'body': apexBody,
                                                                    'MetadataContainerId' : containerId,
                                                                    "ContentEntityId" : contentId});
        }).
        then(function(response){
            memberId = response.id; 
            return jsforce.createToolingMetadata('ContainerAsyncRequest',{'IsCheckOnly': false,
                                                                            'IsRunTests': false,
                                                                            'MetadataContainerId' : containerId,
                                                                            'MetadataContainerMemberId':memberId });
        }).
        then(function(response){
            console.log('Deployment Done');
            self.createBackup(fileName);
        }).
        catch(function(reject){
            console.log('Failed Because ->'+reject);
            process.exit();
        });
    }

    createBackup(fileName){
        console.log('Copying Started of-> ' +fileName + ' to ' + path.dirname(fileName).replace('/unpackaged/','/BackUp/')+'/'+path.basename(fileName));
        fs.createReadStream(fileName).pipe(fs.createWriteStream(path.dirname(fileName).replace('/unpackaged','/BackUp')+'/'+path.basename(fileName)));
        console.log('Copy Done...');
    }

    readFile(fileName){
        return new Promise(function(resolve,reject){
            fs.createReadStream(fileName).on('data', (chunk) => {
                resolve(`${chunk}`);
            });
        });
    }
}

module.exports = ApexCode;
var jsforce = require('../../lib/JSForceConnection');
var path = require('path');
var fileIO = require('../../utils/FileSystemIO');

class AuraDefinition{

    constructor(MetadataName,fileName){
        this.MetadataName = MetadataName;
        this.fileName = fileName;
        this.mapping = {'.cmp':'XML','.js':'JS','.css':'CSS'};
        this.mappingDefType = {'.app':'APPLICATION',
                        '.cmp':'COMPONENT',
                        '.evt':'EVENT',
                        'CONTROLLER':'CONTROLLER',
                        'HELPER':'HELPER',
                        'RENDERER':'RENDERER',
                        'STYLE':'STYLE',
                        'DOCUMENTATION':'DOCUMENTATION',
                        '.design':'design',
                        '.svg':'SVG'};
    }

    deployCode(fileName){
        var content,contentId;
        let MetadataName = this.MetadataName;
        let mapping = this.mapping;
        let defType = this.findDefType(path.basename(fileName));
        fileIO.readFile(fileName).
        then(function(response){
            content = response;
            return jsforce.QueryRecordByFields('AuraDefinition',{'AuraDefinitionBundle.DeveloperName':path.dirname(fileName).split(path.sep).pop(),
                                                                 'DefType':defType},'Id,Source');
        }).
        then(function(response){
            contentId = response[0].id != null ? response[0].id : response[0].Id;
            return fileIO.matchFileContent(fileName.replace('/unpackaged','/BackUp'),response[0].Source);
        }).
        then(function(response){
            if(response){
                return jsforce.updateToolingMetadata(MetadataName,{'Source': content,
                                                                "Id" : contentId,
                                                                "DefType" : defType,
                                                                "Format":mapping[path.extname(fileName)]});
            }
            else{
                throw Error ('Going to override');
            }
        }).
        then(function(response){
            return fileIO.createBackup(fileName);
        }).
        then(function(response){
            console.log('Deployment Done');
            process.exit();
        }).
        catch(function(reject){
            console.log('Failed Because ->'+reject);
            process.exit();
        });
    }

    refreshCode(fileName){
        var content;
        let defType = this.findDefType(path.basename(fileName));
        jsforce.QueryRecordByFields('AuraDefinition',{'AuraDefinitionBundle.DeveloperName':path.dirname(fileName).split(path.sep).pop(),
                                                                 'DefType':defType},'Id,Source').
        then(function(response){
            content = response[0].Source;
            return fileIO.saveFileContent(fileName,content);
        }).
        then(function(response){
            return fileIO.createBackup(fileName);
        }).
        then(function(response){
            console.log('Refresh Done');
            process.exit();
        }).
        catch(function(exe){
            console.log('Failed Because ->'+exe);
            process.exit();
        });
    }


    findDefType(baseFileName){
        let defTypeMapper = this.mappingDefType;
        let matchedEle;
        Object.keys(defTypeMapper).forEach(function (mappingEle) {
            if(baseFileName.toUpperCase().includes(mappingEle) || path.extname(baseFileName).toLowerCase() == mappingEle){
                matchedEle = defTypeMapper[mappingEle];
            }
        });
        return matchedEle;
    }

}

module.exports = AuraDefinition;
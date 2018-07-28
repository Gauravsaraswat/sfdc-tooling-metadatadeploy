var str = require('../lib/DeploymentFactory');
console.log('Initializing..');
if(process.argv[2]){
    currentFileName = process.argv[2];
    console.log('sending'+currentFileName);
    str.refreshMetadata(currentFileName);
}
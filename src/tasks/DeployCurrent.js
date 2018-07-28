var str = require('../lib/SFDXModules');

console.log('Initializing...');


if(process.argv[2]){
    currentFileName = process.argv[2];
    console.log('sending'+currentFileName);
    str.validationAsync(currentFileName);
}

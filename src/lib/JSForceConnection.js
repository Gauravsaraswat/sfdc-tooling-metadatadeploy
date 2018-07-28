"use strict";
var jforce = require('jsforce');

class JSForce{

    constructor(){
        this.con = new jforce.Connection({
            // you can change loginUrl to connect to sandbox or prerelease env.
            loginUrl : 'https://login.salesforce.com'
        });
    }

    createConnection(username,password){
        return this.con.login(username, password);
    }

    createToolingMetadata(MetadataName,ObjRecMap){
        return this.con.tooling.sobject(MetadataName)
                               .create(ObjRecMap);
    }

    updateToolingMetadata(MetadataName,ObjRecMap){
        return this.con.tooling.sobject(MetadataName)
                               .update(ObjRecMap);
    }

    QueryRecordByObjectName(ObjectName,RecordName){
        return this.QueryRecordByFields(ObjectName,{'Name':RecordName},'Id');
    }

    QueryRecordByObjectNameForApexCode(ObjectName,RecordName){
        return this.QueryRecordByFields(ObjectName,{'Name':RecordName},'Id,Body');
    }

    QueryRecordByFields(ObjectName,fieldValuesMap,fieldToQuery){
        let con1 = this.con;
        return new Promise(function(resolve,reject){
            con1.tooling.sobject(ObjectName).find(fieldValuesMap,fieldToQuery).execute(function(err, records){
                resolve(records);
            });
        });
    }

}


module.exports = new JSForce();
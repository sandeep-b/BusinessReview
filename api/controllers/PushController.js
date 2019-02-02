/**
 * PushController
 *
 * @description :: Server-side logic for managing Pushes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var services=require("../../serviceLayer/pushService");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var jsf = require('json-schema-faker');
var md5 = require('md5');


 module.exports = {



	create:function(req,res){

		
	var schema = {
  	type: "object",
      	properties: {
        
        PASSWORD: {
          pattern: "^[a-z]{8}[0-9]{5}[A-Z]{2}$"
        },
        TIME: {
          type: "string",
          pattern: "^200[0-9]{1}-0[1-9]{1}-[0-2]{1}[1-9]{1}$"
        },
        USERNAME: {
          type: "string",
          format: "email",
          faker: "internet.email"
        },

      },
      required: [
        "USERNAME",
        "PASSWORD",
        "TIME"
      ],
  definitions: {
    positiveInt: {
      type: "integer",
      minimum: 0,
      exclusiveMinimum: true
    }
  }
};

	var param = jsf(schema);

	var help  = [];
	

var token="";
  	for( key in param){
  		token+= param[key];
	}
param.TOKEN = md5(token+"Glocal");
console.log(param);



		services.create(param,function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.created({
					message: "Entry was created"
				});
			}
		}); 

}

}




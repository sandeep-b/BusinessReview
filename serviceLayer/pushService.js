/*var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="DUMMY";
var Chance = require('chance');
var chance = new Chance();
var md5 = require('md5');
var usrnme;
var pwd;
var time;
var token;
var tokenchk
module.exports={
	create:function(){
		usrnme = 	chance.string({
				length: 15,
				pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789' })+'@gmail.com';
console.log(usrnme);
		pwd= chance.string({
				length: 10,
				pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789!@#$%^&*?' });
		token= usrnme;
		time= chance.string({
				length: 10,
				pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789!@#$%^&*?' });
		tokenchk= null;
		var biggestAssQueryEva = 'INSERT into DUMMY(USRNME, TOKEN, TIME, PWD)'+'\n'+' VALUES('+'\''+usrnme+'\''+','+'\''+usrnme+'\''+','+'\''+time+'\''+','+'\''+pwd+'\''+');';
		console.log(biggestAssQueryEva);		
                
			knex.raw(biggestAssQueryEva);
//console.log(token);
//console.log(md5(usrnme+pwd+time));
			
	}
}
var calc
*/

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="USER_LOGIN_DATA";

// Err handling messages
var error={
	insert:{
		insertUnsuccessful:"The Insert was not successful",
		
	},
	where:{
		whereUnsuccessful:"The Where clause was unsucessful"
	},
	update:{
		updateUnsuccessful:"The Update clause was unsucessful"
	}
}

module.exports={

	create:function(params,callback){

		knex(tableName).insert(params).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.insert.insertUnsuccessful})
			}else{
				return callback(null);
			}
		});
	}
}
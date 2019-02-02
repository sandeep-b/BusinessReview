'use strict'

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var moment=require("moment");
var md5=require("md5");
var bcrypt = require("bcrypt");
// var tableName="USER_LOGIN_DATA";


// var fs = require('fs');
// var util = require('util');
// var log_file = fs.createWriteStream('./data.txt', {flags : 'w'});
// var log_stdout = process.stdout;
// var md5 = require('md5');

class loginService{

	login(params,callback){
		var self=this;
		self.email=params.email;
		self.password=params.password;

		async.waterfall([
		async.apply(emailIdValidation,self),
		getUserDetails,
		createToken,
		addToken,
		getCompleteUserDetails
		],function(error,response){
		if(error){
			return callback({exception:error.exception});
		}else if(response){
			return callback(null,response);
		}
	  });

	}

	signUp(params,callback){
		var self=this;
		self.email=params.email;
		self.firstName=params.firstName;
		self.lastName=params.lastName;
		self.typeUser=params.typeUser;
		self.city=params.city;
		self.state=params.state;
		self.password=params.password;

		async.waterfall([
			async.apply(emailIdValidation,self),
			userInfoInsert,
			userAccessTokenInsert,
			insertPassword,
			getCompleteUserDetails	
			],function(error,response){
				if(error){
					return callback({exception:error.exception});
				}else if(response){
				    return callback(null,response);
				}
		});
	}
}


module.exports=loginService;

function emailIdValidation(self,callback){
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test){
    	return callback(null,self);
    }else{
    	return callback({exception:"The entered email is invalid"});
    }
}

function getUserDetails(self,callback){

	var sql="select user_info.USER_ID as \"UserId\",user_login_data.PASSWORD as \"password\", user_info.FIRST_NAME||\' \'|| user_info.LAST_NAME "+
	        " as \"name\", user_login_data.USERNAME as \"email\" from USER_INFO user_info "+
			" inner join USER_LOGIN_DATA user_login_data on user_login_data.USERNAME=user_info.EMAIL"+
			" where user_info.EMAIL=\'"+self.email+"\'"+
			" and user_login_data.PASSWORD=\'"+self.password+"\'";

	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
			console.log(err);
			return callback({exception:"The given email or password is incorrect"});
		}else if(response.length>0){
			self.userDetails=response[0];
			console.log(self.userDetails);
		    return callback(null,self);
		}
	});
}

function createToken(self,callback){
	var  accessToken = "" + moment().unix() + ""+"-"+"glocal";
	accessToken=md5(accessToken);
	self.token=accessToken;
	return callback(null,self);
}

function addToken(self,callback){
	var sql="INSERT INTO USER_ACCESS_TOKEN(USER_ID,TOKEN) values("+self.userDetails.UserId+","+
			"\'"+self.token+"\')";

	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err){
			console.log(err);
			return callback({exception:"The given email or password is incorrect"});
		}else if(response){
		    return callback(null,self);
		}
	});
}

function getCompleteUserDetails(self,callback){
	var sql="select user1.USER_ID  as \"UserId\", user1.USER_TYPE_ID as \"User_Type_Id\","+
			" user1.FIRST_NAME as \"FirstName\","+
			" user1.LAST_NAME as \"LastName\","+
			" user1.EMAIL as \"Email\", user1.CITY as \"City\", user1.STATE as \"State\","+
			" user_access_token.TOKEN as \"token\""+
			" from USER_INFO user1"+
			" inner join USER_ACCESS_TOKEN user_access_token on user_access_token.USER_ID=user1.USER_ID"+
			" where user1.EMAIL=\'"+self.email+"\' and user_access_token.token=\'"+self.token+"\'";


	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
			console.log(err);
			return callback({exception:"The given email or password is incorrect"});
		}else if(response.length>0){
			self.loginDetails=response[0];
		    return callback(null,self);
		}
	});
}
 
function userInfoInsert(self,callback){


	 knex.insert({
              	USER_TYPE_ID:self.typeUser,
              	FIRST_NAME:self.firstName,
              	LAST_NAME:self.lastName,
              	EMAIL:self.email,
              	CITY:self.city,
              	STATE:self.state
              }).
              into("USER_INFO")
              .returning(["USER_ID"])
              .asCallback(function(error,response){
              	if(error){
              		console.log(error);
              		return callback({exception:"The Given Email is already registered. Please login"});
              	}else{
              		self.USER_ID=response[0];
              		return callback(null,self);
              	}
              });
}

function userAccessTokenInsert(self,callback){

					var accessToken = "" + moment().unix() + ""+"-"+"glocal";
				 	accessToken=md5(accessToken);
				 	self.token=accessToken;

	                knex.insert({USER_ID:self.USER_ID,TOKEN:self.token})
                    .into("USER_ACCESS_TOKEN")
                    .asCallback(function(error,response){
                    	if(error){
                    		console.log(error);
              				return callback({exception:error});
              			}else{
              					return callback(null,self);
              				}
                    });
}

function insertPassword(self,callback){
	 knex.insert({USERNAME:self.email,PASSWORD:self.password})
	 .into("USER_LOGIN_DATA") 
	 .asCallback(function(error,response){
	 	if(error){
	 			  console.log(error);
              	  return callback({exception:error});
        }else{
              	  return callback(null,self);
        }
	 });
}

// 	  knex.transaction(function(trx) {

//               knex.insert({
//               	USER_TYPE_ID:self.typeUser,
//               	FIRST_NAME:self.firstName,
//               	LAST_NAME:self.lastName,
//               	EMAIL:self.email,
//               	CITY:self.city,
//               	STATE:self.state
//               }).transacting(trx).
//               into("USER_INFO")
//               .returning(["USER_ID"])
//               .then(function(response){
                
//                 var userDetails=response[0];
//                 console.log(userDetails);

//                  var accessToken = "" + moment().unix() + ""+"-"+"glocal";
// 				 accessToken=md5(accessToken);
// 				 self.token=accessToken;

//                   return knex.insert({USER_ID:userDetails,TOKEN:self.token})
//                     .into("USER_ACCESS_TOKEN").transacting(trx);
             
//          })
//               .then(trx.commit)
//               .catch(trx.rollback);
//           }).
//             then(function(inserts) {       
//              knex.insert({USERNAME:self.email,PASSWORD:self.password}).into("USER_LOGIN_DATA");
//              return callback(null,self);
//             })
//             .catch(function(error) {
//                 console.error(error);
//                 return callback({exception:"The Given Email is already registered. Please login"})
//             });

// }

/*	retrieve:function(params,callback) {

		var retrieveParams={};
		var dbtoken; 
		var timeQuery = 'SELECT TIME,TOKEN FROM USER_LOGIN_DATA WHERE USERNAME = '+'\''+params.username+'\'';
		var crtoken;
		var ch = 0;
		var updateTokenChk;
				
                var tokenfind = 0;

		if((params.username == null || params.username == '') && (params.password == null || params.password == '')) {
			
			console.log("Please provide Information");
		}

		if(params.username && params.password){
			retrieveParams.USERNAME=params.username;
			
			
			knex.raw(timeQuery).asCallback(function(err,response) {
		

			var checker;

			checker = function(d) { //
  			log_file.write(util.format(d) + '\n');
  
			ch = 1;

			if (ch == 1) {

				searchString = crtoken;
				fs.readFile('./data.txt', function(err, content) {

    					while (ch > 0) {

    						tokenfind = content.indexOf(searchString)>-1 ? 1 : 0;

    						if (tokenfind == 1) {

 							console.log("Found...,Logging you into Glocal Main Page");
							
							knex('USER_LOGIN_DATA').where({USERNAME: params.username}).update({TOKENCHK: searchString}).asCallback(function(err,response) {}); 							

						} else { 
							
							console.log("Password Incorrect...,Forget Password?"); 
						} 

   						 ch = 0;
					}

				});			// Dont know why this is there
			}

		}

		try {
			crtoken = md5(params.username+params.password+response[0].TIME+'Glocal');
			console.log('created token = '+crtoken);  
			dbtoken = response[0].TOKEN;
			console.log('database token = '+dbtoken);
			checker(dbtoken);

		} catch(e) {

			if (e instanceof TypeError) {
				console.log("Incorrect Parameters...Try again Or Sign Up");
			}
	  	}

	});


                                            // ascallback end
		return callback(null);

		} else {
			return callback(null);
		}
			
	}
*/

'use strict';
var _=require("lodash");
var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var async=require("async");
var ReverseMd5 = require('reverse-md5')
var rev = ReverseMd5({
	lettersUpper: true,
	lettersLower: true,
	numbers: true,
	special: true,
	whitespace: true,
	maxLen: 100

});
var fs=require("fs");

class ForgetPasswordService{

forgetPassword(email,callback){

	var self=this;
	self.email=email;

	async.waterfall([
		async.apply(emailIdValidation,self),
		emailIdVerfication,
		//reverseMd5Password,
		sendEmail
		],function(error,response){
		if(error){
			return callback({exception:error.exception});
		}else if(response){
			return callback(null,response);
		}
	});
  }
}

module.exports=ForgetPasswordService;

function emailIdValidation(self,callback){
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test){
    	return callback(null,self);
    }else{
    	return callback({exception:"The entered email is invalid"});
    }
}

function emailIdVerfication(self,callback){
	var sql="select user_login_data.PASSWORD as \"password\", user_info.FIRST_NAME||\' \'|| user_info.LAST_NAME "+
	        " as \"name\", user_login_data.USERNAME as \"email\" from USER_INFO user_info "+
			" inner join USER_LOGIN_DATA user_login_data on user_login_data.USERNAME=user_info.EMAIL"+
			" where user_info.EMAIL=\'"+self.email+"\'";
	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
			console.log(err);
			return callback({exception:"The given email does not exist"});
		}else if(response.length>0){
			self.password=response[0].password;
			self.name=response[0].name;
			self.email=response[0].email;
			console.log(self);
		    return callback(null,self);
		}
	});
}

function sendEmail(self,callback){
	console.log("Entered");
	var emailTemplate = fs.readFileSync('emailTemplates/forgetPasswordEmailTemplate.html', "utf-8");
	var mapObj = {
   		USERNAME:self.name,
   		HERE:self.password
  	};

  emailTemplate = emailTemplate.replace(/USERNAME|HERE/gi, function (matched) {
   return mapObj[matched];
  });

  const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'glocalapplication1@gmail.com',
        pass: 'dbms2017'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: 'glocalapplication1@gmail.com', // sender address
    to: self.email, // list of receivers
    subject: 'Forgot password?', // Subject line
    html: emailTemplate // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    	console.log(error);   
    }
    console.log(info);
 });

 return callback(null,"Email is sent to your email id");

}
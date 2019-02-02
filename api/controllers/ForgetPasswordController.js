/**
 * ForgetPasswordController
 *
 * @description :: Server-side logic for managing Forgetpasswords
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ForgetPasswordService=require("../../serviceLayer/forgetPasswordService.js");

module.exports = {
	
	forgetPassword:function(req,res){
		var email=req.body.email;

		var forgetPasswordService=new ForgetPasswordService();

		forgetPasswordService.forgetPassword(email,function(error,response){
			if(error){
				return res.badRequest(error);
			}else{
				return res.ok({
					code:sails.config.globals.okRequestCode,
					message:response
				})
			}
		});
	}
};


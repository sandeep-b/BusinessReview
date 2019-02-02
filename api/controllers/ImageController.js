/**
 * ImageController
 *
 * @description :: Server-side logic for managing Images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var ImageService=require("../../serviceLayer/imageService.js");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);


 module.exports = {

 	upload:function(req,res){
 			
 			var params={
 				USER_ID:req.headers['id'],
 				BUSINESS_ID:req.query.businessId,
 				IMAGE:req.file('image')
 			};

 			var headerParams={
  				USER_ID:req.headers['id'],
  				TOKEN:req.headers['token']
  			};

 			var imageService = new ImageService();

 			imageService.upload(headerParams,params,function(error,response){
 				if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						IMAGE:response
 					})
 				}
 			});

 	}
 };


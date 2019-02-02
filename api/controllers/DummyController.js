/**
 * DummyController
 *
 * @description :: Server-side logic for managing dummies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var services=require("../../serviceLayer/dummyService");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);

 module.exports = {

	// Dummy CRUD function for the Glocal Project

	create:function(req,res){
		
		var params = {
			CLASSID: req.body.classId,
			TITLE: req.body.title,
			TIME:req.body.time,
			LOCATION:req.body.location,
			ROOM:req.body.room,
			DEPARTMENT:req.body.department,
			PROFESSOR:req.body.professor
		};

		services.create(params,function(err,response){
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

	},

	retrieve:function(req,res){

		var query=req.query;

		services.retrieve(query,function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.ok({
					classes:response,
					message:"The record was retrieved"
				});
			}
		}); 
	},

	update:function(req,res){

		var query=req.query;
		var params=req.body;

		services.update(query,params,function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.ok({
					message:"Record was updated"
				});
			}
		}); 
	},

	delete:function(req,res){

		var query=req.query;

		services.delete(query,function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.ok({
					message:"Record was Deleted"
				});
			}
		}); 
	},

	testGet:function(req,res){
		services.testGet({},function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.ok({
					response:response
				});
			}
		}); 
	}

};


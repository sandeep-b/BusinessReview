/**
 * UserSettingsController
 *
 * @description :: Server-side logic for managing Userdetails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var services = require("../../serviceLayer/userSettingsService");

module.exports = {
    retrieve: function (req, res) {
        var userID = req.headers['id'];
        var query = req.query;
        services.retrieve(userID, query, function (err, response) {
            if (err) {
                console.log(err);
                return res.badRequest({
                    exception: err
                });
            } else {
                return res.ok({
                    message: response
                });
            }
        });
    },

    update: function (req, res) {
        var userID = req.headers['id'];
        var params = req.body.userDetails;
        services.update(userID, params, function (err, response) {
            if (err) {
                console.log(err);
                return res.badRequest({
                    exception: err
                });
            } else {
                return res.ok({
                    message: response
                });
            }
        });
    },

    getStates:function(req,res){
        services.getStates(function (err, response) {
            if (err) {
                console.log(err);
                return res.badRequest({
                    exception: err
                });
            } else {
                return res.ok({
                    states: response
                });
            }
        });
    }
};

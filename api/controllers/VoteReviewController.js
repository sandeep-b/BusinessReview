/**
 * VoteReviewController
 *
 * @description :: Server-side logic for managing Userdetails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var services = require("../../serviceLayer/voteReviewService");

module.exports = {
    create: function (req, res) {
        var userID = req.headers['id'];
        var params = req.body;
        services.create(userID, params, function (err, response) {
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

    delete: function (req, res) {
        var userID = req.headers['id'];
        var query = req.query;
        services.delete(userID, query, function (err, response) {
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
    }
};


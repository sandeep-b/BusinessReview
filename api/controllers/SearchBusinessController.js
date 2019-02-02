/**
 * SearchBusinessController
 *
 * @description :: Server-side logic for managing Userdetails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var services = require("../../serviceLayer/searchBusinessService");

module.exports = {
    retrieve: function (req, res) {
        var userID = req.headers['id'];
        var query = req.query;
        console.log(req.query);
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
    }
};


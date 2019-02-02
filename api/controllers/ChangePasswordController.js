/**
 * ChangePasswordController
 *
 * @description :: Server-side logic for managing Userdetails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var services = require("../../serviceLayer/changePasswordService");

module.exports = {
    update: function (req, res) {
        var userID = req.headers['id'];
        var token = req.headers['token'];
        var params = req.body.passwordDetails;
        services.update(userID, token, params, function (err, response) {
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


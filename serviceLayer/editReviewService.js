var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};

module.exports = {
    retrieve: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (query.BusinessID == null) {
                    return callback("Business ID must be provided.");
                }
                return callback(null);
            },
            function retrieveReview(callback) {
                if (query.ReviewID == null) {
                    return callback(null, []);
                } else {
                    knex("REVIEW").where({REVIEW_ID: query.ReviewID}).asCallback(function (err, resultReviewInfo) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        if (resultReviewInfo.length == 0) {
                            return callback("Invalid Review ID.");
                        }
                        if (resultReviewInfo[0].BUSINESS_ID != query.BusinessID) {
                            return callback("Business ID and Review ID do not match.");
                        }
                        return callback(null, resultReviewInfo);
                    });
                }
            },
            function checkUserPermission(resultReviewInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultReviewInfo.length == 0) {
                        if (resultUserPermission[0].CREATE_REVIEW >= 1) {
                            return callback(null, resultReviewInfo);
                        } else {
                            return callback("No permission to create Review.");
                        }
                    } else {
                        if (resultUserPermission[0].MODIFY_REVIEW >= 2) {
                            return callback(null, resultReviewInfo);
                        } else if (resultUserPermission[0].MODIFY_REVIEW == 1) {
                            if (resultReviewInfo[0].USER_ID == userID) {
                                return callback(null, resultReviewInfo);
                            } else {
                                return callback("No permission to modify other User's Review.");
                            }
                        } else {
                            return callback("No permission to modify Review.");
                        }
                    }
                });
            },
            function retrieveBusiness(resultReviewInfo, callback) {
                knex("VIEW_BUSINESS_INFO").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        return callback("Invalid Business ID.");
                    }
                    return callback(null, resultReviewInfo, resultBusinessInfo);
                });
            },
            function retrieveBusinessTag(resultReviewInfo, resultBusinessInfo, callback) {
                knex("VIEW_BUSINESS_TAG").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessTag) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultReviewInfo, resultBusinessInfo, resultBusinessTag);
                });
            },
            function generateJson(resultReviewInfo, resultBusinessInfo, resultBusinessTag, callback) {
                var json = [];
                if (resultReviewInfo.length == 0) {
                    json.push({
                        BusinessID: resultBusinessInfo[0].BUSINESS_ID,
                        BusinessName: resultBusinessInfo[0].BUSINESS_NAME,
                        BusinessAddressLine1: resultBusinessInfo[0].ADDRESS_LINE1,
                        BusinessAddressLine2: resultBusinessInfo[0].ADDRESS_LINE2,
                        BusinessCity: resultBusinessInfo[0].CITY,
                        BusinessState: resultBusinessInfo[0].STATE,
                        BusinessZip: resultBusinessInfo[0].ZIP,
                        BusinessPriceRange: resultBusinessInfo[0].PRICE_RANGE,
                        BusinessImageURL: resultBusinessInfo[0].IMAGE_URL,
                        BusinessTag: []
                    });
                } else {
                    json.push({
                        BusinessID: resultBusinessInfo[0].BUSINESS_ID,
                        BusinessName: resultBusinessInfo[0].BUSINESS_NAME,
                        BusinessAddressLine1: resultBusinessInfo[0].ADDRESS_LINE1,
                        BusinessAddressLine2: resultBusinessInfo[0].ADDRESS_LINE2,
                        BusinessCity: resultBusinessInfo[0].CITY,
                        BusinessState: resultBusinessInfo[0].STATE,
                        BusinessZip: resultBusinessInfo[0].ZIP,
                        BusinessPriceRange: resultBusinessInfo[0].PRICE_RANGE,
                        BusinessImageURL: resultBusinessInfo[0].IMAGE_URL,
                        BusinessTag: [],
                        ReviewID: resultReviewInfo[0].REVIEW_ID,
                        UserID: resultReviewInfo[0].USER_ID,
                        Rating: resultReviewInfo[0].RATING,
                        Text: resultReviewInfo[0].TEXT,
                        ModificationTime: dateFormat(resultReviewInfo[0].MODIFICATION_TIME),
                        CreationTime: dateFormat(resultReviewInfo[0].CREATION_TIME)
                    });
                }
                for (var i = 0; i < resultBusinessTag.length; i++) {
                    json[0].BusinessTag.push({
                        TagID: resultBusinessTag[i].TAG_ID,
                        TagName: resultBusinessTag[i].TAG_NAME
                    });
                }
                return callback(null, json);
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    },
    
    create: function (userID, params, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                // if (params.length != 1) {
                //     return callback("Incorrect format.");
                // }
                if (params.reviewDetails[0].BusinessID == null || params.reviewDetails[0].BusinessID === "") {
                    return callback("Business ID must be provided.");
                }
                if (params.reviewDetails[0].Rating == null || params.reviewDetails[0].Rating === "") {
                    return callback("Rating must be provided.");
                }
                if (params.reviewDetails[0].Text == null || params.reviewDetails[0].Text === "") {
                    return callback("Text must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].CREATE_REVIEW >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to create Review.");
                    }
                });
            },
            function checkLength(callback) {
                //no length check for Review
                return callback(null);
            },
            function checkBusiness(callback) {
                knex("BUSINESS").where({BUSINESS_ID: params.reviewDetails[0].BusinessID}).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        return callback("Invalid Business ID.");
                    }
                    return callback(null);
                });
            },
            function getDropOptionList(callback){
                knex("CONFIG_DROPDOWN").whereIn("DROP_CATEGORY", ["Rating"]).asCallback(function (err, resultDropOption) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var dropOptionList = [];
                    for (var i = 0; i < resultDropOption.length; i++) {
                        dropOptionList.push(resultDropOption[i].DROP_CATEGORY.toString() + resultDropOption[i].DROP_OPTION.toString());
                    }
                    dropOptionList.sort();
                    return callback(null, dropOptionList);
                });
            },
            function checkValueAgainstDropOptionList(dropOptionList, callback) {
                if (!isMemberOf(dropOptionList, "Rating" + params.reviewDetails[0].Rating.toString())) {
                    return callback("Invalid Rating.");
                }
                return callback(null);
            },
            function createReview(callback) {
                var insertParams = {};
                insertParams.BUSINESS_ID = params.reviewDetails[0].BusinessID;
                insertParams.USER_ID = userID;
                insertParams.RATING = params.reviewDetails[0].Rating;
                insertParams.TEXT = params.reviewDetails[0].Text;
                knex("REVIEW").insert(insertParams).returning("REVIEW_ID").asCallback(function (err, resultReviewID) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.insertUnsuccessful);
                    }
                    return callback(null, "Review was created. Review ID: " + resultReviewID);
                });
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    },

    update: function (userID, params, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (params.length != 1) {
                    return callback("Incorrect format.");
                }
                if (params[0].ReviewID == null || params[0].ReviewID === "") {
                    return callback("Review ID must be provided.");
                }
                return callback(null);
            },
            function retrieveReview(callback) {
                knex("REVIEW").where({REVIEW_ID: params[0].ReviewID}).asCallback(function (err, resultReviewInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultReviewInfo.length == 0) {
                        return callback("Invalid Review ID.");
                    }
                    return callback(null, resultReviewInfo);
                });
            },
            function checkUserPermission(resultReviewInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].MODIFY_REVIEW >= 2) {
                        return callback(null);
                    } else if (resultUserPermission[0].MODIFY_REVIEW == 1) {
                        if (resultReviewInfo[0].USER_ID == userID) {
                            return callback(null);
                        } else {
                            return callback("No permission to modify other User's Review.");
                        }
                    } else {
                        return callback("No permission to modify Review.");
                    }
                });
            },
            function checkLength(callback) {
                //no length check for Review
                return callback(null);
            },
            function getDropOptionList(callback){
                knex("CONFIG_DROPDOWN").whereIn("DROP_CATEGORY", ["Rating"]).asCallback(function (err, resultDropOption) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var dropOptionList = [];
                    for (var i = 0; i < resultDropOption.length; i++) {
                        dropOptionList.push(resultDropOption[i].DROP_CATEGORY.toString() + resultDropOption[i].DROP_OPTION.toString());
                    }
                    dropOptionList.sort();
                    return callback(null, dropOptionList);
                });
            },
            function checkValueAgainstDropOptionList(dropOptionList, callback) {
                if (params[0].Rating != null && params[0].Rating !== "") {
                    if (!isMemberOf(dropOptionList, "Rating" + params[0].Rating.toString())) {
                        return callback("Invalid Rating.");
                    }
                }
                return callback(null);
            },
            function updateReview(callback) {
                var updateParams = {};
                if (params[0].Rating != null && params[0].Rating !== "") {
                    updateParams.RATING = params[0].Rating;
                }
                if (params[0].Text != null && params[0].Text !== "") {
                    updateParams.TEXT = params[0].Text;
                }
                if (Object.keys(updateParams).length == 0) {
                    return callback("Nothing to update.");
                }
                knex("REVIEW").where({REVIEW_ID: params[0].ReviewID}).update(updateParams).asCallback(function (err, resultUpdate) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.updateUnsuccessful);
                    }
                    return callback(null, "Review was updated. Review ID: " + params[0].ReviewID);
                });
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    },

    delete: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (query.ReviewID == null) {
                    return callback("Review ID must be provided.");
                }
                return callback(null);
            },
            function retrieveReview(callback) {
                knex("REVIEW").where({REVIEW_ID: query.ReviewID}).asCallback(function (err, resultReviewInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultReviewInfo.length == 0) {
                        return callback("Invalid Review ID.");
                    }
                    return callback(null, resultReviewInfo);
                });
            },
            function checkUserPermission(resultReviewInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].DELETE_REVIEW >= 2) {
                        return callback(null);
                    } else if (resultUserPermission[0].DELETE_REVIEW == 1) {
                        if (resultReviewInfo[0].USER_ID == userID) {
                            return callback(null);
                        } else {
                            return callback("No permission to delete other User's Review.");
                        }
                    } else {
                        return callback("No permission to delete Review.");
                    }
                });
            },
            function deleteReview(callback) {
                var queryDeleteReview = `
                begin
                pack_review.proc_delete_review(` + query.ReviewID + `);
                commit;
                end;
                `;
                knex.raw(queryDeleteReview).asCallback(function (err, result) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.deleteUnsuccessful);
                    }
                    return callback(null, "Review was deleted. Review ID: " + query.ReviewID);
                });
                
            }
            /*
            function deleteReviewUsingTransaction(callback) {
                knex.transaction(function (trx) {
                    knex("VOTE").where({REVIEW_ID: query.ReviewID}).delete().transacting(trx)
                            .then(function () {
                                return knex("REVIEW").where({REVIEW_ID: query.ReviewID}).delete().transacting(trx);
                            })
                            .then(trx.commit)
                            .catch(trx.rollback);
                }).then(function () {
                    return callback(null, "Review was deleted. Review ID: " + query.ReviewID);
                }).catch(function (err) {
                    console.log(err);
                    return callback(errorMessage.deleteUnsuccessful);
                });
            }*/
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    }
};

//return date in format m/d/yyyy
function dateFormat(date) {
    return date == null ? null : (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

//check if key is in ascending order array
function isMemberOf(array, key) {
    var low = 0;
    var high = array.length - 1;
    var middle;
    while (low <= high) {
        middle = Math.floor((low + high) / 2);
        if (array[middle] < key) {
            low = middle + 1;
        } else if (array[middle] > key) {
            high = middle - 1;
        } else {
            return true;
        }
    }
    return false;
}

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
                if (query.UserID == null) {
                    return callback("User ID must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].VIEW_USER_PROFILE >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to view User Profile.");
                    }
                });
            },
            function retrieveUserInfo(callback) {
                knex("VIEW_USER_INFO").where({USER_ID: query.UserID}).asCallback(function (err, resultUserInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserInfo.length == 0) {
                        return callback("Invalid User ID.");
                    }
                    return callback(null, resultUserInfo);
                });
            },
            function retrieveReview(resultUserInfo, callback) {
                var pageNumber = query.Page == null ? 1 : query.Page;
                //temporarily changed default page size to 100 for user details only
                var pageSize = query.PageSize == null ? 100 : (query.PageSize > 100 ? 100 : query.PageSize);
                var orderCondition1, orderCondition2;
                if (query.OrderBy == "2") {
                    orderCondition1 = "rating";
                    orderCondition1 += query.OrderSequence == "1" ? " asc" : " desc";
                    orderCondition2 = "creation_time desc";
                } else {
                    orderCondition1 = "creation_time";
                    orderCondition1 += query.OrderSequence == "1" ? " asc" : " desc";
                    orderCondition2 = "rating desc";
                }
                var queryGetReview = `
                select
                t.*,
                (select count(*) from vote where vote.review_id = t.review_id) as like_count,
                business.business_name,
                business.address_line1,
                business.address_line2,
                business.city,
                business.state,
                business.zip,
                business.price_range,
                image.image_url
                from
                (select b.*
                from
                (select a.*, rownum rn
                from 
                (select *
                from review
                where user_id = ` + query.UserID + `
                order by ` + orderCondition1 + ", " + orderCondition2 + `
                ) a
                where rownum <= ` + pageNumber + ` * ` + pageSize + `
                ) b
                where b.rn > (` + pageNumber + ` - 1) * ` + pageSize + `
                ) t
                left join business
                on business.business_id = t.business_id
                left join business_image
                on business_image.business_id = business.business_id
                left join image
                on image.image_id = business_image.image_id
                order by t.rn asc
                `;
                knex.raw(queryGetReview).asCallback(function (err, resultReview) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var businessIDList = [];
                    for (var i = 0; i < resultReview.length; i++) {
                        businessIDList.push(resultReview[i].BUSINESS_ID);
                    }
                    return callback(null, resultUserInfo, resultReview, businessIDList);
                });
            },
            function retrieveBusinessTag(resultUserInfo, resultReview, businessIDList, callback) {
                if (businessIDList.length > 0) {
                    knex("VIEW_BUSINESS_TAG").whereIn("BUSINESS_ID", businessIDList).asCallback(function (err, resultBusinessTag) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        return callback(null, resultUserInfo, resultReview, resultBusinessTag);
                    });
                } else {
                    return callback(null, resultUserInfo, resultReview, []);
                }
            },
            function getAccessingUserVotedReviewIDList(resultUserInfo, resultReview, resultBusinessTag, callback) {
                knex("VOTE").where({USER_ID: userID}).select("REVIEW_ID").asCallback(function (err, resultAccessingUserVotedReviewID) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var accessingUserVotedReviewIDList = [];
                    for (var i = 0; i < resultAccessingUserVotedReviewID.length; i++) {
                        accessingUserVotedReviewIDList.push(resultAccessingUserVotedReviewID[i].REVIEW_ID.toString());
                    }
                    accessingUserVotedReviewIDList.sort();
                    return callback(null, resultUserInfo, resultReview, resultBusinessTag, accessingUserVotedReviewIDList);
                });
            },
            function generateJson(resultUserInfo, resultReview, resultBusinessTag, accessingUserVotedReviewIDList, callback) {
                var json = [];
                for (var i = 0; i < resultUserInfo.length; i++) {
                    json.push({
                        UserID: resultUserInfo[i].USER_ID,
                        FirstName: resultUserInfo[i].FIRST_NAME,
                        LastName: resultUserInfo[i].LAST_NAME,
                        City: resultUserInfo[i].CITY,
                        State: resultUserInfo[i].STATE,
                        ModificationTime: dateFormat(resultUserInfo[i].MODIFICATION_TIME),
                        CreationTime: dateFormat(resultUserInfo[i].CREATION_TIME),
                        ImageURL: resultUserInfo[i].IMAGE_URL,
                        ReviewCount: resultUserInfo[i].REVIEW_COUNT,
                        AverageRating: resultUserInfo[i].AVERAGE_RATING,
                        Rating1Count: resultUserInfo[i].RATING_1_COUNT,
                        Rating2Count: resultUserInfo[i].RATING_2_COUNT,
                        Rating3Count: resultUserInfo[i].RATING_3_COUNT,
                        Rating4Count: resultUserInfo[i].RATING_4_COUNT,
                        Rating5Count: resultUserInfo[i].RATING_5_COUNT,
                        VotedLikeCount: resultUserInfo[i].VOTED_LIKE_COUNT,
                        ReceivedLikeCount: resultUserInfo[i].RECEIVED_LIKE_COUNT,
                        Review: []
                    });
                    for (var j = 0; j < resultReview.length; j++) {
                        json[i].Review.push({
                            ReviewID: resultReview[j].REVIEW_ID,
                            UserID: resultReview[j].USER_ID,
                            BusinessID: resultReview[j].BUSINESS_ID,
                            Rating: resultReview[j].RATING,
                            Text: resultReview[j].TEXT,
                            ModificationTime: dateFormat(resultReview[j].MODIFICATION_TIME),
                            CreationTime: dateFormat(resultReview[j].CREATION_TIME),
                            LikeCount: resultReview[j].LIKE_COUNT,
                            BusinessName: resultReview[j].BUSINESS_NAME,
                            BusinessAddressLine1: resultReview[j].ADDRESS_LINE1,
                            BusinessAddressLine2: resultReview[j].ADDRESS_LINE2,
                            BusinessCity: resultReview[j].CITY,
                            BusinessState: resultReview[j].STATE,
                            BusinessZip: resultReview[j].ZIP,
                            BusinessPriceRange: resultReview[j].PRICE_RANGE,
                            BusinessImageURL: resultReview[j].IMAGE_URL,
                            BusinessTag: [],
                            LikedByAccessingUser: isMemberOf(accessingUserVotedReviewIDList, resultReview[j].REVIEW_ID.toString()) ? "Yes" : "No"
                        });
                        for (var k = 0; k < resultBusinessTag.length; k++) {
                            if (json[i].Review[j].BusinessID == resultBusinessTag[k].BUSINESS_ID) {
                                json[i].Review[j].BusinessTag.push({
                                    TagID: resultBusinessTag[k].TAG_ID,
                                    TagName: resultBusinessTag[k].TAG_NAME
                                });
                            }
                        }
                    }
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
    }
};

function dateFormat(date) {
    return date == null ? null : (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

//check if key is in ascending order string array
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

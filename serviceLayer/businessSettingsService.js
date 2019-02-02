var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var moment = require("moment");//npm install moment
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};
var businessMaxLength = {
    BusinessName: 100,
    AddressLine1: 100,
    AddressLine2: 100,
    City: 50,
    State: 5,
    Zip: 10,
    Phone: 30,
    Website: 100,
    Status: 10,
    TextValue: 50 //db allows 255
};
var businessMaxCount = {
    BusinessTag: 3
};
module.exports = {
    retrieve: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                //no mandatory attribute
                return callback(null);
            },
            function retrieveBusiness(callback) {
                if (query.BusinessID == null) {
                    return callback(null, []);
                } else {
                    knex("VIEW_BUSINESS_INFO").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessInfo) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        if (resultBusinessInfo.length == 0) {
                            return callback("Invalid Business ID.");
                        }
                        return callback(null, resultBusinessInfo);
                    });
                }
            },
            function checkUserPermission(resultBusinessInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        if (resultUserPermission[0].CREATE_BUSINESS >= 1) {
                            return callback(null, resultBusinessInfo);
                        } else {
                            return callback("No permission to create Business.");
                        }
                    } else {
                        if (resultUserPermission[0].MODIFY_BUSINESS >= 2) {
                            return callback(null, resultBusinessInfo);
                        } else if (resultUserPermission[0].MODIFY_BUSINESS == 1) {
                            if (resultBusinessInfo[0].OWNER_ID == userID) {
                                return callback(null, resultBusinessInfo);
                            } else {
                                return callback("No permission to modify other User's Business.");
                            }
                        } else {
                            return callback("No permission to modify Business.");
                        }
                    }
                });
            },
            function retrieveDropOption(resultBusinessInfo, callback) {
                knex("CONFIG_DROPDOWN").whereIn("DROP_CATEGORY", ["State", "Price_Range", "Business_Status"]).orderByRaw("DROP_CATEGORY asc, DROP_OPTION asc").asCallback(function (err, resultDropOption) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultDropOption);
                });
            },
            function retrieveBusinessTag(resultBusinessInfo, resultDropOption, callback) {
                if (query.BusinessID == null) {
                    return callback(null, resultBusinessInfo, resultDropOption, []);
                } else {
                    knex("VIEW_BUSINESS_TAG").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessTag) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag);
                    });
                }
            },
            function retrieveBusinessTagOption(resultBusinessInfo, resultDropOption, resultBusinessTag, callback) {
                knex("CONFIG_TAG").orderByRaw("TAG_NAME asc").asCallback(function (err, resultBusinessTagOption) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption);
                });
            },
            function retrieveBusinessHour(resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, callback) {
                if (query.BusinessID == null) {
                    return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, []);
                } else {
                    knex("VIEW_BUSINESS_HOUR").where({BUSINESS_ID: query.BusinessID}).orderBy("WEEKDAY_ID", "asc").asCallback(function (err, resultBusinessHour) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour);
                    });
                }
            },
            function retrieveBusinessAttrConfigAndValue(resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour, callback) {
                var queryGetBusinessAttrConfigAndValue = `
                select
                config_business_attr.*,
                t.text_value,
                n.number_value,
                d.date_value
                from config_business_attr
                left join (select * from business_attr_text where business_id = ` + (query.BusinessID == null ? "null" : query.BusinessID) + `) t
                on t.attr_id = config_business_attr.attr_id
                left join (select * from business_attr_number where business_id = ` + (query.BusinessID == null ? "null" : query.BusinessID) + `) n
                on n.attr_id = config_business_attr.attr_id
                left join (select * from business_attr_date where business_id = ` + (query.BusinessID == null ? "null" : query.BusinessID) + `) d
                on d.attr_id = config_business_attr.attr_id
                order by config_business_attr.attr_name asc
                `;
                knex.raw(queryGetBusinessAttrConfigAndValue).asCallback(function (err, resultBusinessAttrConfigAndValue) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour, resultBusinessAttrConfigAndValue);
                });
            },
            function retrieveBusinessAttrOption(resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour, resultBusinessAttrConfigAndValue, callback) {
                knex("CONFIG_BUSINESS_ATTR_DROP").orderByRaw("ATTR_ID asc, DROP_OPTION asc").asCallback(function (err, resultBusinessAttrOption) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour, resultBusinessAttrConfigAndValue, resultBusinessAttrOption);
                });
            },
            function generateJson(resultBusinessInfo, resultDropOption, resultBusinessTag, resultBusinessTagOption, resultBusinessHour, resultBusinessAttrConfigAndValue, resultBusinessAttrOption, callback) {
                var json = [];
                if (resultBusinessInfo.length == 0) {
                    json.push({
                        StateOption: [],
                        PriceRangeOption: [],
                        StatusOption: [],
                        BusinessTag: [],
                        BusinessTagOption: [],
                        BusinessHour: [],
                        BusinessAttrText: [],
                        BusinessAttrDropdown: [],
                        BusinessAttrNumber: [],
                        BusinessAttrDate: []
                    });
                } else {
                    json.push({
                        BusinessID: resultBusinessInfo[0].BUSINESS_ID,
                        BusinessName: resultBusinessInfo[0].BUSINESS_NAME,
                        AddressLine1: resultBusinessInfo[0].ADDRESS_LINE1,
                        AddressLine2: resultBusinessInfo[0].ADDRESS_LINE2,
                        City: resultBusinessInfo[0].CITY,
                        State: resultBusinessInfo[0].STATE,
                        Zip: resultBusinessInfo[0].ZIP,
                        Phone: resultBusinessInfo[0].PHONE,
                        Website: resultBusinessInfo[0].WEBSITE,
                        Latitude: resultBusinessInfo[0].LATITUDE,
                        Longitude: resultBusinessInfo[0].LONGITUDE,
                        PriceRange: resultBusinessInfo[0].PRICE_RANGE,
                        Status: resultBusinessInfo[0].STATUS,
                        ModificationTime: dateFormat(resultBusinessInfo[0].MODIFICATION_TIME),
                        CreationTime: dateFormat(resultBusinessInfo[0].CREATION_TIME),
                        StateOption: [],
                        PriceRangeOption: [],
                        StatusOption: [],
                        BusinessTag: [],
                        BusinessTagOption: [],
                        BusinessHour: [],
                        BusinessAttrText: [],
                        BusinessAttrDropdown: [],
                        BusinessAttrNumber: [],
                        BusinessAttrDate: []
                    });
                }
                json[0].StateOption = getOptionList(resultDropOption, "State");
                json[0].PriceRangeOption = getOptionList(resultDropOption, "Price_Range");
                json[0].StatusOption = getOptionList(resultDropOption, "Business_Status");
                for (var i = 0; i < resultBusinessTag.length; i++) {
                    json[0].BusinessTag.push({
                        TagID: resultBusinessTag[i].TAG_ID,
                        TagName: resultBusinessTag[i].TAG_NAME
                    });
                }
                json[0].BusinessTagOption = resultBusinessTagOption;
                for (var i = 0; i < resultBusinessHour.length; i++) {
                    json[0].BusinessHour.push({
                        HourID: resultBusinessHour[i].HOUR_ID,
                        WeekdayID: resultBusinessHour[i].WEEKDAY_ID,
                        WeekdayName: resultBusinessHour[i].WEEKDAY_NAME,
                        OpenTime: resultBusinessHour[i].OPEN_TIME_TEXT,
                        CloseTime: resultBusinessHour[i].CLOSE_TIME_TEXT
                    });
                }
                for (var i = 0; i < resultBusinessAttrConfigAndValue.length; i++) {
                    switch (resultBusinessAttrConfigAndValue[i].ATTR_TYPE) {
                        case "Text":
                            json[0].BusinessAttrText.push({
                                AttrID: resultBusinessAttrConfigAndValue[i].ATTR_ID,
                                AttrName: resultBusinessAttrConfigAndValue[i].ATTR_NAME,
                                AttrValue: resultBusinessAttrConfigAndValue[i].TEXT_VALUE
                            });
                            break;
                        case "Dropdown":
                            json[0].BusinessAttrDropdown.push({
                                AttrID: resultBusinessAttrConfigAndValue[i].ATTR_ID,
                                AttrName: resultBusinessAttrConfigAndValue[i].ATTR_NAME,
                                AttrValue: resultBusinessAttrConfigAndValue[i].TEXT_VALUE,
                                AttrOption: [] = getBusinessAttrOptionList(resultBusinessAttrOption, resultBusinessAttrConfigAndValue[i].ATTR_ID)
                            });
                            break;
                        case "Number":
                            json[0].BusinessAttrNumber.push({
                                AttrID: resultBusinessAttrConfigAndValue[i].ATTR_ID,
                                AttrName: resultBusinessAttrConfigAndValue[i].ATTR_NAME,
                                AttrValue: resultBusinessAttrConfigAndValue[i].NUMBER_VALUE
                            });
                            break;
                        case "Date":
                            json[0].BusinessAttrDate.push({
                                AttrID: resultBusinessAttrConfigAndValue[i].ATTR_ID,
                                AttrName: resultBusinessAttrConfigAndValue[i].ATTR_NAME,
                                AttrValue: dateFormat(resultBusinessAttrConfigAndValue[i].DATE_VALUE)
                            });
                            break;
                        default:
                            return callback("Unsupported Business Attribute Type " + resultBusinessAttrConfigAndValue[i].ATTR_TYPE + ".");
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
    },
    
    create: function (userID, params, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (params.length != 1) {
                    return callback("Incorrect format.");
                }
                if (params[0].BusinessName == null || params[0].BusinessName === "") {
                    return callback("Business Name must be provided.");
                }
                if (params[0].City == null || params[0].City === "") {
                    return callback("City must be provided.");
                }
                if (params[0].State == null || params[0].State === "") {
                    return callback("State must be provided.");
                }
                if (params[0].Status == null || params[0].Status === "") {
                    return callback("Status must be provided.");
                }
                params[0].BusinessID = null;//checkBusinessTagCount use BusinessID to determine create/update
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].CREATE_BUSINESS >= 1) {
                        return callback(null, params);
                    } else {
                        return callback("No permission to create Business.");
                    }
                });
            },
            checkMandatorySubAttribute,
            checkLength,
            getDropOptionList,
            checkValueAgainstDropOptionList,
            checkBusinessTagID,
            checkBusinessTagCount,
            checkBusinessHourWeekdayID,
            checkBusinessHourTime,
            checkBusinessAttrID,
            separateBusinessAttrByType,
            checkBusinessAttrValue,
            generateOperationParams,
            function createBusiness(dropdownAttr, textAttr, numberAttr, dateAttr, operationParams, callback) {
                var businessID;
                knex.transaction(function (trx) {
                    knex("BUSINESS").insert(operationParams).returning("BUSINESS_ID").transacting(trx)
                            .then(function (resultInsert) {
                                //console.log(resultInsert);
                                businessID = resultInsert[0];
                                var insertParams = {};
                                insertParams.BUSINESS_ID = businessID;
                                insertParams.OWNER_ID = userID;
                                return knex("BUSINESS_OWNERSHIP").insert(insertParams).transacting(trx)
                                        .then(function () {
                                            var queryHandleBusinessSubAttr = generateQueryForHandlingBusinessSubAttr(businessID, params, dropdownAttr, textAttr, numberAttr, dateAttr);
                                            return knex.raw(queryHandleBusinessSubAttr).transacting(trx);
                                        });
                            })
                            .then(trx.commit)
                            .catch(trx.rollback);
                }).then(function () {
                    return callback(null, "Business was created. Business ID: " + businessID);
                }).catch(function (err) {
                    console.log(err);
                    return callback(errorMessage.insertUnsuccessful);
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
                if (params[0].BusinessID == null || params[0].BusinessID === "") {
                    return callback("Business ID must be provided.");
                }
                return callback(null);
            },
            function retrieveBusinessInfo(callback) {
                knex("VIEW_BUSINESS_INFO").where({BUSINESS_ID: params[0].BusinessID}).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        return callback("Invalid Business ID.");
                    }
                    return callback(null, resultBusinessInfo);
                });
            },
            function checkUserPermission(resultBusinessInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].MODIFY_BUSINESS >= 2) {
                        return callback(null, params);
                    } else if (resultUserPermission[0].MODIFY_BUSINESS == 1) {
                        if (resultBusinessInfo[0].OWNER_ID == userID) {
                            return callback(null, params);
                        } else {
                            return callback("No permission to modify other User's Business.");
                        }
                    } else {
                        return callback("No permission to modify Business.");
                    }
                });
            },
            checkMandatorySubAttribute,
            checkLength,
            getDropOptionList,
            checkValueAgainstDropOptionList,
            checkBusinessTagID,
            checkBusinessTagCount,
            checkBusinessHourWeekdayID,
            checkBusinessHourTime,
            checkBusinessAttrID,
            separateBusinessAttrByType,
            checkBusinessAttrValue,
            generateOperationParams,
            function updateBusiness(dropdownAttr, textAttr, numberAttr, dateAttr, operationParams, callback) {
                var businessID = params[0].BusinessID;
                var queryHandleBusinessSubAttr = generateQueryForHandlingBusinessSubAttr(businessID, params, dropdownAttr, textAttr, numberAttr, dateAttr);
                if (Object.keys(operationParams).length == 0) { //no change to business primary attribute
                    knex.transaction(function (trx) {
                        knex.raw(queryHandleBusinessSubAttr).transacting(trx)
                                .then(trx.commit)
                                .catch(trx.rollback);
                    }).then(function () {
                        return callback(null, "Business was updated. Business ID: " + businessID);
                    }).catch(function (err) {
                        console.log(err);
                        return callback(errorMessage.updateUnsuccessful);
                    });
                } else {
                    knex.transaction(function (trx) {
                        knex("BUSINESS").where({BUSINESS_ID: businessID}).update(operationParams).transacting(trx)
                                .then(function () {
                                    return knex.raw(queryHandleBusinessSubAttr).transacting(trx);
                                })
                                .then(trx.commit)
                                .catch(trx.rollback);
                    }).then(function () {
                        return callback(null, "Business was updated. Business ID: " + businessID);
                    }).catch(function (err) {
                        console.log(err);
                        return callback(errorMessage.updateUnsuccessful);
                    });
                }
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
                if (query.BusinessID == null) {
                    return callback("Business ID must be provided.");
                }
                return callback(null);
            },
            function retrieveBusinessInfo(callback) {
                knex("VIEW_BUSINESS_INFO").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        return callback("Invalid Business ID.");
                    }
                    return callback(null, resultBusinessInfo);
                });
            },
            function checkUserPermission(resultBusinessInfo, callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].DELETE_BUSINESS >= 2) {
                        return callback(null);
                    } else if (resultUserPermission[0].DELETE_BUSINESS == 1) {
                        if (resultBusinessInfo[0].OWNER_ID == userID) {
                            return callback(null);
                        } else {
                            return callback("No permission to delete other User's Business.");
                        }
                    } else {
                        return callback("No permission to delete Business.");
                    }
                });
            },
            //need to handle business images on AWS
            function deleteBusiness(callback) {
                var queryDeleteBusiness = `
                begin
                pack_business.proc_delete_business(` + query.BusinessID + `);
                commit;
                end;
                `;
                knex.raw(queryDeleteBusiness).asCallback(function (err, result) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.deleteUnsuccessful);
                    }
                    return callback(null, "Business was deleted. Business ID: " + query.BusinessID);
                });

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

//business create/update common part starts
function checkMandatorySubAttribute(params, callback) {
    if (params[0].BusinessTag != null) {
        for (var i = 0; i < params[0].BusinessTag.length; i++) {
            if (params[0].BusinessTag[i].TagID == null || params[0].BusinessTag[i].TagID === "") {
                return callback("Business Tag ID must be provided.");
            }
            if (params[0].BusinessTag[i].Action == null || params[0].BusinessTag[i].Action === "") {
                return callback("Business Tag Action must be provided. Tag ID: " + params[0].BusinessTag[i].TagID);
            }
        }
    }
    if (params[0].BusinessHour != null) {
        for (var i = 0; i < params[0].BusinessHour.length; i++) {
            if (params[0].BusinessHour[i].WeekdayID == null || params[0].BusinessHour[i].WeekdayID === "") {
                return callback("Business Hour Weekday ID must be provided.");
            }
            if (params[0].BusinessHour[i].OpenTime == null || params[0].BusinessHour[i].OpenTime === "") {
                return callback("Business Hour Open Time must be provided. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
            if (params[0].BusinessHour[i].CloseTime == null || params[0].BusinessHour[i].CloseTime === "") {
                return callback("Business Hour Close Time must be provided. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
            if (params[0].BusinessHour[i].Action == null || params[0].BusinessHour[i].Action === "") {
                return callback("Business Hour Action must be provided. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
        }
    }
    if (params[0].BusinessAttr != null) {
        for (var i = 0; i < params[0].BusinessAttr.length; i++) {
            if (params[0].BusinessAttr[i].AttrID == null || params[0].BusinessAttr[i].AttrID === "") {
                return callback("Business Attribute ID must be provided.");
            }
            if (params[0].BusinessAttr[i].AttrValue == null || params[0].BusinessAttr[i].AttrValue === "") {
                return callback("Business Attribute Value must be provided. Attribute ID: " + params[0].BusinessAttr[i].AttrID);
            }
            if (params[0].BusinessAttr[i].Action == null || params[0].BusinessAttr[i].Action === "") {
                return callback("Business Attribute Action must be provided. Attribute ID: " + params[0].BusinessAttr[i].AttrID);
            }
        }
    }
    return callback(null, params);
}
function checkLength(params, callback) {
    if (params[0].BusinessName != null && params[0].BusinessName !== "") {
        if (params[0].BusinessName.length > businessMaxLength.BusinessName) {
            return callback("Business Name exceeds max length " + businessMaxLength.BusinessName);
        }
    }
    if (params[0].AddressLine1 != null && params[0].AddressLine1 !== "") {
        if (params[0].AddressLine1.length > businessMaxLength.AddressLine1) {
            return callback("Address Line1 exceeds max length " + businessMaxLength.AddressLine1);
        }
    }
    if (params[0].AddressLine2 != null && params[0].AddressLine2 !== "") {
        if (params[0].AddressLine2.length > businessMaxLength.AddressLine2) {
            return callback("Address Line2 exceeds max length " + businessMaxLength.AddressLine2);
        }
    }
    if (params[0].City != null && params[0].City !== "") {
        if (params[0].City.length > businessMaxLength.City) {
            return callback("City exceeds max length " + businessMaxLength.City);
        }
    }
    if (params[0].State != null && params[0].State !== "") {
        if (params[0].State.length > businessMaxLength.State) {
            return callback("State exceeds max length " + businessMaxLength.State);
        }
    }
    if (params[0].Zip != null && params[0].Zip !== "") {
        if (params[0].Zip.length > businessMaxLength.Zip) {
            return callback("Zip exceeds max length " + businessMaxLength.Zip);
        }
    }
    if (params[0].Phone != null && params[0].Phone !== "") {
        if (params[0].Phone.length > businessMaxLength.Phone) {
            return callback("Phone exceeds max length " + businessMaxLength.Phone);
        }
    }
    if (params[0].Website != null && params[0].Website !== "") {
        if (params[0].Website.length > businessMaxLength.Website) {
            return callback("Website exceeds max length " + businessMaxLength.Website);
        }
    }
    if (params[0].Status != null && params[0].Status !== "") {
        if (params[0].Status.length > businessMaxLength.Status) {
            return callback("Status exceeds max length " + businessMaxLength.Status);
        }
    }
    return callback(null, params);
}
function getDropOptionList(params, callback) {
    knex("CONFIG_DROPDOWN").whereIn("DROP_CATEGORY", ["State", "Price_Range", "Business_Status", "Data_Action"]).asCallback(function (err, resultDropOption) {
        if (err) {
            console.log(err);
            return callback(errorMessage.selectUnsuccessful);
        }
        var dropOptionList = [];
        for (var i = 0; i < resultDropOption.length; i++) {
            dropOptionList.push(resultDropOption[i].DROP_CATEGORY.toString() + resultDropOption[i].DROP_OPTION.toString());
        }
        dropOptionList.sort();
        return callback(null, params, dropOptionList);
    });
}
function checkValueAgainstDropOptionList(params, dropOptionList, callback) {
    if (params[0].State != null && params[0].State !== "") {
        if (!isMemberOf(dropOptionList, "State" + params[0].State.toString())) {
            return callback("Invalid State.");
        }
    }
    if (params[0].PriceRange != null && params[0].PriceRange !== "") {
        if (!isMemberOf(dropOptionList, "Price_Range" + params[0].PriceRange.toString())) {
            return callback("Invalid Price Range.");
        }
    }
    if (params[0].Status != null && params[0].Status !== "") {
        if (!isMemberOf(dropOptionList, "Business_Status" + params[0].Status.toString())) {
            return callback("Invalid Status.");
        }
    }
    if (params[0].BusinessTag != null) {
        for (var i = 0; i < params[0].BusinessTag.length; i++) {
            if (!isMemberOf(dropOptionList, "Data_Action" + params[0].BusinessTag[i].Action.toString())) {
                return callback("Invalid Business Tag Action. Tag ID: " + params[0].BusinessTag[i].TagID);
            }
        }
    }
    if (params[0].BusinessHour != null) {
        for (var i = 0; i < params[0].BusinessHour.length; i++) {
            if (!isMemberOf(dropOptionList, "Data_Action" + params[0].BusinessHour[i].Action.toString())) {
                return callback("Invalid Business Hour Action. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
        }
    }
    if (params[0].BusinessAttr != null) {
        for (var i = 0; i < params[0].BusinessAttr.length; i++) {
            if (!isMemberOf(dropOptionList, "Data_Action" + params[0].BusinessAttr[i].Action.toString())) {
                return callback("Invalid Business Attribute Action. Attribute ID: " + params[0].BusinessAttr[i].AttrID);
            }
        }
    }
    return callback(null, params);
}
function checkBusinessTagID(params, callback) {
    if (params[0].BusinessTag != null && params[0].BusinessTag.length > 0) {
        var inputTagIDList = [];
        for (var i = 0; i < params[0].BusinessTag.length; i++) {
            inputTagIDList.push(params[0].BusinessTag[i].TagID.toString());
        }
        knex("CONFIG_TAG").whereIn("TAG_ID", inputTagIDList).asCallback(function (err, resultTag) {
            if (err) {
                console.log(err);
                return callback(errorMessage.selectUnsuccessful);
            }
            if (resultTag.length != inputTagIDList.length) {
                var validTagIDList = [];
                for (var i = 0; i < resultTag.length; i++) {
                    validTagIDList.push(resultTag[i].TAG_ID.toString());
                }
                return callback("Invalid Business Tag ID. " + findInvalidID(inputTagIDList, validTagIDList));
            }
            return callback(null, params);
        });
    } else {
        return callback(null, params);
    }
}
function checkBusinessTagCount(params, callback) {
    if (params[0].BusinessTag != null && params[0].BusinessTag.length > 0) {
        var businessTagCount;
        if (params[0].BusinessID == null) { //case of creating business
            businessTagCount = 0;
            for (var i = 0; i < params[0].BusinessTag.length; i++) {
                if (params[0].BusinessTag[i].Action == "create" || params[0].BusinessTag[i].Action == "update") {
                    businessTagCount++;
                }
            }
            if (businessTagCount > businessMaxCount.BusinessTag) {
                return callback("Business Tag exceeds max count " + businessMaxCount.BusinessTag);
            }
            return callback(null, params);
        } else { //case of updating business
            knex("BUSINESS_TAG").where({BUSINESS_ID: params[0].BusinessID}).asCallback(function (err, resultBusinessTag) {
                if (err) {
                    console.log(err);
                    return callback(errorMessage.selectUnsuccessful);
                }
                var existingTagIDList = [];
                for (var i = 0; i < resultBusinessTag.length; i++) {
                    existingTagIDList.push(resultBusinessTag[i].TAG_ID.toString());
                }
                existingTagIDList.sort();
                businessTagCount = resultBusinessTag.length;
                for (var i = 0; i < params[0].BusinessTag.length; i++) {
                    if (isMemberOf(existingTagIDList, params[0].BusinessTag[i].TagID.toString())) {
                        if (params[0].BusinessTag[i].Action == "delete") {
                            businessTagCount--;
                        }
                    } else {
                        if (params[0].BusinessTag[i].Action == "create" || params[0].BusinessTag[i].Action == "update") {
                            businessTagCount++;
                        }
                    }
                }
                if (businessTagCount > businessMaxCount.BusinessTag) {
                    return callback("Business Tag exceeds max count " + businessMaxCount.BusinessTag);
                }
                return callback(null, params);
            });
        }
    } else {
        return callback(null, params);
    }
}
function checkBusinessHourWeekdayID(params, callback) {
    if (params[0].BusinessHour != null && params[0].BusinessHour.length > 0) {
        var inputWeekdayIDList = [];
        for (var i = 0; i < params[0].BusinessHour.length; i++) {
            inputWeekdayIDList.push(params[0].BusinessHour[i].WeekdayID.toString());
        }
        knex("CONFIG_WEEKDAY").whereIn("WEEKDAY_ID", inputWeekdayIDList).asCallback(function (err, resultWeekday) {
            if (err) {
                console.log(err);
                return callback(errorMessage.selectUnsuccessful);
            }
            if (resultWeekday.length != inputWeekdayIDList.length) {
                var validWeekdayIDList = [];
                for (var i = 0; i < resultWeekday.length; i++) {
                    validWeekdayIDList.push(resultWeekday[i].WEEKDAY_ID.toString());
                }
                return callback("Invalid Business Hour Weekday ID. " + findInvalidID(inputWeekdayIDList, validWeekdayIDList));
            }
            return callback(null, params);
        });
    } else {
        return callback(null, params);
    }
}
function checkBusinessHourTime(params, callback) {
    if (params[0].BusinessHour != null && params[0].BusinessHour.length > 0) {
        for (var i = 0; i < params[0].BusinessHour.length; i++) {
            if (!isValidBusinessHourTime(params[0].BusinessHour[i].OpenTime)) {
                return callback("Invalid Business Hour Open Time. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
            if (!isValidBusinessHourTime(params[0].BusinessHour[i].CloseTime)) {
                return callback("Invalid Business Hour Close Time. Weekday ID: " + params[0].BusinessHour[i].WeekdayID);
            }
        }
        return callback(null, params);
    } else {
        return callback(null, params);
    }
}
function checkBusinessAttrID(params, callback) {
    if (params[0].BusinessAttr != null && params[0].BusinessAttr.length > 0) {
        var inputAttrIDList = [];
        for (var i = 0; i < params[0].BusinessAttr.length; i++) {
            inputAttrIDList.push(params[0].BusinessAttr[i].AttrID.toString());
        }
        knex("CONFIG_BUSINESS_ATTR").whereIn("ATTR_ID", inputAttrIDList).asCallback(function (err, resultAttr) {
            if (err) {
                console.log(err);
                return callback(errorMessage.selectUnsuccessful);
            }
            if (resultAttr.length != inputAttrIDList.length) {
                var validAttrIDList = [];
                for (var i = 0; i < resultAttr.length; i++) {
                    validAttrIDList.push(resultAttr[i].ATTR_ID.toString());
                }
                return callback("Invalid Business Attribute ID. " + findInvalidID(inputAttrIDList, validAttrIDList));
            }
            return callback(null, params, resultAttr);
        });
    } else {
        return callback(null, params, []);
    }
}
function separateBusinessAttrByType(params, resultAttr, callback) {
    if (params[0].BusinessAttr != null && params[0].BusinessAttr.length > 0) {
        params[0].BusinessAttr.sort(function (a, b) {
            return a.AttrID - b.AttrID
        });
        resultAttr.sort(function (a, b) {
            return a.ATTR_ID - b.ATTR_ID
        });
        var dropdownAttr = [], textAttr = [], numberAttr = [], dateAttr = [];
        for (var i = 0; i < resultAttr.length; i++) {
            switch (resultAttr[i].ATTR_TYPE) {
                case "Dropdown":
                    dropdownAttr.push(params[0].BusinessAttr[i]);
                    break;
                case "Text":
                    textAttr.push(params[0].BusinessAttr[i]);
                    break;
                case "Number":
                    numberAttr.push(params[0].BusinessAttr[i]);
                    break;
                case "Date":
                    dateAttr.push(params[0].BusinessAttr[i]);
                    break;
                default:
                    return callback("Unsupported Business Attribute Type " + resultAttr[i].ATTR_TYPE + ". Attribute ID: " + resultAttr[i].ATTR_ID);
            }
        }
        //console.log(params[0].BusinessAttr);
        //console.log(resultAttr);
        //console.log(dropdownAttr);
        //console.log(textAttr);
        //console.log(numberAttr);
        //console.log(dateAttr);
        return callback(null, params, dropdownAttr, textAttr, numberAttr, dateAttr);
    } else {
        return callback(null, params, [], [], [], []);
    }
}
function checkBusinessAttrValue(params, dropdownAttr, textAttr, numberAttr, dateAttr, callback) {
    //check text attribute value
    for (var i = 0; i < textAttr.length; i++) {
        if (textAttr[i].AttrValue.length > businessMaxLength.TextValue) {
            return callback("Business Attribute Value exceeds max length " + businessMaxLength.TextValue + ". Attribute ID: " + textAttr[i].AttrID);
        }
    }
    //check number attribute value
    for (var i = 0; i < numberAttr.length; i++) {
        if (isNaN(numberAttr[i].AttrValue) || isNaN(parseInt(numberAttr[i].AttrValue))) {
            return callback("Invalid Business Attribute Value. Must be a number. Attribute ID: " + numberAttr[i].AttrID);
        }
    }
    //check date attribute value
    for (var i = 0; i < dateAttr.length; i++) {
        if (!moment(dateAttr[i].AttrValue, "M/D/YYYY", true).isValid()) {
            return callback("Invalid Business Attribute Value. Must be a date. Attribute ID: " + dateAttr[i].AttrID);
        }
    }
    //check dropdown attribute value
    if (dropdownAttr.length > 0) {
        var dropdownAttrIDList = [];
        for (var i = 0; i < dropdownAttr.length; i++) {
            dropdownAttrIDList.push(dropdownAttr[i].AttrID);
        }
        knex("CONFIG_BUSINESS_ATTR_DROP").whereIn("ATTR_ID", dropdownAttrIDList).asCallback(function (err, resultDropOption) {
            if (err) {
                console.log(err);
                return callback(errorMessage.selectUnsuccessful);
            }
            var dropOptionList = [];
            for (var i = 0; i < resultDropOption.length; i++) {
                dropOptionList.push(resultDropOption[i].ATTR_ID.toString() + resultDropOption[i].DROP_OPTION.toString());
            }
            dropOptionList.sort();
            //console.log(dropOptionList);
            for (var i = 0; i < dropdownAttr.length; i++) {
                if (!isMemberOf(dropOptionList, dropdownAttr[i].AttrID.toString() + dropdownAttr[i].AttrValue.toString())) {
                    return callback("Invalid Business Attribute Value. Must be a valid drop option. Attribute ID: " + dropdownAttr[i].AttrID);
                }
            }
            return callback(null, params, dropdownAttr, textAttr, numberAttr, dateAttr);
        });
    } else {
        return callback(null, params, dropdownAttr, textAttr, numberAttr, dateAttr);
    }
}
function generateOperationParams(params, dropdownAttr, textAttr, numberAttr, dateAttr, callback) {
    var operationParams = {};
    if (params[0].BusinessName != null && params[0].BusinessName !== "") {
        operationParams.BUSINESS_NAME = params[0].BusinessName;
    }
    if (params[0].AddressLine1 != null && params[0].AddressLine1 !== "") {
        operationParams.ADDRESS_LINE1 = params[0].AddressLine1 == "[EMPTY]" ? null : params[0].AddressLine1;
    }
    if (params[0].AddressLine2 != null && params[0].AddressLine2 !== "") {
        operationParams.ADDRESS_LINE2 = params[0].AddressLine2 == "[EMPTY]" ? null : params[0].AddressLine2;
    }
    if (params[0].City != null && params[0].City !== "") {
        operationParams.CITY = params[0].City;
    }
    if (params[0].State != null && params[0].State !== "") {
        operationParams.STATE = params[0].State;
    }
    if (params[0].Zip != null && params[0].Zip !== "") {
        operationParams.ZIP = params[0].Zip == "[EMPTY]" ? null : params[0].Zip;
    }
    if (params[0].Phone != null && params[0].Phone !== "") {
        operationParams.PHONE = params[0].Phone == "[EMPTY]" ? null : params[0].Phone;
    }
    if (params[0].Website != null && params[0].Website !== "") {
        operationParams.WEBSITE = params[0].Website == "[EMPTY]" ? null : params[0].Website;
    }
    if (params[0].Latitude != null && params[0].Latitude !== "") {
        operationParams.LATITUDE = params[0].Latitude == "[EMPTY]" ? null : params[0].Latitude;
    }
    if (params[0].Longitude != null && params[0].Longitude !== "") {
        operationParams.LONGITUDE = params[0].Longitude == "[EMPTY]" ? null : params[0].Longitude;
    }
    if (params[0].PriceRange != null && params[0].PriceRange !== "") {
        operationParams.PRICE_RANGE = params[0].PriceRange == "[EMPTY]" ? null : params[0].PriceRange;
    }
    if (params[0].Status != null && params[0].Status !== "") {
        operationParams.STATUS = params[0].Status;
    }
    return callback(null, dropdownAttr, textAttr, numberAttr, dateAttr, operationParams);
}
//business create/update common part ends

function generateQueryForHandlingBusinessSubAttr(businessID, params, dropdownAttr, textAttr, numberAttr, dateAttr) {
    var completeTextAttr = dropdownAttr.concat(textAttr);
    var tagTable = "", hourTable = "", textTable = "", numberTable = "", dateTable = "";
    for (var i = 0; i < params[0].BusinessTag.length; i++) {
        tagTable += "tagTable(" + (i + 1) + ").action := '" + params[0].BusinessTag[i].Action + "';";
        tagTable += "tagTable(" + (i + 1) + ").tag_id := " + params[0].BusinessTag[i].TagID + ";";
    }
    for (var i = 0; i < params[0].BusinessHour.length; i++) {
        hourTable += "hourTable(" + (i + 1) + ").action := '" + params[0].BusinessHour[i].Action + "';";
        hourTable += "hourTable(" + (i + 1) + ").weekday_id := " + params[0].BusinessHour[i].WeekdayID + ";";
        hourTable += "hourTable(" + (i + 1) + ").open_time := to_date('1/1/2000 " + params[0].BusinessHour[i].OpenTime + "', 'mm/dd/yyyy hh:mi am');";
        hourTable += "hourTable(" + (i + 1) + ").close_time := to_date('1/1/2000 " + params[0].BusinessHour[i].CloseTime + "', 'mm/dd/yyyy hh:mi am');";
    }
    for (var i = 0; i < completeTextAttr.length; i++) {
        textTable += "textTable(" + (i + 1) + ").action := '" + completeTextAttr[i].Action + "';";
        textTable += "textTable(" + (i + 1) + ").attr_id := " + completeTextAttr[i].AttrID + ";";
        textTable += "textTable(" + (i + 1) + ").text_value := '" + completeTextAttr[i].AttrValue + "';";
    }
    for (var i = 0; i < numberAttr.length; i++) {
        numberTable += "numberTable(" + (i + 1) + ").action := '" + numberAttr[i].Action + "';";
        numberTable += "numberTable(" + (i + 1) + ").attr_id := " + numberAttr[i].AttrID + ";";
        numberTable += "numberTable(" + (i + 1) + ").number_value := " + numberAttr[i].AttrValue + ";";
    }
    for (var i = 0; i < dateAttr.length; i++) {
        dateTable += "dateTable(" + (i + 1) + ").action := '" + dateAttr[i].Action + "';";
        dateTable += "dateTable(" + (i + 1) + ").attr_id := " + dateAttr[i].AttrID + ";";
        dateTable += "dateTable(" + (i + 1) + ").date_value := to_date('" + dateAttr[i].AttrValue + "', 'mm/dd/yyyy');";
    }
    var queryHandleBusinessSubAttr = `
    declare
    businessID number := ` + businessID + `;
    tagTable pack_business.TypeBusinessTagTable;
    hourTable pack_business.TypeBusinessHourTable;
    textTable pack_business.TypeBusinessAttrTextTable;
    numberTable pack_business.TypeBusinessAttrNumberTable;
    dateTable pack_business.TypeBusinessAttrDateTable;
    begin
    ` + tagTable + `
    ` + hourTable + `
    ` + textTable + `
    ` + numberTable + `
    ` + dateTable + `
    pack_business.proc_handle_business_sub_attr(businessID, tagTable, hourTable, textTable, numberTable, dateTable);
    end;
    `;
    //console.log(queryHandleBusinessSubAttr);
    return queryHandleBusinessSubAttr;
}

function findInvalidID(inputArray, correctArray) {
    var difference = [];
    for (var i = 0; i < inputArray.length; i++) {
        if (correctArray.indexOf(inputArray[i]) < 0 && difference.indexOf(inputArray[i]) < 0) {
            difference.push(inputArray[i]);
        }
    }
    var duplicate = [];
    inputArray.sort();
    if (inputArray[0] == inputArray[1]) {
        duplicate.push(inputArray[0]);
    }
    for (var i = 1; i < inputArray.length - 1; i++) {
        if (inputArray[i] != inputArray[i - 1] && inputArray[i] == inputArray[i + 1]) {
            duplicate.push(inputArray[i]);
        }
    }
    var message = "";
    if (difference.length > 0) {
        message += "Invalid ID: " + difference + ". ";
    }
    if (duplicate.length > 0) {
        message += "Duplicate ID: " + duplicate + ".";
    }
    return message;
}

function isValidBusinessHourTime(time) {
    var length, string;
    length = time.length;
    if (length != 7 && length != 8) {
        return false;
    }
    string = time.substring(length - 3, length);
    if (string != " am" && string != " pm") {
        return false;
    }
    string = time.charAt(length - 4);
    if (string < "0" || string > "9") {
        return false;
    }
    string = time.charAt(length - 5);
    if (string < "0" || string > "5") {
        return false;
    }
    string = time.charAt(length - 6);
    if (string != ":") {
        return false;
    }
    if (length == 7) {
        string = time.charAt(0);
        if (string < "1" || string > "9") {
            return false;
        }
    } else {
        string = time.charAt(1);
        if (string < "0" || string > "2") {
            return false;
        }
        string = time.charAt(0);
        if (string != "1") {
            return false;
        }
    }
    return true;
}

//dropOptionArray should have been sorted in ascending order
function getOptionList(dropOptionArray, dropCategory) {
    var low, high, tempLow, tempHigh, middle;
    var first = -1, last = -1;
    var option = [];
    low = 0;
    high = dropOptionArray.length - 1;
    while (low <= high) {
        middle = Math.floor((low + high) / 2);
        if (dropOptionArray[middle].DROP_CATEGORY < dropCategory) {
            low = middle + 1;
        } else if (dropOptionArray[middle].DROP_CATEGORY > dropCategory) {
            high = middle - 1;
        } else {
            first = middle;
            last = middle;
            tempLow = middle + 1;
            tempHigh = middle -1;
            while (low <= tempHigh) {
                middle = Math.floor((low + tempHigh) / 2);
                if (dropOptionArray[middle].DROP_CATEGORY < dropCategory) {
                    low = middle + 1;
                } else { //dropOptionArray[middle].DROP_CATEGORY == dropCategory
                    first = middle;
                    tempHigh = middle -1;
                }
            }
            while (tempLow <= high) {
                middle = Math.floor((tempLow + high) / 2);
                if (dropOptionArray[middle].DROP_CATEGORY > dropCategory) {
                    high = middle - 1;
                } else { //dropOptionArray[middle].DROP_CATEGORY == dropCategory
                    last = middle;
                    tempLow = middle + 1;
                }
            }
            break;
        }
    }
    if (first >= 0) {
        for (var i = first; i <= last; i++) {
            option.push(dropOptionArray[i].DROP_OPTION);
        }
    }
    return option;
}

//businessAttrOptionArray should have been sorted in ascending order
function getBusinessAttrOptionList(businessAttrOptionArray, attrID) {
    var low, high, tempLow, tempHigh, middle;
    var first = -1, last = -1;
    var option = [];
    low = 0;
    high = businessAttrOptionArray.length - 1;
    while (low <= high) {
        middle = Math.floor((low + high) / 2);
        if (businessAttrOptionArray[middle].ATTR_ID < attrID) {
            low = middle + 1;
        } else if (businessAttrOptionArray[middle].ATTR_ID > attrID) {
            high = middle - 1;
        } else {
            first = middle;
            last = middle;
            tempLow = middle + 1;
            tempHigh = middle -1;
            while (low <= tempHigh) {
                middle = Math.floor((low + tempHigh) / 2);
                if (businessAttrOptionArray[middle].ATTR_ID < attrID) {
                    low = middle + 1;
                } else {
                    first = middle;
                    tempHigh = middle -1;
                }
            }
            while (tempLow <= high) {
                middle = Math.floor((tempLow + high) / 2);
                if (businessAttrOptionArray[middle].ATTR_ID > attrID) {
                    high = middle - 1;
                } else {
                    last = middle;
                    tempLow = middle + 1;
                }
            }
            break;
        }
    }
    if (first >= 0) {
        for (var i = first; i <= last; i++) {
            option.push(businessAttrOptionArray[i].DROP_OPTION);
        }
    }
    return option;
}

//return date in format m/d/yyyy
function dateFormat(date) {
//    var d;
//    switch (format) {
//        case 1:
//            d = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
//            break;
//        default:
//            d = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
//            break;
//    }
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

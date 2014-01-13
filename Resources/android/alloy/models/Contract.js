exports.definition = {
    config: {
        columns: {
            type_sure_id: "integer",
            date_origin: "date",
            date_initiation_inforce: "date",
            date_end_inforce: "date",
            bill_collector: "integer",
            company_id: "integer",
            agreement_id: "integer",
            plan_id: "integer",
            client_id: "integer",
            type_insured_id: "integer"
        },
        adapter: {
            type: "sql",
            collection_name: "contract"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

model = Alloy.M("contract", exports.definition, []);

collection = Alloy.C("contract", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
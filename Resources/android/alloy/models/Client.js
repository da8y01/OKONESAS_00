exports.definition = {
    config: {
        columns: {
            first_name: "text",
            middle_name: "text",
            last_name: "text",
            maiden_name: "text",
            type_document_id: "integer",
            document: "integer",
            email: "text",
            birthdate: "date",
            ocupation_id: "integer",
            city_id: "integer",
            state_id: "integer",
            genre: "text",
            civil_state_id: "integer",
            zone_id: "integer"
        },
        adapter: {
            type: "sql",
            collection_name: "client"
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

model = Alloy.M("client", exports.definition, []);

collection = Alloy.C("client", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
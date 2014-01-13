exports.definition = {
    config: {
        columns: {
            phone: "text",
            address: "text",
            department_id: "integer",
            city_id: "integer",
            neighborhood: "text",
            zone_id: "integer",
            stratus: "integer",
            billing_period_id: "integer",
            service_cycle_id: "integer",
            relation_property_id: "integer",
            client_id: "integer",
            other_relation_property: "text"
        },
        adapter: {
            type: "sql",
            collection_name: "property"
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

model = Alloy.M("property", exports.definition, []);

collection = Alloy.C("property", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
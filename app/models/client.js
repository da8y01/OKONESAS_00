exports.definition = {
	config: {
		columns: {
		    "first_name": "text",
		    "middle_name": "text",
		    "last_name": "text",
		    "maiden_name": "text",
		    "type_document_id": "integer",
		    "document": "integer",
		    "email": "text",
		    "birthdate": "date",
		    "ocupation_id": "integer",
		    "city_id": "integer",
		    "state_id": "integer",
		    "genre": "text",
		    "civil_state_id": "integer",
		    "zone_id": "integer"
		},
		adapter: {
			type: "sql",
			collection_name: "client"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};
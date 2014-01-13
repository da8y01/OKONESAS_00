(function(Backbone) {
    var root = this;
    var Supermodel = root.Supermodel = {};
    Supermodel.VERSION = "0.0.4";
    var Collection = Backbone.Collection;
    var extend = Backbone.Model.extend;
    var Association = function(model, options) {
        this.required(options, "name");
        _.extend(this, _.pick(options, "name", "where", "source", "store"));
        _.defaults(this, {
            source: this.name,
            store: "_" + this.name
        });
        var ctor = model;
        do {
            if (!ctor.associations()[this.name]) continue;
            throw new Error("Association already exists: " + this.name);
        } while (ctor = ctor.parent);
        model.associations()[this.name] = this;
        this.initialize && model.all().on("initialize", this.initialize, this);
        this.change && model.all().on("change", this.change, this);
        this.parse && model.all().on("parse", this.parse, this);
        this.destroy && model.all().on("destroy", this.destroy, this);
        this.create && model.all().on("add", this.create, this);
    };
    Association.extend = extend;
    _.extend(Association.prototype, {
        associate: function(model, other) {
            if (!this.inverse) return;
            model.trigger("associate:" + this.inverse, model, other);
        },
        dissociate: function(model, other) {
            if (!this.inverse) return;
            model.trigger("dissociate:" + this.inverse, model, other);
        },
        required: function(options) {
            var option;
            for (var i = 1; arguments.length > i; i++) {
                if (options[option = arguments[i]]) continue;
                throw new Error("Option required: " + option);
            }
        },
        andThis: function(func) {
            var context = this;
            return function() {
                return func.apply(context, [ this ].concat(_.toArray(arguments)));
            };
        }
    });
    var One = Association.extend({
        constructor: function(model, options) {
            this.required(options, "inverse", "model");
            Association.apply(this, arguments);
            _.extend(this, _.pick(options, "inverse", "model"));
            _.defaults(this, {
                id: this.name + "_id"
            });
            model.all().on("associate:" + this.name, this.replace, this).on("dissociate:" + this.name, this.remove, this);
        },
        create: function(model) {
            model[this.name] = _.bind(this.access, this, model);
        },
        access: function(model, other) {
            if (2 > arguments.length) return model[this.store];
            this.replace(model, other);
        },
        initialize: function(model) {
            this.parse(model, model.attributes);
            var id = model.get(this.id);
            null != id && this.replace(model, id);
        },
        parse: function(model, resp) {
            if (!_.has(resp, this.source)) return;
            var attrs = resp[this.source];
            delete resp[this.source];
            this.replace(model, attrs);
        },
        change: function(model) {
            if (!model.hasChanged(this.id)) return;
            this.replace(model, model.get(this.id));
        },
        remove: function(model) {
            this.replace(model, null);
        },
        destroy: function(model) {
            var other = model[this.store];
            if (!other) return;
            this.remove(model);
            this.dissociate(other, model);
        },
        replace: function(model, other) {
            var id, current;
            if (!model) return;
            current = model[this.store];
            if (null != other && !_.isObject(other)) {
                id = other;
                (other = {})[this.model.prototype.idAttribute] = id;
            }
            !other || other instanceof Model || (other = this.model.create(other));
            if (current === other) return;
            other || model.unset(this.id);
            if (current) {
                delete model[this.store];
                this.dissociate(current, model);
            }
            if (!other) return;
            model.set(this.id, other.id);
            model[this.store] = other;
            this.associate(other, model);
        }
    });
    var ManyToOne = Association.extend({
        constructor: function(model, options) {
            this.required(options, "inverse", "collection");
            Association.apply(this, arguments);
            _.extend(this, _.pick(options, "collection", "inverse"));
            model.all().on("associate:" + this.name, this._associate, this).on("dissociate:" + this.name, this._dissociate, this);
        },
        create: function(model) {
            model[this.name] || (model[this.name] = _.bind(this.get, this, model));
        },
        get: function(model) {
            var collection = model[this.store];
            if (collection) return collection;
            collection = model[this.store] = new this.collection().on("add", this.add, this).on("remove", this.remove, this).on("reset", this.reset, this);
            collection.owner = model;
            return collection;
        },
        parse: function(model, resp) {
            var attrs = resp[this.source];
            if (!attrs) return;
            delete resp[this.source];
            var collection = this.get(model);
            attrs = collection.parse(attrs);
            if (!this.where) {
                collection.reset(attrs);
                return;
            }
            collection.reset(_.filter(_.map(attrs, function(attrs) {
                return new collection.model(attrs);
            }), this.where));
        },
        initialize: function(model) {
            this.parse(model, model.attributes);
        },
        add: function(model, collection) {
            if (!model || !collection) return;
            this.associate(model, collection.owner);
        },
        remove: function(model, collection) {
            if (!model || !collection) return;
            this.dissociate(model, collection.owner);
        },
        reset: function(collection) {
            if (!collection) return;
            collection.each(function(model) {
                this.associate(model, collection.owner);
            }, this);
        },
        destroy: function(model) {
            var collection;
            if (!model || !(collection = model[this.store])) return;
            collection.each(function(other) {
                this.dissociate(other, model);
            }, this);
        },
        _associate: function(model, other) {
            if (!model || !other) return;
            if (this.where && !this.where(other)) return;
            this.get(model).add(other);
        },
        _dissociate: function(model, other) {
            if (!model || !other || !model[this.store]) return;
            model[this.store].remove(other);
        }
    });
    var ManyToMany = Association.extend({
        constructor: function(model, options) {
            this.required(options, "collection", "through", "source");
            Association.apply(this, arguments);
            _.extend(this, _.pick(options, "collection", "through"));
            this._associate = this.andThis(this._associate);
            this._dissociate = this.andThis(this._dissociate);
        },
        create: function(model) {
            model[this.name] || (model[this.name] = _.bind(this.get, this, model));
        },
        get: function(model) {
            var collection = model[this.store];
            if (collection) return collection;
            collection = new this.collection();
            collection.owner = model;
            model[this.store] = collection;
            this.reset(model[this.through]().on("add", this.add, this).on("remove", this.remove, this).on("reset", this.reset, this).on("associate:" + this.source, this._associate).on("dissociate:" + this.source, this._dissociate));
            return collection;
        },
        add: function(model, through) {
            if (!model || !through || !(model = model[this.source]())) return;
            if (this.where && !this.where(model)) return;
            through.owner[this.name]().add(model);
        },
        remove: function(model, through) {
            if (!model || !through || !(model = model[this.source]())) return;
            var exists = through.any(function(o) {
                return o[this.source]() === model;
            }, this);
            exists || through.owner[this.name]().remove(model);
        },
        reset: function(through) {
            if (!through) return;
            var models = _.compact(_.uniq(_.invoke(through.models, this.source)));
            this.where && (models = _.filter(models, this.where));
            through.owner[this.name]().reset(models);
        },
        _associate: function(through, model, other) {
            if (!through || !model || !other) return;
            if (this.where && !this.where(other)) return;
            through.owner[this.name]().add(other);
        },
        _dissociate: function(through, model, other) {
            if (!through || !model || !other) return;
            var exists = through.any(function(o) {
                return o[this.source]() === other;
            }, this);
            exists || through.owner[this.name]().remove(other);
        }
    });
    var Has = function(model) {
        this.model = model;
    };
    _.extend(Has.prototype, {
        one: function(name, options) {
            options.name = name;
            new One(this.model, options);
            return this;
        },
        many: function(name, options) {
            options.name = name;
            var Association = options.through ? ManyToMany : ManyToOne;
            new Association(this.model, options);
            return this;
        }
    });
    var Model = Supermodel.Model = Backbone.Model.extend({
        cidAttribute: "cid",
        initialize: function() {
            this.set(this.cidAttribute, this.cid);
            var ctor = this.constructor;
            do ctor.all().add(this); while (ctor = ctor.parent);
            this.trigger("initialize", this);
        },
        toJSON: function() {
            var o = Backbone.Model.prototype.toJSON.apply(this, arguments);
            delete o[this.cidAttribute];
            return o;
        },
        parse: function(resp) {
            this.trigger("parse", this, resp);
            return resp;
        }
    }, {
        create: function(attrs, options) {
            var model;
            var all = this.all();
            var cid = attrs && attrs[this.prototype.cidAttribute];
            var id = attrs && attrs[this.prototype.idAttribute];
            if (cid && (model = all.getByCid(cid)) && model.attributes === attrs) return model;
            if (id && (model = all.get(id))) {
                model.parse(attrs);
                model.set(attrs);
                return model;
            }
            if (!id) return new this(attrs, options);
            var ctor = this;
            do {
                if (!ctor.all().get(id)) continue;
                throw new Error('Model with id "' + id + '" already exists.');
            } while (ctor = ctor.parent);
            return new this(attrs, options);
        },
        has: function() {
            return new Has(this);
        },
        all: function() {
            return this._all || (this._all = new Collection());
        },
        associations: function() {
            return this._associations || (this._associations = {});
        },
        reset: function() {
            this._all = new Collection();
            this._associations = {};
        }
    });
}).call(this, Backbone);
function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "white",
        layout: "vertical",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.txtEmail = Ti.UI.createTextField({
        id: "txtEmail",
        hintText: "Ingresar email"
    });
    $.__views.index.add($.__views.txtEmail);
    $.__views.txtPass = Ti.UI.createTextField({
        id: "txtPass",
        hintText: "Ingresar contraseña",
        passwordMask: "true"
    });
    $.__views.index.add($.__views.txtPass);
    $.__views.btnLogin = Ti.UI.createButton({
        title: "Entrar",
        id: "btnLogin"
    });
    $.__views.index.add($.__views.btnLogin);
    $.__views.btnExit = Ti.UI.createButton({
        title: "Salir",
        id: "btnExit"
    });
    $.__views.index.add($.__views.btnExit);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.include("lib/supermodel.js");
    $.index.open();
    Supermodel = require("supermodel");
    Alloy.Backbone.sync = function(method, model, opts) {
        require("alloy/sync/properties").sync(method, model, opts);
    };
    var Model = Supermodel.Model.extend({
        config: {
            adapter: {}
        }
    });
    var Collection = Alloy.Backbone.Collection.extend({
        cleanup: function() {
            var regex = new RegExp("^(" + this.config.adapter.collection_name + ")\\-(.+)$");
            var TAP = Ti.App.Properties;
            _.each(TAP.listProperties(), function(prop) {
                var match = prop.match(regex);
                if (match) {
                    TAP.removeProperty(prop);
                    Ti.API.info("deleting old model " + prop);
                }
            });
        }
    });
    var Exam = Model.extend({
        config: {
            adapter: {
                collection_name: "exams"
            }
        }
    });
    var Question = Model.extend({
        config: {
            adapter: {
                collection_name: "questions"
            }
        }
    });
    var Questions = Collection.extend({
        model: function(attrs, options) {
            return Question.create(attrs, options);
        },
        config: {
            adapter: {
                collection_name: "questions"
            }
        }
    });
    var Exams = Collection.extend({
        model: function(attrs, options) {
            return Exam.create(attrs, options);
        },
        config: {
            adapter: {
                collection_name: "exams"
            }
        }
    });
    new Exams().cleanup();
    new Questions().cleanup();
    Exam.has().many("questions", {
        collection: Questions,
        inverse: "exam"
    });
    Question.has().one("exam", {
        model: Exam,
        inverse: "questions"
    });
    var question, midtermExam = Exam.create({
        name: "Midterm2013"
    });
    midtermExam.save();
    _.each([ "one", "two", "three", "four" ], function(_item) {
        question = Question.create({
            exam_id: midtermExam.id,
            title: "Question number " + _item
        });
        question.save();
    });
    var exams = new Exams();
    exams.fetch({
        success: function(_model) {
            Ti.API.info(JSON.stringify(_model.models[0].toJSON(), null, 2));
            Ti.API.info(JSON.stringify(_model.models[0].questions().toJSON(), null, 2));
        },
        error: function() {}
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
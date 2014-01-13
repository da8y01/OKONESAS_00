Ti.include('lib/supermodel.js');

$.index.open();
//debugger;
 
Supermodel = require('supermodel');
 
// set the sync adapter
Alloy.Backbone.sync = function(method, model, opts) { //debugger;
    require("alloy/sync/properties").sync(method, model, opts);
};
 
 
var Model = Supermodel.Model.extend({
    config : {
        adapter : {}
    }
});
var Collection = Alloy.Backbone.Collection.extend({
    /**
     * clean up any models from the properties db
     */
    cleanup : function() {
        var regex = new RegExp("^(" + this.config.adapter.collection_name + ")\\-(.+)$");
        var TAP = Ti.App.Properties;
        _.each(TAP.listProperties(), function(prop) {
            var match = prop.match(regex);
            if (match) {
                TAP.removeProperty(prop);
                Ti.API.info('deleting old model ' + prop);
            }
        });
    }
});
 
var Exam = Model.extend({
    config : {
        adapter : {
            collection_name : 'exams'
        }
    }
});
var Question = Model.extend({
    config : {
        adapter : {
            collection_name : 'questions'
        }
    }
});
 
var Questions = Collection.extend({
    model : function(attrs, options) {
        return Question.create(attrs, options);
    },
    config : {
        adapter : {
            collection_name : 'questions'
        }
    }
});
 
 
var Exams = Collection.extend({
    model : function(attrs, options) {
        return Exam.create(attrs, options);
    },
    config : {
        adapter : {
            collection_name : 'exams'
        }
    }
});
 
// CLEAN UP OLD DATA
new Exams().cleanup();
new Questions().cleanup();
 
 
Exam.has().many('questions', {
    collection : Questions,
    inverse : 'exam'
});
 
Question.has().one('exam', {
    model : Exam,
    inverse : 'questions'
});
 
// create the objects
var question, midtermExam = Exam.create({
    name : "Midterm2013"
});
 
midtermExam.save();
 
_.each(['one', 'two', 'three', 'four'], function(_item, _index) {
    question = Question.create({
        exam_id : midtermExam.id,
        title : "Question number " + _item
    });
    question.save();
});
 
// fetch the objects
 
var exams = new Exams();
exams.fetch({
    success : function(_model, _response) { //debugger;
        Ti.API.info(JSON.stringify(_model.models[0].toJSON(), null, 2));
        Ti.API.info(JSON.stringify(_model.models[0].questions().toJSON(), null, 2));
    },
    error : function() { //debugger;
    }
});
 
/**
 * clean up any models from the properties db
 *
 * @param {Object} _prefix
 */
function cleanup(_prefix) {
    var regex = new RegExp("^(" + _prefix + ")\\-(.+)$");
    var TAP = Ti.App.Properties;
    _.each(TAP.listProperties(), function(prop) {
        var match = prop.match(regex);
        if (match) {
            TAP.removeProperty(prop);
            Ti.API.info('deleting old model ' + prop);
        }
    });
}
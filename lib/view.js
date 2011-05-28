var HyperNotes = HyperNotes || {};

HyperNotes.View = function($) {
  var my = {};

  my.NoteAddView = Backbone.View.extend({
  });

  my.NoteView = Backbone.View.extend({
    tagName:  "li",

    events: {
      "dblclick div.note-content" : "edit",
      "click span.note-destroy"   : "clear",
      "keypress .note-input"      : "updateOnEnter"
    },

    initialize: function() {
      _.bindAll(this, 'render', 'close');
      this.model.bind('change', this.render);
      this.model.view = this;
    },

    render: function() {
      var tmplData = {
        note: this.model.toJSON()
      }
      var templated = $.tmpl(HyperNotes.Template.noteSummary, tmplData);
      $(this.el).html(templated);
      this.input = this.$('.note-input');
      this.input.bind('blur', this.close);
      return this;
    },

    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    close: function() {
      this.model.save({label: this.input.val()});
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function() {
      this.model.destroy();
      this.remove();
    }
  });

  my.NoteListView = Backbone.View.extend({
    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-note":  "createOnEnter",
    },

    initialize: function() {
      _.bindAll(this, 'addOne', 'addAll', 'render');

      this.input    = this.$("#new-note");

      this.collection.bind('add',     this.addOne);
      this.collection.bind('refresh', this.addAll);
      this.collection.bind('all',     this.render);

      this.collection.fetch();
    },

    addOne: function(note) {
      var view = new my.NoteView({model: note});
      this.$("#note-list").append(view.render().el);
    },

    addAll: function() {
      this.collection.each(this.addOne);
    },

    newAttributes: function() {
      var summary = this.input.val();
      return HyperNotes.Util.parseNoteSummary(summary);
    },

    createOnEnter: function(e) {
      // enter key
      if (e.keyCode != 13) return;
      this.collection.create(this.newAttributes());
      this.input.val('');
    }
  });

  my.TimeMapView = Backbone.View.extend({
    events: {
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.collection.bind('all', this.render);
    },

    _getDatasetForTimeMap: function() {
      var datasets = [
        {
          id: "xxxx",
          title: "my dataset",
          theme: "orange",
          type: "basic",
          options: {
            items: []
          }
        }
      ];
      $.each(this.collection.models, function(idx, model) {
        model = model.toJSON();
        var timemapObj = {
          start : model.start.unparsed,
          end : model.end.unparsed,
          point : {
              lat : 43.7717,
              lon : 11.2536
           },
          title : model.title,
          options : {}
        }
        datasets[0].options.items.push(timemapObj);
      });
      return datasets;
    },

    render: function() {
      var out = $.tmpl(HyperNotes.Template.timeMap, {});
      this.el.html(out);
      var datasets = this._getDatasetForTimeMap();
      var tm;
      try {
        tm = TimeMap.init({
          mapId: "map",
          timelineId: "timeline",
          datasets: datasets,
          options: {
            eventIconPath: "../vendor/timemap/2.0/images/"
          },
          bandIntervals: [
              Timeline.DateTime.DECADE, 
              Timeline.DateTime.CENTURY
          ]
        });
      } catch (e) {
        // console.log(e);
      }

    }
  });

  return my;
}(jQuery);

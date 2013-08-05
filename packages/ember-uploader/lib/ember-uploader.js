var get = Ember.get,
    set = Ember.set;

Ember.Uploader = Ember.Object.extend(Ember.Evented, {
  upload: function() {
    var url      = get(this, 'url'),
        data     = new FormData(),
        settings = {},
        self     = this;

    set(this, 'isUploading', true);

    settings.url  = url;
    settings.type = 'POST';
    settings.beforeSend = function(jqXHR) {
      if (!('onprogress' in jqXHR.upload)) {
        return;
      }
      jqXHR.upload.addEventListener('progress', self.didProgress, false);
    };

    data.append('file', get(this, 'file'));

    settings.data = data;

    return this._ajax(settings).then(this.didUpload);
  },

  didUpload: function() {
    set(this, 'isUploading', false);
    this.trigger('didUpload');
  },

  didProgress: function(e) {
    e.percent = e.loaded / e.total * 100;
    set(this, 'progress', e.percent);
    this.trigger('progress', e);
  },

  _ajax: function(settings) {
    return Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(respText) {
        Ember.run(null, resolve, respText);
      };

      settings.error = function(jqXHR) {
        Ember.run(null, reject, jqXHR);
      };

      Ember.$.ajax(settings);
    });
  }
});

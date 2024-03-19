
function bookmarkModel(options) {
    var self = this;

    scenarioModel.apply(this, arguments);

    self.uid = options.uid;
    self.name = options.name;
    self.description = options.description;
    self.state = options.state || null;
    try {
      self.json = JSON.parse(options.json) || {};
    } catch (e) {
      self.json = {};
    }

    self.shared = ko.observable();
    self.sharedByName = options.sharedByName || null;
    self.sharedByUser = options.sharedByUser;
    self.sharedByWho = self.sharedByName;
    self.sharedBy = ko.observable();
    // The groups that this object is shared with that we are a member of
    self.sharedToGroups = ko.observableArray(options.sharedToGroups);

    if (options.shared) {
        self.shared(true);
        var s = ['Shared By',
                 self.sharedByWho,
                 'to group' + (self.sharedToGroups().length == 1 ? '' : 's'),
                 self.sharedToGroups().join(", ")];
        self.sharedBy(s.join(" "));
    }
    else {
        self.shared(false);
        self.sharedBy(false);
    }

    self.selectedGroups = ko.observableArray();
    self.sharedGroupsList = [];
    if (options.sharingGroups && options.sharingGroups.length) {
        self.selectedGroups(options.sharingGroups);
    }
    self.temporarilySelectedGroups = ko.observableArray();

    // load state from bookmark
    self.loadBookmark = function() {
        app.saveStateMode = false;
        if (self.hasOwnProperty('json') && self.json && JSON.stringify(self.json) != "{}" && self.json instanceof Object && Object.keys(self.json).length > 0) {
          app.loadState(self.json);
        } else {
          app.loadState(self.state);
        }

        app.viewModel.bookmarks.activeBookmark(self.name);

        // show the alert for resting state
        app.viewModel.error("restoreState");
    };

    self.showSharingModal = function() {
        // app.viewModel.bookmarks.sharingBookmark(app.viewModel.bookmarks.activeBookmark);
        app.viewModel.bookmarks.sharingBookmark(self);
        self.temporarilySelectedGroups.removeAll();
        for (var i = 0; i < self.selectedGroups().length; i++) {
            self.temporarilySelectedGroups.push(self.selectedGroups()[i]);
        }
        $('#bookmark-share-modal').modal('show');
    };

    /** Return true if this bookmark is shared with the specified groupName
     */
    self.sharedWithGroup = function(groupName) {
        return self.selectedGroups.indexOf(groupName) != -1;
    }

    // get the url from a bookmark
    self.getBookmarkUrl = function() {
        var host = window.location.href.split('#')[0];
        return host + "#bookmark=" + self.id.replace(/\D/g,''); //We just want the integer ID, this strips away all non-numeric text
    };

    self.getBookmarkState = function() {
        return self.state;
    };

    self.getBookmarkHash = function() {
        return $.param(self.getBookmarkState());
    };

    return self;
} // end of bookmarkModel

function bookmarksModel(options) {
    var self = this;

    // list of bookmarks
    self.bookmarksList = ko.observableArray();

    self.activeBookmark = ko.observable();

    // current bookmark for sharing modal or map links modal
    self.sharingBookmark = ko.observable();

    // groups a bookmark may be shared with
    self.sharingGroups = ko.observableArray();

    // name of newly created bookmark
    self.newBookmarkName = ko.observable();

    // description of newly created bookmark
    self.newBookmarkDescription = ko.observable();

    // check for duplicate naming
    self.duplicateBookmark = ko.observable(false);

    self.toggleGroup = function(obj) {
        var groupName = obj.group_name,
            indexOf = self.sharingBookmark().temporarilySelectedGroups.indexOf(groupName);

        if ( indexOf === -1 ) {  //add group to list
            self.sharingBookmark().temporarilySelectedGroups.push(groupName);
        } else { //remove group from list
            self.sharingBookmark().temporarilySelectedGroups.splice(indexOf, 1);
        }
    };

    self.groupIsSelected = function(groupName) {
        if (!self.sharingBookmark()) {
            return false;
        }
        var indexOf = self.sharingBookmark().temporarilySelectedGroups.indexOf(groupName);
        return indexOf !== -1;
    };

    self.groupMembers = function(groupName) {
        var memberList = "";
        for (var i=0; i<self.sharingGroups().length; i++) {
            var group = self.sharingGroups()[i];
            if (group.group_name === groupName) {
                for (var m=0; m<group.members.length; m++) {
                    var member = group.members[m];
                    memberList += member + '<br>';
                }
            }
        }
        return memberList;
    };

    self.loadBookmarkFromHash = function(bookmark_id) {
      $.jsonrpc('load_bookmark', [bookmark_id], {
          success: function(result) {
            app.loadState(JSON.parse(result[0].json));
          },
          error: function(result) {

          }
      });
    };

    self.getCurrentBookmarkURL = function() {
        if ( self.sharingBookmark() ) {
            self.shrinkBookmarkURL(true);
            return self.useShortBookmarkURL();
            // return self.sharingBookmark().getBookmarkUrl();
        } else {
            return '';
        }
    };

    self.shrinkBookmarkURL = ko.observable(true);
    self.shrinkBookmarkURL.subscribe( function() {
        if (self.shrinkBookmarkURL()) {
            self.useShortBookmarkURL();
        } else {
            self.useLongBookmarkURL();
        }
    });

    self.resetBookmarkMapLinks = function(bookmark) {
        self.sharingBookmark(bookmark);
        self.shrinkBookmarkURL(true);
        $('.in #short-url').text = self.getCurrentBookmarkURL();
        self.setBookmarkIFrameHTML();
    };

    self.shareBookmark = function(){
        //$('#bookmark-share-modal').modal('hide');
        self.sharingBookmark(app.viewModel.bookmarks.activeBookmark);
        $('#bookmark-share-modal').modal('show');

    }

    self.useLongBookmarkURL = function() {
        $('.in #short-url')[0].value = self.sharingBookmark().getBookmarkUrl();
    };

    self.useShortBookmarkURL = function() {
        var bitly_access_token = '227d50a9d70140483b003a70b1f449e00514c053';
            long_url = self.sharingBookmark().getBookmarkUrl();
            params = {
              "group_guid": "Bec5n80dm93",
              "domain": "bit.ly",
              "long_url": long_url
            };

        $.ajax({
          type: "POST",
          url: "https://api-ssl.bitly.com/v4/shorten",
          data: JSON.stringify(params),
          success: function(response){
              if (response.link != undefined) {
                $('.in #short-url')[0].value = response.link;
              } else {
                $('.in #short-url')[0].value = long_url;
              }
          },
          dataType: 'json',
          contentType: "application/json",
          beforeSend: function(xhr){
            xhr.setRequestHeader("Authorization", "Bearer " + bitly_access_token);
          }
        });
    };

    self.setBookmarkIFrameHTML = function() {
        var bookmarkState = self.sharingBookmark().getBookmarkHash();
        $('.in #bookmark-iframe-html')[0].value = app.viewModel.mapLinks.getIFrameHTML(bookmarkState);

        /*var urlOrigin = window.location.origin,
            urlHash = $.param(self.sharingBookmark().state);

        if ( !urlOrigin ) {
            urlOrigin = 'http://' + window.location.host;
        }
        var embedURL = urlOrigin + '/embed/map/#' + urlHash
        $('#bookmark-iframe-html')[0].value = '<iframe width="600" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" ' +
                                     'src="' + embedURL + '">' + '</iframe>' + '<br />';
        */
    };

    self.openBookmarkIFrameExample = function() {
        var windowName = "newMapWindow";
        var windowSize = "width=650, height=550";
        var mapWindow = window.open('', windowName, windowSize);

        var urlOrigin = window.location.origin;
        if ( !urlOrigin ) {
            urlOrigin = 'http://' + window.location.host;
        }
        var header = '<a href="/visualize"><img src="'+urlOrigin+'/media/marco/img/marco-logo_planner.jpg" style="border: 0px;"/></a>';
        var iframeID = '#iframe-html';

        mapWindow.document.write('<html><body><b>start</b><hr>');
        mapWindow.document.write(app.viewModel.mapLinks.getIFrameHTML());
        mapWindow.document.write('<hr><b>end</b></body></html>');
        mapWindow.document.title = "Your MARCO Map!";
        mapWindow.document.close();

        /*var windowName = "newMapWindow",
            windowSize = "width=650, height=550",
            mapWindow = window.open('', windowName, windowSize);
        var urlOrigin = window.location.origin;
        if ( !urlOrigin ) {
            urlOrigin = 'http://' + window.location.host;
        }
        var header = '<header role="banner"><div class="navbar navbar-fixed-top"><div class="navbar-inner"><div class="container-fluid"><div class="row-fluid"><div class="span12"><a href="/visualize"><img src="'+urlOrigin+'/media/marco/img/marco-logo_planner.jpg"/></a><h3 class="pull-right" data-bind="visible: mapTitle, text: mapTitle"></h3></div></div></div></div></div></header>';
        mapWindow.document.write('<html><body>' + header + $('#bookmark-iframe-html')[0].value + '</body></html>');
        mapWindow.document.close();
        */
    };

    self.removeBookmark = function(bookmark, event) {
        // Insert RUS before submitting
        app.viewModel.rus.showDialog(
            "Remove Bookmark?", 
            `Are you sure you wish to delete your bookmark "${bookmark.name}"?`,
            function(){
                $.jsonrpc('remove_bookmark', [bookmark.uid],
                        {complete: self.getBookmarks});
            }
        );
    };

    // handle the bookmark submit
    self.addBookmark = function(name, description) {
      var app_state_json = app.getState();
      var state_json = {
        x: app_state_json.x,
        y: app_state_json.y,
        z: app_state_json.z,
        basemap: app_state_json.basemap,
        layers: [],
        themes: app_state_json.themes,
        panel: app_state_json.layers,
        // RDH 2019-12-12: I don't think the below values are used
        legends: app_state_json.legends,
        control: app_state_json.control,
        logo: app_state_json.logo
      }
      var order = 0;
      for (var i = 0; i < app_state_json.dls.length; i++) {
        var new_layer = {
          visible: app_state_json.dls[i]
        }
        i++;
        new_layer.opacity = app_state_json.dls[i];
        i++;
        layer_record = app.viewModel.getLayerById(app_state_json.dls[i]);
        if (layer_record) {
          new_layer.type = layer_record.type;
          new_layer.url = layer_record.url;
          new_layer.name = layer_record.name;
          new_layer.id = layer_record.id; //should = app_state_json.dls[i]
          new_layer.order = order;
          try {
            new_layer.dynamic = layer_record.isMDAT || layer_record.isVTR || layer_record.wmsSession();
            new_layer.isUserLayer = layer_record.wmsSession();
          } catch (e) {
            new_layer.dynamic = false;
            new_layer.isUserLayer = false;
          }
          new_layer.isMDAT = layer_record.isMDAT;
          new_layer.isVTR = layer_record.isVTR;
        } else if (app_state_json.dls[i].indexOf('aoi')>=0) {
          layer_identifier = app_state_json.dls[i];
          new_layer.type = "Vector";
          new_layer.url = null;
          new_layer.name = app.viewModel.layerIndex[layer_identifier].name;
          new_layer.id = app.viewModel.layerIndex[layer_identifier].id;
          new_layer.order = null;
          new_layer.dynamic = false;
          new_layer.isUserLayer = false;
          new_layer.isMDAT = false;
          new_layer.isVTR = false;
        }

        if (new_layer.type == "ArcRest" || new_layer.type == "ArcFeatureServer") {
          new_layer.arcgislayers = layer_record.arcgislayers;
        } else {
          new_layer.arcgislayers = null;
        }

        state_json.layers.push(new_layer);

        order++;

      }
      $.jsonrpc('add_bookmark',
               [
                 name,
                 description,
                 window.location.hash.slice(1),
                 JSON.stringify(state_json),
               ],
               {complete: self.getBookmarks}
      );
    }

    // get bookmark sharing groups for this user
    self.getSharingGroups = function() {
        // borrow groups from the scenarios model instead of fetching them again
        self.sharingGroups(app.viewModel.scenarios.sharingGroups());
    }

    // store the bookmarks to local storage
    self.storeBookmarks = function() {
        var ownedBookmarks = [];
        for (var i=0; i<self.bookmarksList().length; i++) {
            var bookmark = self.bookmarksList()[i];
            if ( ! bookmark.shared() ) {
                ownedBookmarks.push(bookmark);
            }
        }
        amplify.store("marco-bookmarks", ownedBookmarks);
    };

    // method for loading existing bookmarks
    self.getBookmarks = function() {
        //get bookmarks from local storage
        // var existingBookmarks = amplify.store("marco-bookmarks");
        var existingBookmarks = [];
        var local_bookmarks = [];
        if (existingBookmarks) {
            for (var i = 0; i < existingBookmarks.length; i++) {
                local_bookmarks.push({
                    'name': existingBookmarks[i].name,
                    'hash': existingBookmarks[i].hash,
                    'json': existingBookmarks[i].json,
                    'sharing_groups': existingBookmarks[i].sharingGroups
                });
            }
        }

        // load bookmarks from server while syncing with client
        //if the user is logged in, ajax call to sync bookmarks with server
        $.jsonrpc('get_bookmarks', [], {
            success: function(result) {
                var bookmarks = result || [];
                var blist = [];
                for (var i=0; i < bookmarks.length; i++) {
                    var bookmark = new bookmarkModel( {
                        state: $.deparam(bookmarks[i].hash),
                        name: bookmarks[i].name,
                        description: bookmarks[i].description,
                        json: bookmarks[i].json,
                        uid: bookmarks[i].uid,
                        shared: bookmarks[i].shared,
                        sharedByUser: bookmarks[i].shared_by_user,
                        sharedByName: bookmarks[i].shared_by_name,
                        sharingGroups: bookmarks[i].sharing_groups,
                        sharedToGroups: bookmarks[i].shared_to_groups
                    });
                    blist.push(bookmark);
                }

                if (blist.length > 0) {
                    blist.sort(function (a, b) {
                      // for all false values null, false, '', 0
                      if (!a.name) return 1;
                      if (!b.name) return 0;

                      a = (a.name || '').toLowerCase();
                      b = (b.name || '').toLowerCase();

                      return (a > b) ? 1 : ((a < b) ? -1 : 0);
                    });
                }
                self.bookmarksList(blist);
            },
            error: function(result) {

            }
        });

        self.getSharingGroups();
    };

    //sharing bookmark
    self.submitShare = function() {
        self.sharingBookmark().selectedGroups(self.sharingBookmark().temporarilySelectedGroups());
        var data = { 'bookmark': self.sharingBookmark().uid,
        'groups': self.sharingBookmark().selectedGroups() };

        $.jsonrpc('share_bookmark',
                  [self.sharingBookmark().uid,
                   self.sharingBookmark().selectedGroups()],
                  {complete: self.getBookmarks});
    };

    self.restoreState = function() {
        // hide the error
        app.viewModel.error(null);
        // restore the state
        app.loadState(app.restoreState);
        app.saveStateMode = true;
    };

    return self;
} // end of bookmarksModel

bookmarksModel.prototype.showSharingModal = function(bookmark) {
    app.viewModel.bookmarks.activeBookmark(bookmark);
    bookmark.showSharingModal();
}

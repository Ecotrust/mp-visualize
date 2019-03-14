
function bookmarkModel(options) {
    var self = this;

    self.uid = options.uid;
    self.name = options.name;
    self.state = options.state || null;

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
        app.loadState(self.getBookmarkState());

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
        return host + "#" + self.getBookmarkHash();
        //return host + "#" + self.state;
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
        var bitly_login = "p97dev",
            bitly_api_key = 'R_27f2b2cc886e49fb9f35c37b7b633749',
            long_url = self.sharingBookmark().getBookmarkUrl();

        $.getJSON(
            "http://api.bitly.com/v3/shorten?callback=?",
            {
                "format": "json",
                "apiKey": bitly_api_key,
                "login": bitly_login,
                "longUrl": long_url
            },
            function(response)
            {
                $('.in #short-url')[0].value = response.data.url;
            }
        );
    };

    self.setBookmarkIFrameHTML = function() {
        var bookmarkState = self.sharingBookmark().getBookmarkHash();
        $('.in #bookmark-iframe-html')[0].value = app.viewModel.mapLinks.getIFrameHTML(bookmarkState);

        /*var urlOrigin = window.location.origin,
            urlHash = $.param(self.sharingBookmark().state);

        if ( !urlOrigin ) {
            urlOrigin = window.location.protocol + '//' + window.location.host;
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
            urlOrigin = window.location.protocol + '//' + window.location.host;
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
            urlOrigin = window.location.protocol + '//' + window.location.host;
        }
        var header = '<header role="banner"><div class="navbar navbar-fixed-top"><div class="navbar-inner"><div class="container-fluid"><div class="row-fluid"><div class="span12"><a href="/visualize"><img src="'+urlOrigin+'/media/marco/img/marco-logo_planner.jpg"/></a><h3 class="pull-right" data-bind="visible: mapTitle, text: mapTitle"></h3></div></div></div></div></div></header>';
        mapWindow.document.write('<html><body>' + header + $('#bookmark-iframe-html')[0].value + '</body></html>');
        mapWindow.document.close();
        */
    };

    self.removeBookmark = function(bookmark, event) {
        $.jsonrpc('remove_bookmark', [bookmark.uid],
                  {complete: self.getBookmarks});
    };

    // handle the bookmark submit
    self.addBookmark = function(name) {
        $.jsonrpc('add_bookmark',
                  [name,
                   window.location.hash.slice(1)], // TODO: self.get_location()
                  {complete: self.getBookmarks});
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

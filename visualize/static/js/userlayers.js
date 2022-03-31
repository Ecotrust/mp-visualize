function userLayerModel(options) {
    var self = this;

    scenarioModel.apply(this, arguments);

    self.uid = options.uid;
    self.name = options.name;
    self.description = options.description;

    self.layer_type = options.layer_type;
    self.url = options.url;
    self.arcgis_layers = options.arcgis_layers || null;

    if (
            (
                self.layer_type == 'ArcRest' || 
                self.layer_type == 'ArcFeatureServer'
            ) &&
            self.arcgis_layers == null
    ) {
        // Default to id 0 (often appropriate)
        self.arcgis_layers = 0;
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

    self.loadUserLayer = function() {
        app.viewModel.displayUserLayer(self);
    }

    self.showSharingModal = function() {
        app.viewModel.userlayers.sharingUserLayer(self);
        self.temporarilySelectedGroups.removeAll();
        for (var i = 0; i < self.selectedGroups().length; i++) {
            self.temporarilySelectedGroups.push(self.selectedGroups()[i]);
        }
        $('#user-layer-share-modal').modal('show');
    };

    /** Return true if this user layer is shared with the specified groupName
     */
    self.sharedWithGroup = function(groupName) {
        return self.selectedGroups.indexOf(groupName) != -1;
    }

    // get the url from a bookmark
    self.getBookmarkUrl = function() {
        var host = window.location.href.split('#')[0];
        return host + "#userlayer=" + self.id.replace(/\D/g,''); //We just want the integer ID, this strips away all non-numeric text
    };

    return self;

}   // end of userLayerModel

function userLayersModel(options) {
    var self = this;

    self.userLayersList = ko.observableArray();

    self.activeUserLayer = ko.observable();

    self.layer = ko.observable();

    self.userLayerForm = ko.observable(false);
    self.loadingUserLayerForm = ko.observable(false);

    self.sharingUserLayer = ko.observable();

    self.sharingGroups = ko.observableArray();

    // name of newly created user layer
    self.newUserLayerName = ko.observable();

    // description of newly created user layer
    self.newUserLayerDescription = ko.observable();

    self.newUserLayerUrl = ko.observable();
    self.newUserLayerLayerType = ko.observable();
    self.newUserLayerArcGISLayers = ko.observable();
    self.layerTypes = ko.observableArray(['ArcRest', 'ArcFeatureServer']);

    // check for duplicate naming
    self.duplicateUserLayer = ko.observable(false);

    self.createUserLayer = function() {
        self.loadingUserLayerForm(true);
        return $.ajax({
            url: '/features/userlayer/form/',
            success: function(data) {
                self.userLayerForm(true);
                app.viewModel.scenarios.userLayerForm(true);
                $('#user-layer-form').html(data);
                self.userLayerFormModel = new userLayerFormModelConstructor();
                try {
                  ko.applyBindings(self.userLayerFormModel, document.getElementById('user-layer-form'));
                }
                catch(e) {}
                self.loadingUserLayerForm(false);
            },
            error: function (result) {
                self.loadingUserLayerForm(false);
            }
        });
    };

    self.removeUserLayerForm = function(obj) {
        app.viewModel.hideUserLayersForm();
        self.userLayerForm(false);
        app.viewModel.scenarios.userLayerForm(false);
        var userLayerForm = document.getElementById('user-layer-form');
        $(userLayerForm).empty();
        ko.cleanNode(userLayerForm);
        delete self.userLayerFormModel;
    };

    self.createDisplayLayer = function(userLayer) {
        var lyrObj = new Object();
        lyrObj.name = userLayer.name;
        lyrObj.url = userLayer.url;
        lyrObj.arcgis_layers = userLayer.arcgis_layers;
  
        lyrObj.type = userLayer.layer_type;
        lyrObj.wmsSession = true;
        lyrObj.id = userLayer.id;

        app.viewModel.getOrCreateLayer(lyrObj, null, 'activateLayer', null);
    };

    self.toggleUserLayer = function(self, event) {
        if (event) {
            var userLayer = this;
        } else {
            var userLayer = self;
        }

        if (!userLayer.hasOwnProperty('layer') || userLayer.layer() == null) {
            userLayer.layer(false);
        }

        // start saving restore state again and remove restore state message from map view
        app.saveStateMode = true;
        app.viewModel.error(null);
        //app.viewModel.unloadedDesigns = [];

        //app.viewModel.activeLayer(layer);

        if (!userLayer.layer()) {
            if (Object.keys(app.viewModel.layerIndex).indexOf(userLayer.id) >= 0) {
                userLayer.layer(app.viewModel.layerIndex[userLayer.id]);
            }
        }
        
        if (userLayer.layer() && userLayer.layer().active()) { // if layer is active, then deactivate
            userLayer.layer().deactivateLayer();
        } else { // otherwise layer is not currently active, so activate
            if (!userLayer.layer()) {
                app.viewModel.userLayers.createDisplayLayer(userLayer);
            } else {
                userLayer.layer().activateLayer();
            }
        }
    };

    self.toggleGroup = function(obj) {
        var groupName = obj.group_name,
            indexOf = self.sharingUserLayer().temporarilySelectedGroups.indexOf(groupName);

        if ( indexOf === -1 ) {  //add group to list
            self.sharingUserLayer().temporarilySelectedGroups.push(groupName);
        } else { //remove group from list
            self.sharingUserLayer().temporarilySelectedGroups.splice(indexOf, 1);
        }
    };

    self.groupIsSelected = function(groupName) {
        if (!self.sharingUserLayer()) {
            return false;
        }
        var indexOf = self.sharingUserLayer().temporarilySelectedGroups.indexOf(groupName);
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

    self.shareUserLayer = function(){
        self.sharingUserLayer(app.viewModel.userLayers.activeUserLayer);
        $('#user-layer-share-modal').modal('show');

    }

    self.removeUserLayer = function(userLayer, event) {
        $.jsonrpc('remove_user_layer', [userLayer.uid],
                  {complete: self.getUserLayers});
    };

    self.addUserLayer = function(name, description, layer_type, url, arcgis_layers) {
        $.jsonrpc('add_user_layer', 
            [
                name,
                description,
                layer_type,
                url,
                arcgis_layers
            ],
            {complete: self.getUserLayers}
        );
    }

    // get user layer sharing groups for this user
    self.getSharingGroups = function() {
        // borrow groups from the scenarios model instead of fetching them again
        self.sharingGroups(app.viewModel.scenarios.sharingGroups());
    }

    // store the user layers to local storage
    self.storeUserLayers = function() {
        var ownedUserLayers = [];
        for (var i=0; i<self.userLayersList().length; i++) {
            var userLayer = self.userLayersList()[i];
            if ( ! userLayer.shared() ) {
                ownedUserLayers.push(userLayer);
            }
        }
        amplify.store("user-layers", ownedUserLayers);
    };

    // method for loading existing user layers
    self.getUserLayers = function() {
        var existingUserLayers = [];
        var local_user_layers = [];
        if (existingUserLayers) {
            for (var i = 0; i < existingUserLayers.length; i++) {
                local_user_layers.push({
                    'name': existingUserLayers[i].name,
                    'description': existingUserLayers[i].description,
                    'layer_type': existingUserLayers[i].layer_type,
                    'url': existingUserLayers[i].url,
                    'arcgis_layers': existingUserLayers[i].arcgis_layers,
                    'sharing_groups': existingUserLayers[i].sharingGroups
                });
            }
        }

        $.jsonrpc('get_user_layers', [], {
            success: function(result) {
                self.userLayersList.removeAll();
                var user_layers = result || [];
                var ullist = [];
                for (var i=0; i < user_layers.length; i++) {
                    var user_layer = new userLayerModel( {
                        name: user_layers[i].name,
                        description: user_layers[i].description,
                        url: user_layers[i].url,
                        layer_type: user_layers[i].layer_type,
                        arcgis_layers: user_layers[i].arcgis_layers,
                        wmsSession: true,
                        uid: user_layers[i].uid,
                        shared: user_layers[i].shared,
                        sharedByUser: user_layers[i].shared_by_user,
                        sharedByName: user_layers[i].shared_by_name,
                        sharingGroups: user_layers[i].sharing_groups,
                        sharedToGroups: user_layers[i].shared_to_groups
                    });
                    self.userLayersList.push(user_layer);
                }

                self.userLayersList.sort(self.alphabetizeByName);
                self.showUnloadedUserLayers();
            },
            error: function(result) {

            }
        });

        self.getSharingGroups();
    };

    self.initializeNewUserLayer = function(user_layer_id) {
        app.viewModel.userLayers.search_layer_id = user_layer_id;
        user_layer = app.viewModel.userLayers.getUserLayerById(user_layer_id);
        if (user_layer == null) {
            window.setTimeout(function() {
                app.viewModel.userLayers.initializeNewUserLayer(app.viewModel.userLayers.search_layer_id);
            }, 100);
        } else {
            self.toggleUserLayer(user_layer);
        }
    };

    self.finishAddingUserLayer = function(result) {
        app.viewModel.userLayers.removeUserLayerForm();
        user_layer = self.initializeNewUserLayer(result["X-Madrona-Show"]); 
    }

    self.getUserLayerById = function(userlayer_id) {
        var layers = self.userLayersList();
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].id == userlayer_id) {
                return layers[i];
            }
        }
        return null;
    };

    self.submitShare = function() {
        self.sharingUserLayer().selectedGroups(self.sharingUserLayer().temporarilySelectedGroups());
        var data = { 
            'user_layer': self.sharingUserLayer().uid,
            'groups': self.sharingUserLayer().selectedGroups() };

        $.jsonrpc('share_user_layer',
                  [self.sharingUserLayer().uid,
                   self.sharingUserLayer().selectedGroups()],
                  {complete: self.getUserLayers});
    };

    self.populateLayerIndexCallback = function() {
        for (var idx = 0; idx < self.userLayersList().length; idx++) {
            user_layer = self.userLayersList()[idx];
            app.viewModel.layerIndex[user_layer.id] = user_layer;
        }
        self.userLayersLoaded = true;
        self.showUnloadedUserLayers();
    };

    self.showUnloadedUserLayers = function() {
        var designs = app.viewModel.unloadedDesigns;

        if (designs && designs.length) {
            //the following delay might help solve what appears to be a race condition
            //that prevents the design in the layer list from displaying the checked box icon after loadin
            setTimeout( function() {
                var userLayerIds = []
                for (var i=0; i < app.viewModel.userLayers.userLayersList().length; i++) {
                    userLayerIds.push(app.viewModel.userLayers.userLayersList()[i].id);
                }
                for (var x=0; x < designs.length; x=x+1) {
                    var id = designs[x].id,
                        opacity = designs[x].opacity,
                        isVisible = designs[x].isVisible;

                    var user_layer = self.getUserLayerById(id);
                    self.toggleUserLayer(user_layer);

                    if ( layer_index >= 0) {
                        window.setTimeout(function(){
                            app.viewModel.userLayers.userLayersList()[id].opacity(opacity);
                        }, 500)
                        for (var i=0; i < app.viewModel.unloadedDesigns.length; i=i+1) {
                          if(app.viewModel.unloadedDesigns[i].id === id) {
                            app.viewModel.unloadedDesigns.splice(i,1);
                            i = i-1;
                          }
                        }
                    }
                }
            }, 2750);
        }
    }

    self.alphabetizeByName = function(a, b) {
        var name1 = a.name.toLowerCase(),
            name2 = b.name.toLowerCase();
        if (name1 < name2) {
            return -1;
        } else if (name1 > name2) {
            return 1;
        }
        return 0;
    };

    return self;
}   // end of userLayersModel

userLayersModel.prototype.showSharingModal = function(userLayer) {
    app.viewModel.userLayers.activeUserLayer(userLayer);
    userLayer.showSharingModal();
}

function userLayerFormModelConstructor(options) {
    var self = this;

    self.newUserLayerUrl  = ko.observable();
    self.newUserLayerLayerType =  ko.observable('ArcRest');
    self.newUserLayerArcGISLayers = ko.observable();
    self.newUserLayerName = ko.observable();
    self.duplicateUserLayer = ko.observable(false);
    self.newUserLayerDescription = ko.observable();

    return self;
}
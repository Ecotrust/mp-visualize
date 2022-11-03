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

    self.wms_slug = options.wms_slug || null;
    self.wms_srs = options.wms_srs || null;
    self.wms_params = options.wms_params || null;
    self.wms_version = options.wms_version || null;
    self.wms_format = options.wms_format || null;
    self.wms_styles = options.wms_styles || null;

    self.shared = ko.observable();
    self.sharedByName = options.sharedByName || null;
    self.sharedByUser = options.sharedByUser;
    self.sharedByWho = self.sharedByName;
    self.sharedBy = ko.observable();
    // The groups that this object is shared with that we are a member of
    self.sharedToGroups = ko.observableArray(options.sharedToGroups);

    self.ownedByUser = options.ownedByUser;

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

    self.active = function() {
        if (app.viewModel.getLayerById(self.id)) {
            return true;
        } else {
            return false;
        }
    }

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

    // check for duplicate naming
    self.duplicateUserLayer = ko.observable(false);

    self.visibleLayers = ko.computed(function() {
        var visible_layers = [];
        for (var i = 0; i < self.userLayersList().length; i++) {
            var layer = self.userLayersList()[i];
            if (layer.ownedByUser || layer.sharedToGroups().length > 0) {
                visible_layers.push(layer);
            }
        }
        return visible_layers;
      });

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

    self.editUserLayer = function(userLayer){
        if ( !userLayer.active() ) {
            self.toggleUserLayer(userLayer);
        }

        return $.ajax({
            url: '/features/userlayer/' + userLayer.uid + '/form/',
            success: function(data) {
                self.userLayerForm(true);
                app.viewModel.scenarios.userLayerForm(true);
                self.userLayerFormModel = new userLayerFormModelConstructor();

                $('#user-layer-form').html(data);
                ko.applyBindings(self.userLayerFormModel, document.getElementById('user-layer-form'));

                app.viewModel.userLayers.userLayerFormModel.showEdit(true);
            },
            error: function (result) {
                //debugger;
            }
        });
    }

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

        lyrObj.wms_slug = userLayer.wms_slug;
        lyrObj.wms_srs = userLayer.wms_srs;
        lyrObj.wms_params = userLayer.wms_params;
        lyrObj.wms_version = userLayer.wms_version;
        lyrObj.wms_format = userLayer.wms_format;
        lyrObj.wms_styles = userLayer.wms_styles;
  
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

    self.shareUserLayer = function(userLayer){
        app.viewModel.scenarios.showSharingModal(userLayer);
    }

    self.removeUserLayer = function(userLayer, event) {
        $.jsonrpc('remove_user_layer', [userLayer.uid],
                  {complete: self.getUserLayers});
    };

    self.addUserLayer = function(name, description, layer_type, url, arcgis_layers, wms_slug, wms_srs, wms_params, wms_version, wms_format, wms_styles) {
        $.jsonrpc('add_user_layer', 
            [
                name,
                description,
                layer_type,
                url,
                arcgis_layers,
                wms_slug,
                wms_srs,
                wms_params,
                wms_version,
                wms_format,
                wms_styles,
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
                    'sharing_groups': existingUserLayers[i].sharingGroups,
                    'wms_slug': existingUserLayers[i].wms_slug,
                    'wms_srs': existingUserLayers[i].wms_srs,
                    'wms_params': existingUserLayers[i].wms_params,
                    'wms_version': existingUserLayers[i].wms_version,
                    'wms_format': existingUserLayers[i].wms_format,
                    'wms_styles': existingUserLayers[i].wms_styles,
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
                        sharedToGroups: user_layers[i].shared_to_groups,
                        ownedByUser: user_layers[i].owned_by_user,
                        wms_slug: user_layers[i].wms_slug,
                        wms_srs: user_layers[i].wms_srs,
                        wms_params: user_layers[i].wms_params,
                        wms_version: user_layers[i].wms_version,
                        wms_format: user_layers[i].wms_format,
                        wms_styles: user_layers[i].wms_styles,
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
            if (!user_layer.active()) {
                self.toggleUserLayer(user_layer);
            }
        }
    };

    self.finishAddingUserLayer = function(result) {
        var layer_id = result["X-Madrona-Show"];
        existing_userlayer = self.getUserLayerById(layer_id);
        if (existing_userlayer) {
            if (existing_userlayer.hasOwnProperty('layer') && existing_userlayer.layer()) {
                existing_userlayer.layer().deactivateLayer();
                existing_userlayer.layer(false);
            }
            if (Object.keys(app.viewModel.layerIndex).indexOf(layer_id) >= 0) {
                delete app.viewModel.layerIndex[layer_id];
            }
        }
        app.viewModel.userLayers.removeUserLayerForm();
        self.purgeUserLayerById(layer_id);
        user_layer = self.initializeNewUserLayer(layer_id); 
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

    self.purgeUserLayerById = function(userlayer_id) {
        var layers = self.userLayersList();
        for (var i= 0; i < layers.length; i++) {
            if (layers[i].id == userlayer_id) {
                self.userLayersList().splice(i, 1);
                break;
            }
        }
        var layers = app.viewModel.activeLayers();
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].id == userlayer_id) {
                layers[i].deactivateLayer();
                break;
            }
        }
    }

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
                
                for (var x=0; x < designs.length; x=x+1) {
                    var id = designs[x].id,
                        opacity = designs[x].opacity,
                        isVisible = designs[x].isVisible;

                    var user_layer = self.getUserLayerById(id);
                    if (user_layer == null) {
                        for (var y=0; y < self.userLayersList().length; y++) {
                            if (id == self.userLayersList()[y].id) {
                                user_layer = self.userLayersList()[y];
                                // stop loop
                                y = self.userLayersList().length;
                            }
                        }
                    }
                    if (user_layer && !user_layer.active()) {
                        self.toggleUserLayer(user_layer);
                    }
                }
                
                if ( user_layer) {
                    window.setTimeout(function(){
                        app.viewModel.layerIndex[id].opacity(opacity);
                        if (!isVisible || isVisible == "false") {
                            app.viewModel.getLayerById(id).toggleVisible();
                        }
                    }, 500);
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
    self.showEdit = ko.observable(false);

    return self;
}
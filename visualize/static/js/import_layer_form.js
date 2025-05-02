madrona.onShow(function(){
    madrona.setupForm($('#addUserLayerForm'));
    var max_step = 2;

    var step = 1;

    function validate(step) {
        return_value = true;
        if (step == 1) {
        } else if (step == max_step) {

        }
        return return_value;
    };

    function wizard(action) {
        if (step == 1 && action == 'next') {
            if (validate(step)) {
                step += 1;
            }
        } else if (step > 1 && action == 'prev') {
            step -= 1;
        }
        $('div.step').each(function(index) {
            $(this).hide();
        });
        $('div#step' + step).show();

        if (step == 1) {
            $('#button_prev').hide();
            $('#button_submit').hide();
        } else {
            $('#button_prev').show();
        }

        if (step == max_step) {
            $('#button_next').hide();
            $('.submit_button').show();
        } else {
            $('#button_next').show();
            $('.submit_button').hide();
        }
    };

    function hideOptions() {
        var hidden_options = [
            "radio",
            "checkbox",
            "placeholder",
        ];
        for (var i = 0; i < hidden_options.length; i++) {
            $('option[value="' + hidden_options[i] + '"]').css({'display':'none',});
        }
        $('#id_layer_type').change();

    }

    function createSelect(name, selected_val, allowed_values, allow_empty, parse_options) {
        let option_html = '';
        const id = "id_" + name;
        let field = $('<select id="' + id + '" type="text" name="' + name + '" />');
        let option_values = [];

        let options = [];
        if (allow_empty) {
            field.append($('<option value="">None</option>'));
        }
        if (parse_options) {
            // 2025-04-17: keys changed from array of strings to array of objects, this reverts that work to make old logic work.
            for (var key_index = 0; key_index < parse_options.keys.length; key_index++) {
                if (typeof(parse_options.keys[key_index]) == 'object') {
                    if (parse_options.keys[key_index].hasOwnProperty('key')) {
                        parse_options.keys[key_index] = parse_options.keys[key_index].key;
                    } else {
                        parse_options.keys[key_index] = String(parse_options.keys[key_index]);
                    }
                }
            }
            let layer_index = $('#id_wms_slug').val();
            const data_keys = Object.keys(parse_options.data);
            for (var i = 0; i < data_keys.length; i++) {
                let data_key = data_keys[i];
                let data_key_values = [];
                if (Array.isArray(parse_options.data[data_key])) {
                    data_key_values = parse_options.data[data_key];
                } else {
                    data_key_values = Object.keys(parse_options.data[data_key]);
                }

                for (var j = 0; j < data_key_values.length; j++) {
                    let data_key_value = data_key_values[j];
                    if (option_values.indexOf(data_key_value) < 0) {
                        option_values.push(data_key_value);
                    }
                }
            }

            for (var i = 0; i < option_values.length; i++) {
                let option_value = option_values[i];
                let selected = option_value == selected_val;
                option_html = '<option value="' + option_value + '"';
                if (selected) {
                    option_html += ' selected';
                }
                option_html += '>' + option_value + '</option>';
                console.log(option_html);
                field.append($(option_html));
            }
            console.log(field);

        } else {
            let option_title = null;
            let option_value = null;
            let allowed_value = null;
            let option_obj = {};
            for (var i in allowed_values) {
                allowed_value = allowed_values[i];
                option_value = allowed_value;
                option_title = allowed_value;
                if (typeof(allowed_value) == 'object') {
                    if (allowed_value.hasOwnProperty('key')) {
                        option_value = allowed_value.key;
                        if (allowed_value.hasOwnProperty('title')) {
                            option_title = allowed_value.title;
                        } else {
                            option_title = allowed_value.key;
                        }
                    } 
                }
                option_obj = {
                    "val": option_value,
                    "text": option_title,
                    "selected": option_value == selected_val
                }
                options.push(option_obj)

            }
            for (var i in options) {
                let option = options[i];
                option_html = '<option value="' + option.val + '"';
                if (option.selected) {
                    option_html += ' selected';
                }
                option_html += '>' + option.text + '</option>';
                field.append($(option_html));
            }
        }
        if (selected_val) {
            field.val(selected_val).change();
        }

        return field;
    }

    function importWmsOptions(event) {
        
        // Get wms_slug value
        wms_slug_val = $("#id_wms_slug").val();
        // Get wms_srs value
        wms_srs_val = $("#id_wms_srs").val();

        wms_version = $("#id_wms_version").val();
        if (!wms_version || wms_version.length < 1) {
            wms_version = '1.3.0';
        }

        wms_format_val = $("#id_wms_format").val();
        wms_styles_val = $("#id_wms_styles").val();

        if (event.target.checked){
            //  Start spinner
            $('body').css("cursor", "wait");
            //  Get URL
            url = $("#id_url").val();
            //  AJAX GetCapabilities
            $.ajax({
                url: "/data_manager/wms_capabilities/?url=" + url,
                success: function(data) {
                    //          Replace slug input with dropdown element
                    //              Insert option for prior wms_slug value (if any, and not in options)
                    $('#id_wms_slug').remove();
                    var slug_field = createSelect("wms_slug", wms_slug_val, data.layers, true, false);
                    $("#wms-layer-field div.step1-inputs div.step1-param").html(slug_field);
                    // hide all options in drop-downs that don't relate to the selected layer
                    slug_field.on('change', function(){
                        $('option.id_wms_srs').hide();
                        $('option.id_wms_srs_' + slug_field.val()).show();
                        $('option.id_wms_styles').hide();
                        $('option.id_wms_styles_' + slug_field.val()).show();
                    });

                    $('#id_wms_srs').remove();
                    var srs_field = createSelect("wms_srs", wms_srs_val, [], true, {keys: data.layers, data: data.srs});
                    $("#wms-proj-field div.step1-inputs div.step1-param").html(srs_field);

                    if (data.version && data.version != '') {
                        $("#id_wms_version").val(data.version);
                    }

                    $('#id_wms_format').remove();
                    var format_field = createSelect("wms_format", wms_format_val, data.formats, true, false);
                    $("#wms-format-field div.step1-inputs div.step1-param").html(format_field);

                    $('#id_wms_styles').remove();
                    var styles_field = createSelect("wms_styles", wms_styles_val, [], true, {keys: data.layers, data: data.styles});
                    $("#wms-styles-field div.step1-inputs div.step1-param").html(styles_field);

                    slug_field.change();

                },
                error: function(data) {
                    var get_cap_url = url + 'SERVICE=WMS&REQUEST=GetCapabilities';
                    window.alert('Error getting WMS capabilities: please check your URL and that you get a response at: ' + get_cap_url);
                    $("body").css("cursor", "unset");
                }
            }).done(function() {
                //          Kill Spinner
                $("body").css("cursor", "unset");
            });

        } else {
            $('#id_wms_slug').remove();
            var slug_field = $('<input id="id_wms_slug" type="text" name="wms_slug"/>');
            slug_field.val(wms_slug_val);
            $("#wms-layer-field div.step1-inputs div.step1-param").html(slug_field);

            $('#id_wms_srs').remove();
            var srs_field = $('<input id="id_wms_srs" type="text" name="wms_srs" />');
            srs_field.val(wms_srs_val);
            $("#wms-proj-field div.step1-inputs div.step1-param").html(srs_field);

            $('#id_wms_format').remove();
            var format_field = $('<input id="id_wms_format" type="text" name="wms_format" />');
            format_field.val(wms_format_val);
            $("#wms-format-field div.step1-inputs div.step1-param").html(format_field);

            $('#id_wms_styles').remove();
            var styles_field = $('<input id="id_wms_styles" type="text" name="wms_styles" />');
            styles_field.val(wms_styles_val);
            $("#wms-styles-field div.step1-inputs div.step1-param").html(styles_field);

        }
    }

    $("#wms_help").click(importWmsOptions);

    $('#id_layer_type').change(function() {
        var layer_type_selected = $('#id_layer_type').val();
        var arclayer_types = ['ArcRest', 'ArcFeatureServer'];

        if (arclayer_types.indexOf(layer_type_selected) >= 0) {
            $('#arcgis-layer-field').css({'display':'inherit',});
            $('#password-protected-field').css({'display':'inherit',});
        } else {
            $('#arcgis-layer-field').css({'display':'none',});
            $('#password-protected-field').css({'display':'none',});
        }

        if (layer_type_selected == 'WMS') {
            $('#wms-fields').css({'display': 'inherit',});
        } else {
            $('#wms-fields').css({'display': 'none',});
        }
    })

    $('#button_prev').click( function() { wizard('prev'); });
    $('#button_next').click( function() { wizard('next'); });
    step = get_import_form_step()
    // step = 1;
    // {% if form.errors %}
    //     step = 2; // form errors exist
    // {% endif %}
    wizard();
    hideOptions();
    $('i.fa-info-circle').tooltip();

    $('#id_name').keypress(function (e) {
        if (e.which === 13) {
            $('#user-layer-form .submit_button').click();
            return false;
        } else {
            $('#invalid-name-message').hide();
        }
    });

    $('#user-layer-help-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var userlayer_help_topic = button.data('userlayer_help_topic');
        var userlayer_help_content = button.data('userlayer_help_content');

        $('#user-layer-help-modal-topic').html(userlayer_help_topic);
        $('#user-layer-help-modal-content').html(userlayer_help_content);
    });
});
$(function(){
    // 宣言
    var format_version = 2;
    var is_separator_drag = false;
    var is_dependencies_enable = false;
    var is_capabilities_enable = false;
    var is_metadata_enable = false;
    var is_world_template = false;
    onChangedJSON();
    // 変更
    $(document).on("change",'input,textarea,select',function(){
        onChangedJSON();
    });
    // セパレータ移動
    $(".separator").on("mousedown",function(e){
        if(!is_separator_drag){
            is_separator_drag = true;

        }else if(is_separator_drag){
            is_separator_drag = false;
        }
    });
    $(document).on("mouseup",function(){
        is_separator_drag = false;
        $("html").removeAttr("style",'');
        $(".separator").prev().removeClass('drag_lock');
        $(".separator").next().removeClass('drag_lock');
    });
    $(document).on("mousemove",function(e){
        if(is_separator_drag){
            $("html").css("cursor","e-resize");
            $(".separator").prev().addClass('drag_lock');
            $(".separator").next().addClass('drag_lock');
            var maxwidth = $("html").width()-5;
            var nextwidth = maxwidth-e.clientX;
            var prevwidth = maxwidth-nextwidth;
            $(".separator").prev().css("flex-basis",prevwidth);
            $(".separator").next().css("flex-basis",nextwidth);
        }
    });
    // 外部インポート
    $("#input_file").on("change",function(){
        var data = $("#input_file").prop('files')[0]; 
        var file_reader = new FileReader();
        file_reader.onload = function(){
            json_text = file_reader.result;
            import_data(json_text);
        };
        try{
            file_reader.readAsText(data);
        }catch(e){
            console.error("error:"+e);
        }
    });
    // プレビュー表示切替
    $("p#show_preview").on("click",function(){
        $("div.preview").slideToggle();
        if($("p#show_preview").attr("class")=="active"){
            $("p#show_preview").removeClass('active');
        }else{
            $("p#show_preview").addClass('active');
        }
    });
    // ウィンドウワイズ変更時にcss削除
    $(window).resize(function(){
        $("div.preview").removeAttr("style",'');
    });
    // about開く
    $("p#open_about").on("click",function(){
        $("div.page_about").fadeIn();
    });
    // about閉じる
    $("div.close_about").on("click",function(){
        $("div.page_about").fadeOut();
    });
    // コピー
    $("p.preview_contlrol_copy").on("click",function(){
        $("textarea#code_buffer").select();
        document.execCommand("copy");
        $("p.preview_contlrol_copy").text("Copied");
        $("textarea#code_buffer").blur();
        setTimeout(function(){
            $("p.preview_contlrol_copy").text("Copy");
        },1000);
    });
    // ダウンロード
    $("p.preview_contlrol_download").on("click",function(){
        content = $("textarea#code_buffer").val();
        $("<a></a>", {href: window.URL.createObjectURL(new Blob([content])),
            download: "manifest.json",
            target: "_blank"})[0].click();
    });
    // イシューリスト開閉
    $("div.issue_contlrol_bar").on("click",function(){
        if($("div.issue_contlrol_bar img").attr("class")=="close"){
            // 開く
            $("div.issue_contlrol_bar img").attr("class","open")
        }
        else if($("div.issue_contlrol_bar img").attr("class")=="open"){
            // 閉じる
            $("div.issue_contlrol_bar img").attr("class","close")
        }
        $("div.issue_content").slideToggle();
    });
    
    $('#format_version').on("change",function(){
        format_version = Number($('#format_version').val());
    });
    //UUID生成
    $(document).on("click",'input[type="button"].generate_uuid',function(){
        $(this).prev().val(getUuid_v4);
        onChangedJSON();
    });
    //Modules tab変更
    $(document).on("click",".modules_controls_tab li",function(){
        selectedindex = $(".modules_controls_tab li").index(this);
        $(".modules_controls_tab li").removeClass('selected_tab');
        $(".modules_controls_tab li").eq(selectedindex).addClass('selected_tab');
        $(".modules_contents > div").removeClass('selected_tab_content');
        $(".modules_contents > div").eq(selectedindex).addClass('selected_tab_content');
    });
    // Modules tab削除
    $(document).on("click",".modules_controls_tab li span.delete_tab",function(event){
        selectedindex = $(this).parent().index();
        $(this).parent().remove();
        $(".modules_controls_tab li").eq(selectedindex-1).addClass('selected_tab');
        $(".modules_contents > div").eq(selectedindex-1).addClass('selected_tab_content');
        $(".modules_contents > div").eq(selectedindex).remove();
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            $(".modules_controls_tab li").eq(i).html(i+'<span class="delete_tab">×</span>');
        }
        if($(".modules_controls_tab li").length<=1){
            $(".modules_controls_addtab").show();
        }
        onChangedJSON();
        event.stopPropagation();
    });
    //Modules tab追加
    $(".modules_controls_addtab").on("click",function(){
        modules_addtab();
        onChangedJSON();
    });
    //Dependencies tab変更
    $(document).on("click",".dependencies_controls_tab li",function(){
        if(is_dependencies_enable){
            selectedindex = $(".dependencies_controls_tab li").index(this);
            $(".dependencies_controls_tab li").removeClass('selected_tab');
            $(".dependencies_controls_tab li").eq(selectedindex).addClass('selected_tab');
            $(".dependencies_list > div").removeClass('selected_tab_content');
            $(".dependencies_list > div").eq(selectedindex).addClass('selected_tab_content');
        }
    });
    // Dependencies tab削除
    $(document).on("click",".dependencies_controls_tab li span.delete_tab",function(event){
        if(is_dependencies_enable){
            selectedindex = $(this).parent().index();
            $(".dependencies_controls_tab li").eq(selectedindex-1).addClass('selected_tab');
            $(".dependencies_list > div").eq(selectedindex-1).addClass('selected_tab_content');
            $(this).parent().remove();
            $(".dependencies_list > div").eq(selectedindex).remove();
            for(i=0;i<$(".dependencies_controls_tab li").length;i++){
                $(".dependencies_controls_tab li").eq(i).html(i+'<span class="delete_tab">×</span>');
            }
            onChangedJSON();
        }
        event.stopPropagation();
    });
    //Dependencies tab追加
    $(".dependencies_controls_addtab").on("click",function(){
        if(is_dependencies_enable){
            dependencies_addtab();
        }
        onChangedJSON();
    });
    //author追加
    $("#metadata_author_add").on("click",function(){
        if(is_metadata_enable){
            add_author($("#metadata_author").val());
        }
        onChangedJSON();
    });
    //author削除
    $(document).on("click","span.metadata_delete_author",function(){
        if(is_metadata_enable){
            $(this).parent().remove();
        }
        onChangedJSON();
    });
    // UUID生成
    function getUuid_v4() {
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }
    // モジュールタブ追加
    function modules_addtab(){
        num = $(".modules_controls_tab li").length;
        addtab = '<li>'+num+'<span class="delete_tab">×</span></li>';
        $(".modules_controls_tab").append(addtab);
        content = $(".modules_contents > div:first-child").clone();
        content.removeClass('selected_tab_content');
        $(".modules_contents").append(content);
        if(0<num){
            $(".modules_controls_addtab").hide();
        }
    }
    // 依存タブ追加
    function dependencies_addtab(){
        num = $(".dependencies_controls_tab li").length;
        addtab = '<li>'+num+'<span class="delete_tab">×</span></li>';
        $(".dependencies_controls_tab").append(addtab);
        content = $(".dependencies_list > div:first-child").clone();
        content.removeClass('selected_tab_content');
        $(".dependencies_list").append(content);
    }
    // オーナー追加
    function add_author(name){
        author_list_child = '<div><span class="name">'+name+'</span><span class="metadata_delete_author">×</span></div>';
        $(".metadata_author_list").append(author_list_child);
    }

    // 更新処理
    function onChangedJSON(){
        changed_checkbox();
        type_changed();
        checkIssue();
        json_code = exportJSON();
        $("pre.language-json code.language-json").remove();
        content = '<code class="language-json">'+json_code+'</code>';
        $("pre.language-json").append(content);
        $("textarea#code_buffer").val(json_code);
        Prism.highlightAll();
    }
    // チェックボックス変更
    function changed_checkbox(){
        is_dependencies_enable = $('#dependencies_enable').is(':checked');
        is_capabilities_enable = $('#capabilities_enable').is(':checked');
        is_metadata_enable = $('#metadata_enable').is(':checked');
        if(is_dependencies_enable){
            $(".dependencies_contents").removeClass('disabled');
            $('div.dependencies_list input').prop('disabled', false);
            $('span.dependencies_controls_addtab').removeClass('disabled');
        }else{
            $(".dependencies_contents").addClass('disabled');
            $('div.dependencies_list input').prop('disabled', true);
            $('span.dependencies_controls_addtab').addClass('disabled');
        }
        if(is_capabilities_enable){
            $(".capabilities_list").removeClass('disabled');
            $('div.capabilities_list input').prop('disabled', false);
        }else{
            $(".capabilities_list").addClass('disabled');
            $('div.capabilities_list input').prop('disabled', true);
        }
        if(is_metadata_enable){
            $(".metadata_list").removeClass('disabled');
            $('div.metadata_list input').prop('disabled', false);
        }else{
            $(".metadata_list").addClass('disabled');
            $('div.metadata_list input').prop('disabled', true);
        }
    }
    // モジュールタイプ変更
    function type_changed(){
        is_world_template = false;
        $("#header_min_engine_version").removeClass("disabled");
        $("#header_min_engine_version *").prop('disabled', false);
        $("#header_base_game_version").addClass("disabled");
        $("#header_base_game_version *").prop('disabled', true);
        $("#header_lock_template_options").parent().addClass("disabled");
        $("#header_lock_template_options").prop('disabled', true);
        for(i=1;i<=$(".modules_controls_tab li").length;i++){
            $('div.modules_contents > div:nth-child('+i+') #modules_type option').prop('disabled', false);
            switch($('div.modules_contents > div:nth-child('+i+') #modules_type').val()){
                case "resources":
                    $(".modules_controls_addtab").hide();
                    type_prevention(i,"resources");
                    break;
                case "data":
                    if($(".modules_controls_tab li").length<=1){
                        $(".modules_controls_addtab").show();
                    }
                    type_prevention(i,"data");
                    break;
                case "client_data":
                    if($(".modules_controls_tab li").length<=1){
                        $(".modules_controls_addtab").show();
                    }
                    type_prevention(i,"client_data");
                    break;
                case "interface":
                    $(".modules_controls_addtab").hide();
                    type_prevention(i,"interface");
                    break;
                case "world_template":
                    $(".modules_controls_addtab").hide();
                    type_prevention(i,"world_template");
                    is_world_template = true;
                    $("#header_min_engine_version").addClass("disabled");
                    $("#header_min_engine_version *").prop('disabled', true);
                    if(format_version>=2){
                        $("#header_base_game_version").removeClass("disabled");
                        $("#header_base_game_version *").prop('disabled', false);
                    }
                    $("#header_lock_template_options").parent().removeClass("disabled");
                    $("#header_lock_template_options").prop('disabled', false);
                    break;
            }
        }
    }
    // 別タイプの選択制限
    function type_prevention(index,selected_type){
        for(i=1;i<=$(".modules_controls_tab li").length;i++){
            if(index!=i){
                switch(selected_type){
                    case "resources":
                        break;
                    case "data":
                        $('div.modules_contents > div:nth-child('+i+') #modules_type option').prop('disabled', true);
                        $('div.modules_contents > div:nth-child('+i+') #modules_type option[value="client_data"]').prop('disabled', false);
                        break;
                    case "client_data":
                        $('div.modules_contents > div:nth-child('+i+') #modules_type option').prop('disabled', true);
                        $('div.modules_contents > div:nth-child('+i+') #modules_type option[value="client_data"]').prop('disabled', false);
                        break;
                    case "interface":
                        break;
                    case "world_template":
                        break;
                }
            }
        }
    };
    // イシューチェック
    function checkIssue(){
        // イシュー削除
        $("ul.issue_list li").remove();
        error_num = checkJSONError();
        warning_num = checkJSONWarning();
        $("span.issue_warning_num").text("警告:"+warning_num);
        $("span.issue_error_num").text("エラー:"+error_num);
        if(warning_num<=0&&error_num<=0){
            $("ul.issue_list").append('<li>問題はありません</li>');
        }
    }
    // 警告検査
    function checkJSONWarning(){
        warning_num = 0;
        // format_version固有
        switch(format_version){
            case 1:
                if(Number($('#header_min_engine_version_major').val())>1||
                Number($('#header_min_engine_version_minor').val())>=13){
                    //1.13以上は警告
                    addIssue('warning',"[Header:min engine version] フォーマットバージョン1では1.13より低いバージョンに設定する必要があります。これより高いバージョンはフォーマットバージョン2でサポートしています。");
                    warning_num++;
                };
                break;
            case 2:
                break;
        }
        if($('#header_pack_name').val()==""){
            //名前がありません
            addIssue('warning',"[Header:neme] 名前が空です。名前が空の場合、\"名前がありません\"と表示されます。");
            warning_num++;
        }
        if($('#header_description').val()==""){
            //説明がありません
            addIssue('warning',"[Header:description] 説明がありません。説明が空の場合、\"不明なパックの説明\"と表示されます。");
            warning_num++;
        }
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            child_num = i + 1;
            if($('div.modules_contents > div:nth-child('+child_num+') #modules_description').val()==""){
                //UUIDではありません
                addIssue('warning',"[Modules:"+i+":description] 説明がありません。");
                warning_num++;
            }
        }
        if(is_capabilities_enable){
            if(!$('#experimental_custom_ui').is(':checked')
            &&!$('#chemistry').is(':checked')
            &&!$('#raytracing').is(':checked')){
                //空です
                addIssue('warning',"[Capabilities] 項目が一つも選択されていません。");
                warning_num++;
            }
        }
        if(is_metadata_enable){
            if($('div.metadata_author_list > div')[0]){
                for(i=1;i<=$("div.metadata_author_list > div").length;i++){
                    if($('div.metadata_author_list > div:nth-child('+i+') > span.name').text()==""){
                        //名前がありません
                        addIssue('warning',"[Metadata:author] 空の名前が存在しています。");
                        warning_num++;
                    }
                }
            }else{
                // 名前がありません
                addIssue('warning',"[Metadata:author] 名前が入力されていません。");
                warning_num++;
            }
            if($('#metadata_url').val()==""){
                //URLがありません
                addIssue('warning',"[Metadata:url] URLが入力されていません。");
                warning_num++;
            }
            if($('#metadata_license').val()==""){
                //Licenseがありません
                addIssue('warning',"[Metadata:license] ライセンスが入力されていません。");
                warning_num++;
            }
        }
        return warning_num;
    }
    // エラー検査
    function checkJSONError(){
        error_num = 0;
        switch(format_version){
            case 1:
                break;
            case 2:
                if(Number($('#header_min_engine_version_major').val())<=1&&
                Number($('#header_min_engine_version_minor').val())<13){
                    // 1.12以下はエラー
                    addIssue('error',"[Header:min engine version] version1.12以下を指定することはできません。");
                    error_num++;
                };
                if(Number($('#header_base_game_version_major').val())<=1&&
                Number($('#header_base_game_version_minor').val())<13){
                    // 1.12以下はエラー
                    addIssue('error',"[Header:base game version] version1.12以下を指定することはできません。");
                    error_num++;
                };
                break;
        }
        if(!isUUID($('#header_uuid').val())){
            //UUIDではありません
            addIssue('error',"[Header:uuid] 入力されている文字列は有効なUUIDではありません。");
            error_num++;
        }
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            child_num = i + 1;
            if($('div.modules_contents > div:nth-child('+child_num+') #modules_type').val()==null){
                addIssue('error',"[Modules:"+i+":type] typeがnullになっています。typeを選択してください。");
                error_num++;
            }
            if(!isUUID($('div.modules_contents > div:nth-child('+child_num+') #modules_uuid').val())){
                //UUIDではありません
                addIssue('error',"[Modules:"+i+":uuid] 入力されている文字列は有効なUUIDではありません。");
                error_num++;
            }
        }
        if(is_dependencies_enable){
            for(i=0;i<$(".dependencies_controls_tab li").length;i++){
                child_num = i + 1;
                if(!isUUID($('div.dependencies_list > div:nth-child('+child_num+') #dependencies_uuid').val())){
                    //UUIDではありません
                    addIssue('error',"[Dependencies:"+i+":uuid] 入力されている文字列は有効なUUIDではありません。");
                    error_num++;
                }
            }
        }
        return error_num;
    }
    // イシュー更新
    function addIssue(type,issue_content){
        content = '';
        if(type=='warning'){
            content = '<li><img src="img/warning.svg" alt=""><p>'+issue_content+'</p></li>';
        }else if(type=='error'){
            content = '<li><img src="img/error.svg" alt=""><p>'+issue_content+'</p></li>';
        }
        $("ul.issue_list").append(content);
    }
    // UUIDチェック
    function isUUID ( uuid ) {
        let s = "" + uuid;

        s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
        if (s === null) {
        return false;
        }
        return true;
    }
    // jsonデータ取り出し
    function import_data(json_text){
        try{
            json_data = JSON.parse(json_text);
        }catch(e){
            window.alert("有効なjsonではありません");
            console.error("error:"+e)
            return;
        }
        
        if(json_data.format_version!=null){
            $('#format_version').val(json_data.format_version);
        }
        
        if(json_data.header.name!=null){
            $('#header_pack_name').val(json_data.header.name);
        }
        if(json_data.header.description!=null){
            $('#header_description').val(json_data.header.description);
        }
        if(json_data.header.version!=null){
            if(json_data.header.version[0]!=null){
                $('#header_version_major').val(json_data.header.version[0]);
            }
            if(json_data.header.version[1]!=null){
                $('#header_version_minor').val(json_data.header.version[1]);
            }
            if(json_data.header.version[2]!=null){
                $('#header_version_patch').val(json_data.header.version[2]);
            }
        }
        if(json_data.header.min_engine_version!=null){
            if(json_data.header.min_engine_version[0]!=null){
                $('#header_min_engine_version_major').val(json_data.header.min_engine_version[0]);
            }
            if(json_data.header.min_engine_version[1]!=null){
                $('#header_min_engine_version_minor').val(json_data.header.min_engine_version[1]);
            }
            if(json_data.header.min_engine_version[2]!=null){
                $('#header_min_engine_version_patch').val(json_data.header.min_engine_version[2]);
            }
        }
        if(json_data.header.uuid!=null){
            $('#header_uuid').val(json_data.header.uuid);
        }
        if(json_data.header.platform_locked!=null&&json_data.header.platform_locked){
            $('#header_platform_locked').prop("checked",true);
        }
        if(json_data.header.base_game_version!=null){
            if(json_data.header.base_game_version[0]!=null){
                $('#header_base_game_version_major').val(json_data.header.base_game_version[0]);
            }
            if(json_data.header.base_game_version[1]!=null){
                $('#header_base_game_version_minor').val(json_data.header.base_game_version[1]);
            }
            if(json_data.header.base_game_version[2]!=null){
                $('#header_base_game_version_patch').val(json_data.header.base_game_version[2]);
            }
            
        }
        if(json_data.header.lock_template_options!=null&&json_data.header.lock_template_options){
            $('#header_lock_template_options').prop("checked",true);
        }

        if(json_data.modules!=null){
            for(i=0;i<json_data.modules.length;i++){
                child_num = i + 1;
                if(i>0){
                    modules_addtab();
                }
                if(json_data.modules[i].type!=null){
                    $('div.modules_contents > div:nth-child('+child_num+') #modules_type').val(json_data.modules[i].type);
                }
                if(json_data.modules[i].description!=null){
                    $('div.modules_contents > div:nth-child('+child_num+') #modules_description').val(json_data.modules[i].description);
                }
                if(json_data.modules[i].version!=null){
                    if(json_data.modules[i].version[0]!=null){
                        $('div.modules_contents > div:nth-child('+child_num+') #modules_version_major').val(json_data.modules[i].version[0]);
                    }
                    if(json_data.modules[i].version[1]!=null){
                        $('div.modules_contents > div:nth-child('+child_num+') #modules_version_minor').val(json_data.modules[i].version[1]);
                    }
                    if(json_data.modules[i].version[2]!=null){
                        $('div.modules_contents > div:nth-child('+child_num+') #modules_version_patch').val(json_data.modules[i].version[2]);
                    }
                }
                if(json_data.modules[i].uuid!=null){
                    $('div.modules_contents > div:nth-child('+child_num+') #modules_uuid').val(json_data.modules[i].uuid);
                }
            }
        }
        
        
        if(json_data.dependencies!=null){
            $('#dependencies_enable').prop("checked",true);
            for(i=0;i<json_data.dependencies.length;i++){
                child_num = i + 1;
                if(i>0){
                    dependencies_addtab();
                }
                if(json_data.dependencies[i].uuid!=null){
                    $('div.dependencies_list > div:nth-child('+child_num+') #dependencies_uuid').val(json_data.dependencies[i].uuid);
                }
                if(json_data.dependencies[i].version!=null){
                    if(json_data.dependencies[i].version[0]!=null){
                        $('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_major').val(json_data.dependencies[i].version[0]);
                    }
                    if(json_data.dependencies[i].version[1]!=null){
                        $('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_minor').val(json_data.dependencies[i].version[1]);
                    }
                    if(json_data.dependencies[i].version[2]!=null){
                        $('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_patch').val(json_data.dependencies[i].version[2]);
                    }
                }
            }
        }

        if(json_data.capabilities!=null){
            $('#capabilities_enable').prop("checked",true);
            for(capabilities of json_data.capabilities){
                switch(capabilities){
                    case "experimental_custom_ui":
                        $('#experimental_custom_ui').prop("checked",true);
                        break;
                    case "chemistry":
                        $('#chemistry').prop("checked",true);
                        break;
                    case "raytracing":
                        $('#raytracing').prop("checked",true);
                        break;
                    default:
                        break;
                }
            }
        }

        if(json_data.metadata!=null){
            $('#metadata_enable').prop("checked",true);
            if(json_data.metadata.authors!=null){
                for(author of json_data.metadata.authors){
                    add_author(author);
                }
            }
            if(json_data.metadata.url!=null){
                $('#metadata_url').val(json_data.metadata.url);
            }
            if(json_data.metadata.license!=null){
                $('#metadata_license').val(json_data.metadata.license);
            }
        }
        onChangedJSON();
    }
    // json 出力
    function exportJSON(){
        json_raw = new Object();
        json_raw.format_version = format_version;

        json_raw.header = new Object();
        json_raw.header.name = $('#header_pack_name').val();
        json_raw.header.description = $('#header_description').val();
        json_raw.header.version = "replace_header_version";
        if(!is_world_template){
            json_raw.header.min_engine_version = "replace_header_min_engine_version";
        }
        json_raw.header.uuid = $('#header_uuid').val();
        if($('#header_platform_locked').is(':checked')){
            json_raw.header.platform_locked = true;
        }
        if(is_world_template){
            if(format_version>=2){
                json_raw.header.base_game_version = "replace_base_game_version";
            }
            json_raw.header.lock_template_options = $('#header_lock_template_options').is(':checked');
        }

        json_raw.modules = new Array();
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            child_num = i + 1;
            json_raw.modules[i] = new Object();
            json_raw.modules[i].type = $('div.modules_contents > div:nth-child('+child_num+') #modules_type').val();
            json_raw.modules[i].description = $('div.modules_contents > div:nth-child('+child_num+') #modules_description').val();
            json_raw.modules[i].version = "replace_modules_"+i+"_version";
            json_raw.modules[i].uuid = $('div.modules_contents > div:nth-child('+child_num+') #modules_uuid').val();
        }
        if(is_dependencies_enable){
            json_raw.dependencies = new Array();
            for(i=0;i<$(".dependencies_controls_tab li").length;i++){
                child_num = i + 1;
                json_raw.dependencies[i] = new Object();
                json_raw.dependencies[i].uuid = $('div.dependencies_list > div:nth-child('+child_num+') #dependencies_uuid').val();
                json_raw.dependencies[i].version = "replace_dependencies_"+i+"_version";
            }
        }
        if(is_capabilities_enable){
            json_raw.capabilities = new Array();
            if($('#experimental_custom_ui').is(':checked')){
                json_raw.capabilities.push("experimental_custom_ui")
            }
            if($('#chemistry').is(':checked')){
                json_raw.capabilities.push("chemistry")
            }
            if($('#raytracing').is(':checked')){
                json_raw.capabilities.push("raytracing")
            }
        }
        if(is_metadata_enable){
            json_raw.metadata = new Object();
            json_raw.metadata.authors = new Array();
            if($('div.metadata_author_list > div')[0]){
                for(i=1;i<=$("div.metadata_author_list > div").length;i++){
                    json_raw.metadata.authors.push($('div.metadata_author_list > div:nth-child('+i+') > span.name').text());
                }
            }else{
                json_raw.metadata.authors.push("");
            }
            json_raw.metadata.url = $('#metadata_url').val();
            json_raw.metadata.license = $('#metadata_license').val();
        }
        json_string_raw = JSON.stringify(json_raw,null,'  ');
        
        return jsonVersionReplacer(json_string_raw);
    }
    // json バージョン置き換え
    function jsonVersionReplacer(string_raw) {
        header_version = JSON.stringify([
            Number($('#header_version_major').val()), 
            Number($('#header_version_minor').val()), 
            Number($('#header_version_patch').val())
        ]).split(/,/).join(', ');
        min_engine_version = JSON.stringify([
            Number($('#header_min_engine_version_major').val()), 
            Number($('#header_min_engine_version_minor').val()), 
            Number($('#header_min_engine_version_patch').val())
        ]).split(/,/).join(', ');
        header_base_game_version = JSON.stringify([
            Number($('#header_base_game_version_major').val()), 
            Number($('#header_base_game_version_minor').val()), 
            Number($('#header_base_game_version_patch').val())
        ]).split(/,/).join(', ');
        string_raw = string_raw.replace('"replace_header_version"', header_version);
        if(!is_world_template){
            string_raw = string_raw.replace('"replace_header_min_engine_version"', min_engine_version);
        }else{
            string_raw = string_raw.replace('"replace_base_game_version"', header_base_game_version);
        }
        
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            child_num = i + 1;
            modules_version = JSON.stringify([
                Number($('div.modules_contents > div:nth-child('+child_num+') #modules_version_major').val()), 
                Number($('div.modules_contents > div:nth-child('+child_num+') #modules_version_minor').val()), 
                Number($('div.modules_contents > div:nth-child('+child_num+') #modules_version_patch').val())
            ]).split(/,/).join(', ');
            string_raw = string_raw.replace('"replace_modules_'+i+'_version"', modules_version);
        }
        if(is_dependencies_enable){
            for(i=0;i<$(".dependencies_controls_tab li").length;i++){
                child_num = i + 1;
                dependencies_version = JSON.stringify([
                    Number($('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_major').val()),
                    Number($('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_minor').val()),
                    Number($('div.dependencies_list > div:nth-child('+child_num+') #dependencies_version_patch').val())
                ]).split(/,/).join(', ');
                string_raw = string_raw.replace('"replace_dependencies_'+i+'_version"', dependencies_version);
            }
        }
        return string_raw;
    }
})
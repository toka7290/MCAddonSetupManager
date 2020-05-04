$(function(){
    var is_dependencies_enable = false;
    var is_capabilities_enable = false;
    var is_metadata_enable = false;
    onChangedJSON()
    // 変更
    $(document).on("change",'input',function(){
        onChangedJSON();
    });
    $(document).on("change",'textarea',function(){
        onChangedJSON();
    });
    $(document).on("change",'select',function(){
        onChangedJSON();
    });
    // チェックボックス操作
    $('input[type="checkbox"]').change(function(){
        is_dependencies_enable = $('#dependencies_enable').is(':checked');
        is_capabilities_enable = $('#capabilities_enable').is(':checked');
        is_metadata_enable = $('#metadata_enable').is(':checked');
        if(is_dependencies_enable){
            $('div.dependencies_contents input').prop('disabled', false);
            $('span.dependencies_controls_addtab').removeClass('disabled');
        }else{
            $('div.dependencies_contents input').prop('disabled', true);
            $('span.dependencies_controls_addtab').addClass('disabled');
        }
        if(is_capabilities_enable){
            $('div.capabilities_list input').prop('disabled', false);
        }else{
            $('div.capabilities_list input').prop('disabled', true);
        }
        if(is_metadata_enable){
            $('div.metadata_list input').prop('disabled', false);
        }else{
            $('div.metadata_list input').prop('disabled', true);
        }
        onChangedJSON();
    });
    //UUID生成
    $(document).on("click",'input[type="button"]#generate_uuid',function(){
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
        $(".modules_contents > div").eq(selectedindex).remove();
        for(i=0;i<$(".modules_controls_tab li").length;i++){
            $(".modules_controls_tab li").eq(i).html(i+'<span class="delete_tab">×</span>');
        }
        onChangedJSON();
        event.stopPropagation();
    });
    //Modules tab追加
    $(".modules_controls_addtab").on("click",function(){
        num = $(".modules_controls_tab li").length;
        addtab = '<li>'+num+'<span class="delete_tab">×</span></li>';
        $(".modules_controls_tab").append(addtab);
        content = $(".modules_contents > div:first-child").clone();
        content.removeClass('selected_tab_content');
        $(".modules_contents").append(content);
        onChangedJSON();
    });
    //Dependencies tab変更
    $(document).on("click",".dependencies_controls_tab li",function(){
        if(is_dependencies_enable){
            selectedindex = $(".dependencies_controls_tab li").index(this);
            $(".dependencies_controls_tab li").removeClass('selected_tab');
            $(".dependencies_controls_tab li").eq(selectedindex).addClass('selected_tab');
            $(".dependencies_contents > div").removeClass('selected_tab_content');
            $(".dependencies_contents > div").eq(selectedindex).addClass('selected_tab_content');
        }
    });
    // Dependencies tab削除
    $(document).on("click",".dependencies_controls_tab li span.delete_tab",function(event){
        if(is_dependencies_enable){
            selectedindex = $(this).parent().index();
            $(this).parent().remove();
            $(".dependencies_contents > div").eq(selectedindex).remove();
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
            num = $(".dependencies_controls_tab li").length;
            addtab = '<li>'+num+'<span class="delete_tab">×</span></li>';
            $(".dependencies_controls_tab").append(addtab);
            content = $(".dependencies_contents > div:first-child").clone();
            content.removeClass('selected_tab_content');
            $(".dependencies_contents").append(content);
        }
        onChangedJSON();
    });
    //author追加
    $("#metadata_author_add").on("click",function(){
        if(is_metadata_enable){
            author = $("#metadata_author").val();
            author_list_child = '<div><span class="name">'+author+'</span><span class="metadata_remove_author">×</span></div>';
            $(".metadata_author_list").append(author_list_child);
        }
        onChangedJSON();
    });
    //author削除
    $(document).on("click","span.metadata_remove_author",function(){
        if(is_metadata_enable){
            $(this).parent().remove();
        }
        onChangedJSON();
    });
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
    // 更新処理
    function onChangedJSON(){
        checkIssue();
        json_code = exportJSON();
        $("pre.language-json code.language-json").remove();
        content = '<code class="language-json">'+json_code+'</code>';
        $("pre.language-json").append(content)
        Prism.highlightAll();
    }
    // json 出力
    function exportJSON(){
        json_raw = new Object();
        json_raw.format_version = Number($('#format_version').val());

        json_raw.header = new Object();
        json_raw.header.name = $('#header_pack_name').val();
        json_raw.header.description = $('#header_description').val();
        json_raw.header.version = "replace_header_version";
        json_raw.header.min_engine_version = "replace_header_min_engine_version";
        json_raw.header.uuid = $('#header_uuid').val();
        if($('#platform_locked').is(':checked')){
            json_raw.header.platform_locked = true;
        }
        json_raw.header.base_game_version = "replace_base_game_version";
        if($('#lock_template_options').is(':checked')){
            json_raw.header.lock_template_options = true;
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
                json_raw.dependencies[i].uuid = $('div.dependencies_contents > div:nth-child('+child_num+') #dependencies_uuid').val();
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
        string_raw = string_raw.replace('"replace_header_min_engine_version"', min_engine_version);
        string_raw = string_raw.replace('"replace_base_game_version"', header_base_game_version);
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
                    Number($('div.dependencies_contents > div:nth-child('+child_num+') #dependencies_version_major').val()),
                    Number($('div.dependencies_contents > div:nth-child('+child_num+') #dependencies_version_minor').val()),
                    Number($('div.dependencies_contents > div:nth-child('+child_num+') #dependencies_version_patch').val())
                ]).split(/,/).join(', ');
                string_raw = string_raw.replace('"replace_dependencies_'+i+'_version"', dependencies_version);
            }
        }
        return string_raw;
    }
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
    function checkJSONWarning(){
        warning_num = 0;
        // format_version固有
        switch(Number($('#format_version').val())){
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
    function checkJSONError(){
        error_num = 0;
        switch(Number($('#format_version').val())){
            case 1:
                break;
            case 2:
                if(Number($('#header_min_engine_version_major').val())<=1&&
                Number($('#header_min_engine_version_minor').val())<13){
                    // 1.12以下はエラー
                    addIssue('error',"[Header:min engine version] version1.12以下を指定することはできません。");
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
            if(!isUUID($('div.modules_contents > div:nth-child('+child_num+') #modules_uuid').val())){
                //UUIDではありません
                addIssue('error',"[Modules:"+i+":uuid] 入力されている文字列は有効なUUIDではありません。");
                error_num++;
            }
        }
        if(is_dependencies_enable){
            for(i=0;i<$(".dependencies_controls_tab li").length;i++){
                child_num = i + 1;
                if(!isUUID($('div.dependencies_contents > div:nth-child('+child_num+') #dependencies_uuid').val())){
                    //UUIDではありません
                    addIssue('error',"[Dependencies:"+i+":uuid] 入力されている文字列は有効なUUIDではありません。");
                    error_num++;
                }
            }
        }
        return error_num;
    }
    function isUUID ( uuid ) {
        let s = "" + uuid;

        s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
        if (s === null) {
        return false;
        }
        return true;
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
});
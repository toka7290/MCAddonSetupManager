$(function(){
    var is_dependencies_enable = false;
    var is_capabilities_enable = false;
    var is_metadata_enable = false;
    onChangedJSON()
    // 変更
    $('input').change(function(){
       onChangedJSON();
    });
    $('textarea').change(function(){
       onChangedJSON();
    });
    $('select').change(function(){
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
    });
    //UUID生成
    $(document).on("click",'input[type="button"]#generate_uuid',function(){
        $(this).prev().val(getUuid_v4);
    });
    //author追加
    $("#metadata_author_add").on("click",function(){
        if(is_metadata_enable){
            author = $("#metadata_author").val();
            author_list_child = '<div><span class="name">'+author+'</span><span class="metadata_remove_author">×</span></div>';
            $(".metadata_author_list").append(author_list_child);
        }
    });
    //author削除
    $(document).on("click","span.metadata_remove_author",function(){
        if(is_metadata_enable){
            $(this).parent().remove();
        }
    });
    //Modules tab変更
    $(document).on("click",".modules_controls_tab li",function(){
        selectedindex = $(".modules_controls_tab li").index(this);
        console.log(selectedindex);
        $(".modules_controls_tab li").removeClass('selected_tab');
        $(".modules_controls_tab li").eq(selectedindex).addClass('selected_tab');
        $(".modules_contents > div").removeClass('selected_tab_content');
        $(".modules_contents > div").eq(selectedindex).addClass('selected_tab_content');
    });
    //Modules tab追加
    $(".modules_controls_addtab").on("click",function(){
        num = $(".modules_controls_tab li").length;
        addtab = '<li>'+num,+'</li>';
        $(".modules_controls_tab").append(addtab);
        content = $(".modules_contents > div:first-child").clone();
        content.removeClass('selected_tab_content');
        $(".modules_contents").append(content);
    });
    //Dependencies tab変更
    $(document).on("click",".dependencies_controls_tab li",function(){
        selectedindex = $(".dependencies_controls_tab li").index(this);
        console.log(selectedindex);
        $(".dependencies_controls_tab li").removeClass('selected_tab');
        $(".dependencies_controls_tab li").eq(selectedindex).addClass('selected_tab');
        $(".dependencies_contents > div").removeClass('selected_tab_content');
        $(".dependencies_contents > div").eq(selectedindex).addClass('selected_tab_content');
    });
    //Dependencies tab追加
    $(".dependencies_controls_addtab").on("click",function(){
        if(is_dependencies_enable){
            num = $(".dependencies_controls_tab li").length;
            addtab = '<li>'+num,+'</li>';
            $(".dependencies_controls_tab").append(addtab);
            content = $(".dependencies_contents > div:first-child").clone();
            content.removeClass('selected_tab_content');
            $(".dependencies_contents").append(content);
        }
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
    function onChangedJSON(){
        loop = 1;
        var json_modules = [{
            "type": $('div.modules_contents > div:nth-child('+loop+') #modules_type').val(),
            "description": $('div.modules_contents > div:nth-child('+loop+') #modules_description').val(),
            "version": [
                Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_major').val()), 
                Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_minor').val()), 
                Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_patch').val())
            ],
            "uuid": $('div.modules_contents > div:nth-child('+loop+') #modules_uuid').val()
        }];
        while(loop != $(".modules_controls_tab li").length){
            loop++;
            json_modules.push({
                "type": $('div.modules_contents > div:nth-child('+loop+') #modules_type').val(),
                "description": $('div.modules_contents > div:nth-child('+loop+') #modules_description').val(),
                "version": [
                    Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_major').val()), 
                    Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_minor').val()), 
                    Number($('div.modules_contents > div:nth-child('+loop+') #modules_version_patch').val())
                ],
                "uuid": $('div.modules_contents > div:nth-child('+loop+') #modules_uuid').val()
            });
        }
        json = {
            "format_version": Number($('#format_version').val()),
            "header":{
                "name": $('#header_pack_name').val(),
                "description": $('#header_description').val(),
                "version": [
                    Number($('#header_version_major').val()), 
                    Number($('#header_version_minor').val()), 
                    Number($('#header_version_patch').val())
                ],
                "min_engine_version": [
                    Number($('#header_min_engine_version_major').val()), 
                    Number($('#header_min_engine_version_minor').val()), 
                    Number($('#header_min_engine_version_patch').val())
                ],
                "uuid": $('#header_uuid').val(),
                "platform_locked" : false
            },
            "modules": json_modules
        };
        if(is_dependencies_enable){
            json.dependencies = new Array();
            loop = 1;
            json.dependencies.push({
                "uuid": $('div.dependencies_contents > div:nth-child('+loop+') #dependencies_uuid').val(),
                "version": [
                    Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_major').val()),
                    Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_minor').val()),
                    Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_patch').val())
                ]
            });
            while(loop != $(".dependencies_controls_tab li").length){
                loop++;
                json.dependencies.push({
                    "uuid": $('div.dependencies_contents > div:nth-child('+loop+') #dependencies_uuid').val(),
                    "version": [
                        Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_major').val()),
                        Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_minor').val()),
                        Number($('div.dependencies_contents > div:nth-child('+loop+') #dependencies_version_patch').val())
                    ]
                });
            }
        }
        if(is_capabilities_enable){
            json.capabilities = new Array();
            if($('#experimental_custom_ui').is(':checked')){
                json.capabilities.push("experimental_custom_ui")
            }
            if($('#chemistry').is(':checked')){
                json.capabilities.push("chemistry")
            }
            if($('#raytracing').is(':checked')){
                json.capabilities.push("raytracing")
            }
        }
        if(is_metadata_enable){
            json.metadata = new Object();
            loop = 1;
            json.metadata.authors = new Array();
            if($('div.metadata_author_list > div:nth-child('+loop+') > span.name')[0]){
                json.metadata.authors.push($('div.metadata_author_list > div:nth-child('+loop+') > span.name').text());
                while(loop != $("div.metadata_author_list > div").length){
                    loop++;
                    json.metadata.authors.push($('div.metadata_author_list > div:nth-child('+loop+') > span.name').text());
                }
            }else{
                json.metadata.authors.push("");
            }
            json.metadata.url = $('#metadata_url').val();
            json.metadata.license = $('#metadata_license').val();
        }
        json_code = JSON.stringify(json,null,'  ')
        $("pre.language-json code.language-json", parent.document).remove();
        content = '<code class="language-json">'+json_code+'</code>';
        $("pre.language-json", parent.document).append(content)
        Prism.highlightAll();
    }
});
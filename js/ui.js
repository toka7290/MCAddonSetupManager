$(function(){
    var is_separator_drag = false;
    $(".separator").on("mousedown",function(e){
        if(!is_separator_drag){
            is_separator_drag = true;

        }else if(is_separator_drag){
            is_separator_drag = false;
        }
    });
    $(document).on("mouseup",function(){
        is_separator_drag = false;
        $("html").css("cursor","auto");
        $(".separator").prev().removeClass('drag_lock');
        $(".separator").next().removeClass('drag_lock');
    });
    function separatorMove(ev){
        if(is_separator_drag){
            $("html").css("cursor","e-resize");
            $(".separator").prev().addClass('drag_lock');
            $(".separator").next().addClass('drag_lock');
            var maxwidth = $("html").width()-5;
            var nextwidth = maxwidth-ev.clientX;
            var prevwidth = maxwidth-nextwidth;
            $(".separator").prev().css("flex-basis",prevwidth);
            $(".separator").next().css("flex-basis",nextwidth);
        }
    };
    $(window).on("mousemove",separatorMove);
    // プレビュー表示切替
    $("p#show_preview").on("click",function(){
        $("div.preview").slideToggle();
        if($("p#show_preview").attr("class")=="active"){
            $("p#show_preview").removeClass('active');
        }else{
            $("p#show_preview").addClass('active');
        }
    });
    $(window).resize(function(){
        $("div.preview").css('display', '')
    });
    // about開く
    $("p#open_about").on("click",function(){
        $("div.page_about").fadeIn();
    });
    // about閉じる
    $("div.close_about").on("click",function(){
        $("div.page_about").fadeOut();
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
});
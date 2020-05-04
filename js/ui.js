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
        $(".separator").prev().css("user-select","auto");
        $(".separator").next().css("user-select","auto");
    });
    function separatorMove(ev){
        if(is_separator_drag){
            $("html").css("cursor","e-resize");
            $(".separator").prev().css("user-select","none");
            $(".separator").next().css("user-select","none");
            var maxwidth = $("html").width()-5;
            var nextwidth = maxwidth-ev.clientX;
            var prevwidth = maxwidth-nextwidth;
            $(".separator").prev().width(prevwidth);
            $(".separator").next().width(nextwidth);
        }
    };
    $(window).on("mousemove",separatorMove);
    $('iframe').on('load', function () {
        $(this).contents().on("mousemove",separatorMove);
    });
    // イシュー開閉
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
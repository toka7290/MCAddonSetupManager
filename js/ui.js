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
        $('iframe').css("pointer-events","auto");
    });
    function separatorMove(ev){
        if(is_separator_drag){
            $("html").css("cursor","e-resize");
            $('iframe').css("pointer-events","none");
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
});
$(function(){
    //tab変更
    $(document).on("click",".modules_controls_tab li",function(){
        selectedindex = $(".modules_controls_tab li").index(this);
        console.log(selectedindex);
        $(".modules_controls_tab li").removeClass('selected_tab');
        $(".modules_controls_tab li").eq(selectedindex).addClass('selected_tab');
        $(".modules_contents > div").removeClass('selected_tab_content');
        $(".modules_contents > div").eq(selectedindex).addClass('selected_tab_content');
    });
    //tab追加
    $(".modules_controls_addtab").on("click",function(){
        num = $(".modules_controls_tab li").length;
        addtab = '<li>'+num,+'</li>';
        $(".modules_controls_tab").append(addtab);
        content = $(".modules_contents > div:first-child").clone();
        content.removeClass('selected_tab');
        $(".modules_contents").append(content);
    });
});
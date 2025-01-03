window.addEventListener('load', function(){
  
const ham = document.querySelector('#open-menu');
const nav = document.querySelector('#sp-menu');

ham.addEventListener('click', function () {

  ham.classList.toggle('open');
  nav.classList.toggle('open');

});

  let accordionDetails = '.js-accordion';
    let accordionSummary = '.js-accordion__title';
    let accordionContent = '.js-accordion__content';
    let speed = 400;

    $(accordionSummary).each(function (){
        $(this).on("click",function (event){
            event.preventDefault();
            if($(this).parent($(accordionDetails)).attr("open")){
                $(this).nextAll($(accordionContent)).slideUp(speed,function (){
                    $(this).parent($(accordionDetails)).removeAttr("open");
                    $(this).show();
                });
            }else{
                $(this).parent($(accordionDetails)).attr("open","true");
                $(this).nextAll($(accordionContent)).hide().slideDown(speed);
            }
        });
});
  
})
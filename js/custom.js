// $(document).ready(function(){
// window.setInterval(function(){
//     var hotauctions = $('.hotauctions');
//   var scheduledauctions = $('.scheduledauctions');
//   var todayauctions = $('.todayauctions');
//     hotauctions.owlCarousel({
//         loop:true,
//         dots:false,
//         margin:10,
//         autoplay:true,
//         autoplayTimeout:2000,
//         autoplayHoverPause:true,
//         nav:false,
//         responsive:{
//             0:{
//                 items:1,
//             },
//             600:{
//                 items:3,
//             },
//             1000:{
//                 items:4,
//                 loop:false
//             }
//         }
//     });
//     scheduledauctions.owlCarousel({
//         loop:true,
//         margin:10,
//         dots:false,
//         autoplay:true,
//         autoplayTimeout:3000,
//         autoplayHoverPause:true,
//         nav:false,
//         responsive:{
//             0:{
//                 items:1,
//             },
//             600:{
//                 items:3,
//             },
//             1000:{
//                 items:4,
//                 loop:false
//             }
//         }
//     });
//     todayauctions.owlCarousel({
//         loop:true,
//         dots:false,
//         margin:10,
//         autoplay:true,
//         autoplayTimeout:4000,
//         autoplayHoverPause:true,
//         nav:false,
//         responsive:{
//             0:{
//                 items:1,
//             },
//             600:{
//                 items:3,
//             },
//             1000:{
//                 items:4,
//                 loop:false
//             }
//         }
//     });
//     $('.play').on('click',function(){
//         hotauctions.trigger('autoplay.play.hotauctions',[2000])
//         scheduledauctions.trigger('autoplay.play.scheduledauctions',[3000])
//         todayauctions.trigger('autoplay.play.todayauctions',[4000])
//     });
//     $('.stop').on('click',function(){
//         hotauctions.trigger('autoplay.stop.hotauctions')
//         scheduledauctions.trigger('autoplay.stop.scheduledauctions')
//         todayauctions.trigger('autoplay.stop.todayauctions')
//     });
//       /// call your function here
// }, 1000);


// });

$(document).ready(function() {
    $(window).scroll(function() {
      if($(document).scrollTop()==0){
        $('.header-inner').show();
        $('#header').css('min-height',"70px");  
        $('#sidebar').css('top',"100px");  
      }else{
        $('.header-inner').hide();
        $('#header').css('min-height',"45px");
        $('#sidebar').css('top',"49px");  
      }      
    });
});
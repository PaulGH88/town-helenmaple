/*-----------------------------------------------------------------------------------

	Theme Name: The Town of Delafield - Wisconsin
	Front-end developer: Suman Shrestha
	Author Design: Matt Hicks
	Author URI: https://www.revize.com/
	Date: 12/06/2024

-----------------------------------------------------------------------------------*/
function RZRenderMini(elementList) {
	// slider

	if (typeof tns !== "undefined") {
		$('.mini-events-list').each(function (i, el) {
			var $el = $(el);
			var tinyItemCount = $el.children().length;
			tns({
				loop: false,
				container: el,
				items: 4,
				preventScrollOnTouch: 'force',
				gutter: 24,
				speed: 600,
				nav: false,
				controlsText: [
					'<img src="_assets_/images/angle-left.png" alt="angle left">',
					'<img src="_assets_/images/angle-right.png" alt="angle right">'
				],
				controlsContainer: '.events-controls',
				responsive: {
					992: {
						items: (tinyItemCount >= 4 ? 4 : tinyItemCount)
					},
					767: {
						items: (tinyItemCount >= 3 ? 3 : tinyItemCount)
					},
					480: {
						items : (tinyItemCount >= 2 ? 2 : tinyItemCount)
					},
					0: {
						items : 1
					}
				},
				gutter: 24
			});
		});

		// $('.cal-content').matchHeight()
	}
}


(function($) {

	'use strict';

	var $window = $(window),
	$body = $('body'),
	$html = $('html'),
	$rzBarWrap = $('#rz-bar-wrap'),
	$rzBtnsContainer = $('.rz-btns-container');

	// RZ Class + remove revize bar
	if(typeof RZ !== "undefined"){
		if(RZ.login){
			$body.addClass("user-logged-in");
		} else{
			$body.addClass("user-not-logged-in");
		}
	}
	
	// needed for revize bar
	$('[data-toggle="tooltip"]').tooltip({trigger:"hover"})
	
	//make menu Mega
	$("#nav>li>ul").filter(function () {
		return $(this).find('li').length >= 8
	}).addClass("make-mage").parent().addClass("static");

	$(window).on("scroll", function() {
		if($(window).scrollTop() > 0) {
			$(".sticky-header").addClass("sticky-top");
		} else {
			//remove the background property so it comes transparent again (defined in your css)
		   $(".sticky-header").removeClass("sticky-top");
		}
	});
	
	// Keyboard Navigation: Nav, flyout
	var isClick = false;
	$("#nav li a, #flyout  li a, a, button, .toggle, .toggle2").on('focusin', function(e) {
		if( isClick === false ) {
			$(".focused").removeClass("focused");
			$(e.currentTarget).parents("#nav li, #flyout li").addClass("focused");
			$(".opened:not(.focused) ul:visible,.opened2:not(.focused) ul:visible").slideUp().parent().removeClass("opened opened2");
		} else {
			$(".focused").removeClass("focused");
			isClick = false;
		}
	});

	// for revize buttons container
	$rzBtnsContainer.each(function(){
		var $container = $(this);
		if($container.html().trim()!=""){
			$container.closest(".has-edit-buttons").addClass('yes-has-edit-buttons');
		}
	});
	$(".has-edit-buttons").not(".yes-has-edit-buttons").removeClass("has-edit-buttons");

	// responsive views from revize bar 
	var urlParams = new URLSearchParams(window.location.search); //get all parameters
	var hidebar = urlParams.get('hidebar'); //extract the hidebar parameter - this will return NULL if hidebar isn't a parameter
	
	if(hidebar) { //check if hidebar parameter is set to anything
		$body.removeClass("user-logged-in").addClass("hide-edit-btns");
	}
		
	// prevent focused class changes on click - This way arrows wont pop when clicking nav links
	$("#nav a, #flyout a").on('mousedown',function(){
		isClick = true;
	});

	// Info Toggle
	$('#info-toggle').on('click',function(e){
		$('.headerTop').stop().slideToggle(200);
		$(this).toggleClass('fa-search fa-close');
	});

	// Search Toggle
	$('#search-toggle').on('click',function(e){
		$('#search').stop().slideToggle(200);
		$(this).toggleClass('fa-search fa-close');
	});

	// Navigation Toggle
	$("#nav-toggle").on("click", function(){
		$("#nav").stop().slideToggle();
		$(this).toggleClass("fa-bars fa-close");
	});

	// Menu Arrows and Toggles
	$("#nav >li>ul,#flyout >li>ul").addClass('first-level');
	$("#nav li ul ul").addClass('second-level');
	$("#nav>li:has(ul)").each(function(){
		$('<a href="#" class="fa fa-angle-down toggle" tabindex="0" aria-haspopup="true" aria-expanded="false" id="dropdown-toggle-'+$(this).index()+'" aria-label="Show Dropdown for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'dropdown-toggle-'+$(this).index());
	});
	$('#nav li ul>li:has(ul), #nav li ul>li:has(ul)').each(function(index) {
		$('<a href="#" class="fa fa-angle-down toggle2" tabindex="0" aria-haspopup="true" aria-expanded="false" id="sub-dropdown-toggle-'+index+'" aria-label="Show Dropdown for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'sub-dropdown-toggle-'+index);
	});
	$('#flyout >li:has(ul)').each(function() {
		$('<a href="#" class="fa fa-angle-down toggle" tabindex="0" aria-haspopup="true" aria-expanded="false" id="flyout-dropdown-toggle-'+$(this).index()+'" aria-label="Show Flyout for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'flyout-dropdown-toggle-'+$(this).index());
	});

	function addNavClass() {
		if ($window.width() < 992) {
			// Insert needed for mobile
		} else{
			// Insert needed for desktop
			$('#nav ul, #flyout ul').css('display', '');
		}
	}
	addNavClass();
	$window.resize(addNavClass);

	$(".toggle").on("click keydown",function(e) {
		if (e.keyCode === 13 || e.type === 'click') {
			e.preventDefault();
			var $parent = $(this).parent();
			var $parentLi = $parent.parent();
			$parent.toggleClass('opened');
			if($parent.addClass('active') && $(this).next('.first-level').is(":visible")){
				$(this).next('.first-level').slideUp();
				$parent.removeClass('active');
				$(this).attr({'aria-expanded': 'false'});
			} else {
				$(this).attr({'aria-expanded': 'true'});
				$(".first-level").slideUp("slow");
				$parent.addClass('active');
				$(this).next('.first-level').slideToggle();
			}
		}
	});
	$(".toggle2").on("click keydown",function(e) {
		if (e.keyCode === 13 || e.type === 'click') {
			e.preventDefault();
			var $parent = $(this).parent();
			var $parentLi = $parent.parent();
			$parent.toggleClass('opened2');
			if($parent.addClass('active') && $(this).next('.second-level').is(":visible")){
				$(this).next('.second-level').slideUp();
				$parent.removeClass('active');
				$(this).attr({'aria-expanded': 'false'});
			} else {
				$(this).attr({'aria-expanded': 'true'});
				$(".second-level").slideUp("slow");
				$parent.addClass('active');
				$(this).next('.second-level').slideToggle();
			}
		}
	});

	// close nav if left
	$(".desktop *").focus(function(e){
		var $opened = $(".opened");
		var $opened2 = $(".opened2");
		if( $opened.length > 0 || $opened2.length > 0 ) {
			if( $(".opened :focus").length < 1 ){
				$opened.children("ul").slideUp();
				$opened.removeClass("opened");
				$(".opened2").removeClass("opened2");
			}
			if( $(".opened2 :focus").length < 1 ){
				$opened2.children("ul").slideUp();
				$opened2.removeClass("opened2");
			}
		}
	});

	// Flyout
	var flyout = $('#flyout'),
		flyoutwrap = $('#flyout-wrap');

	if (flyout.text().length){
		flyoutwrap.prepend('<div id="flyout-toggle" class="hidden-lg hidden-md"><i class="fa fa-bars"></i> Related Pages</div>');
	}

	$("#flyout-toggle").on("click", function(){
		flyout.slideToggle();
		$(this).toggleClass("active");
	});


	// fillside
	function fillSide(){
		$('.fillRight').each(function(){
			var cContainer = parseFloat($(this).closest('.container').css('margin-right')) + 15;
			console.log('fillright', cContainer)
			$('.fillRight').css('margin-right',-cContainer);
			$('.fillRight.withPadding').css('padding-right',cContainer);
		});
		$('.fillLeft').each(function(){
			var cContainer = parseFloat($(this).closest('.container').css('margin-left')) + 15;
			console.log('fillleft', cContainer)
			$('.fillLeft').css('margin-left',-cContainer);
			$('.fillLeft.withPadding').css('padding-left',cContainer);
		});
	}


	fillSide();
	$window.resize(fillSide);

	/*
	* E-Notify Auto submit
	*/
	$.urlParam=function(n){var e=new RegExp("[?&]"+n+"=([^]*)").exec(window.location.href);return null==e?null:e[1]||0};
	var $enotify = $('iframe[src*="/revize/plugins/notify/notify.jsp"]');
	if( $enotify.length > 0 ){
		var emailStr = $.urlParam("email");
		if( emailStr != null ){
			$enotify.attr("src", $enotify.attr("src") + "&email=" + emailStr);
		}
	}

	// Make sure all calendars have unique ids
	$('iframe[name="calendar"]').each(function (index, calendar) {
		calendar.id = 'calendar-' + index;
	});

	// Start Frame Resizer
	function resizeIframe(height, frameElement) {
		if ( frameElement ) {
			frameElement.height = "";
			frameElement.height = height;
		}
	}

	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventHandler = window[eventMethod];
	var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
	eventHandler(messageEvent, function (e) {
		if ( Array.isArray(e.data) ) {
			if( e.data[0] === "setCalHeight" || e.data[0] === "setNotifyHeight") {
				var frames = document.querySelectorAll('iframe');
				for( var i = 0; i < frames.length; i++ ) {
					if( frames[i].contentWindow === e.source ){
						resizeIframe(e.data[1], frames[i]);
					}
				}
			}
		}
	});
	// End Frame Resizer

	// Alert Close Caching
	if ($("div.alert").length) {
		var hide = window.sessionStorage && parseInt(window.sessionStorage.getItem("alertClosed")) > 1;
		if (!hide || $(".user-logged-in").length != 0) {
			$("div.alert").addClass('show');
		}
		$("div.alert .close-alert").on('click', function(e) {
			if (window.sessionStorage) {
				window.sessionStorage.setItem("alertClosed",parseInt(window.sessionStorage.getItem("alertClosed")||0)+1);
			}
		});
	}

	$(document).ready(function() {
		$('.langBtn').click(function() {
			$('.langIn').slideToggle(); // jQuery's slideToggle effect
		});
	});


	var $translateButton = $('#translate-button');
		$translateButton.on('keydown click', function(e){
		if (e.keyCode === 13 || e.type === 'click') {
			$('#translation-links ul').stop().fadeToggle();
			$translateButton.attr('aria-expanded', !('true' === $translateButton.attr('aria-expanded')));
		}
	});

	$('#translation-links ul').on('mouseleave',function(){
		$(this).fadeOut();
		$translateButton.attr('aria-expanded', false);
	});

	function removeCookieString(value, domain) {
	domain = domain ? 'domain='+domain+'; ' : '';
	return value+'; expires=Thu, 01 Jan 1970 00:00:01 GMT; '+domain+'path=/';
	}

	function unsetGoogtransCookie() {
	for (var domains = window.location.hostname.split('.'); domains.length >= 2; domains.shift()) {
		var cookieString = removeCookieString('googtrans=unset', domains.join('.'));
		document.cookie=cookieString;
		if  (domains.length === 2) {
			cookieString = removeCookieString('googtrans=unset', '.'+domains.join('.'));
			document.cookie=cookieString;
		}
	}
	document.cookie=removeCookieString('googtrans=unset');
	}

	if (document.cookie.split(';').some(function(item) { return item.trim().startsWith('googtrans=/auto/en'); })) {
	unsetGoogtransCookie();
	}

	// Translate Script
	var translateURL = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
	$.getScript(translateURL);
	$('#translation-links a').click(function() {
	var lang = $(this).data('lang');
	var $frame = $('iframe.skiptranslate');
	if (!$frame.length) {
		return false;
	}
	var $el = $frame.contents().find('span.text:contains(' + lang + ')').parent().parent().get(0);

	if (!$el) {
		$frame.contents().find('span.text:contains("English")').parent().parent().get(0);
	}
	$el.click();
	return false;
	});

	var $translateReset = $('#translate-reset');
	$translateReset.on('keydown click', function(e){

	if (e.keyCode === 13 || e.type === 'click') {
		$('iframe.skiptranslate').contents().find('span.text:contains("English")').parent().parent().get(0).click();
	}
	});

	//SKIP TO MAIN CONTENT
	$(document).ready(function(){
		$('#skip').click(function(){
		$("html, body").animate({ scrollTop: $('#main').offset().top-100 }, 1000);
		return false;
		});
	}); 

	// Tiny Slider
	if (typeof tns !== "undefined") {
		$('.tiny-slider').each(function(i, el) {
			tns({
				autoplay: true,
				autoplayTimeout: 8000,
				container: el,
				items: 1,
				lazyload: true,
				lazyloadSelector: '.tns-lazy-img', // accompanied with data src or data-style
				mode: "gallery",
				nav: true,
				speed : 3000,
				touch:false,
				preventScrollOnTouch: 'force',
				autoplayButtonOutput: false,
				controlsText: ['<i class="left"></i>','<i class="right" aria-hidden="true"></i>'],
				loop: true
			});
		});

		$('#qlinks .tiny-carousel').each(function(i, el) {
			var $el = $(el);
			var tinyItemCount = $el.children().length;
			var tinyItemData = $el.data('tinyItems') ? $el.data('tinyItems') : 5;
			tns({
				container: el,
				items: Math.min(tinyItemCount, tinyItemData),
				lazyload: true,
				nav: false,
				lazyloadSelector: '.tns-lazy-img', // accompanied with data src or data-style
				preventScrollOnTouch: 'force',
				touch:false,
				controlsText: ['<i class="left"></i>','<i class="right" aria-hidden="true"></i>'],
				loop: false,
				responsive:{
					1400:{
						items: 5
					},
					1199:{
						items: 5
					},
					991:{
						items: 3
					},
					767:{
						items: 3
					},
					479:{
						items: 2
					},
					0:{
						items: 1
					}
				}
			});
		});

		$('#news .tiny-carousel').each(function(i, el) {
			var $el = $(el);
			var tinyItemCount = $el.children().length;
			var tinyItemData = $el.data('tinyItems') ? $el.data('tinyItems') : 3;
			tns({
				container: el,
				items: Math.min(tinyItemCount, tinyItemData),
				lazyload: true,
				nav: false,
				lazyloadSelector: '.tns-lazy-img', // accompanied with data src or data-style
				preventScrollOnTouch: 'force',
				touch:false,
				controlsText: ['<i class="left"></i>','<i class="right" aria-hidden="true"></i>'],
				loop: false,
				responsive:{
					1400:{
						items: 3
					},
					1199:{
						items: 3
					},
					991:{
						items: 3
					},
					767:{
						items: 3
					},
					479:{
						items: 2
					},
					0:{
						items: 1
					}
				}
			});
		});
	}

	$window.ready(function(){
	
		// Video for slider
		if(typeof $.fn.YTPlayer !== "undefined" && $('body').attr('id') == 'homepage'){
		    $("#sliderVideo").YTPlayer();
	    }

		// hide hero slider control when video will be play
		var interval = setInterval(hideControl,1000);
		function hideControl(){
			var videoId = document.getElementById('wrapper_sliderVideo');
			if(videoId){
				if(videoId.style.opacity == '1'){
				clearInterval(interval);
				$('#slider .tns-controls button').hide();
				}else{
					$('#slider .tns-controls button').show();
				}
			}
		}
		
	});

	$('#news .tns-controls').appendTo('.titleCol');

	$("#flyout-wrap").each(function () {
	if ($(this).find("h2").is(":empty") && $(this).find("ul#flyout").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #flyout-wrap").each(function () {
		if ($(".user-not-logged-in #flyout-wrap ul#flyout").text().trim() === "") {
			$(this).hide();
		}
	});

	// Contact 
	$("#contact-wrap").each(function () {
	if ($(this).find("h2").is(":empty") && $(this).find("#contact-name").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #contact-wrap").each(function () {
		if ($(".user-not-logged-in #contact-wrap #contact-name").text().trim() === "") {
			$(this).hide();
		}
	});

	// Hours
	$("#hr-wrap").each(function () {
	if ($(this).find("h2").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #hr-wrap").each(function () {
		if ($(".user-not-logged-in #hr-wrap .hrBx").text().trim() === "") {
			$(this).hide();
		}
	});

	// Resources
	$("#resource-wrap").each(function () {
	if ($(this).find("h2").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #resource-wrap").each(function () {
		if ($(".user-not-logged-in #resource-wrap .resourceBx").text().trim() === "") {
			$(this).hide();
		}
	});

	// Follow
	$("#follow-wrap").each(function () {
	if ($(this).find("h2").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #follow-wrap").each(function () {
		if ($(".user-not-logged-in #follow-wrap h2").text().trim() === "") {
			$(this).hide();
		}
	});
	
	// Featured Wrap
	$("#featured-wrap").each(function () {
	if ($(this).find("h2").is(":empty")) {
		$(this).hide();  // Hide if both are empty
	} else {
		$(this).show();  // Show if either or both are not empty
	}
	});

	$(".user-not-logged-in #featured-wrap").each(function () {
		if ($(".user-not-logged-in #featured-wrap .featInfo").text().trim() === "") {
			$(this).hide();
		}
	});

	// nav mega menu
	$('#nav').addClass('mega');
	$('#nav>li.static>ul').prepend('<div id="divider"><span class="divider"></span><span class="divider"></span></div>')

	$(".site-header #nav>li.children").addClass("static");
	$(".site-header #nav>li>ul.first-level").addClass("make-mage");

	// Responsive Tables
	$('.post table:not(.layout-table):not(.not-responsive)').wrap('<div class="table-responsive"></div>');
	$('.layout-table').attr('role', 'presentation');


	// Header
	if (!$('.headerBtm #nav li .nav-in').length) {
		$('.headerBtm .first-level').wrapInner('<div class="nav-in"></div>');
	}

	var matchMediaQuery = window.matchMedia("(min-width: 992px)");
	
	function manageHeader(matchMediaQuery) {
		if (matchMediaQuery.matches) {
			$('#nav>li').hover(
				function(){
					var navIn = $(this).find('.nav-in');
					var firstLevel = $(this).find('.first-level');
					var point = 600;
						
					if (navIn.height() > point) {
						firstLevel.css({
							height: point,
							'overflow-y': 'auto',
							'overscroll-behavior': 'contain'
						});
					}
				},
				function(){
					$(this).find('.first-level').css({
						height: 'auto',
						'overflow-y': 'visible'
					})
				}
			);
		} else {
			$('#nav>li').unbind('mouseenter mouseleave');
			$('ul.first-level').css('height', 'auto');
		}
	}

	manageHeader(matchMediaQuery);
	matchMediaQuery.addListener(manageHeader);

	// Preloader
	$window.on('load', function() {

		setTimeout(function(){
			$body.addClass('loaded');
			 $('#loader-wrapper').fadeOut();
		}, 600);

	});

	$('.adaBtn').on('click', function(){
		$('.uai').click();
	})

	// matchHeight
	if(typeof $.fn.matchHeight !== "undefined"){
		$('.equal').matchHeight({
			//defaults
			byRow: true,
			property: 'height', // height or min-height
			target: null,
			remove: false
		});
		$('#news .newsBlock .txt').matchHeight({byRow: false});
		$('#news .newsPill .info').matchHeight({byRow: false});
		// $('#news .newsBlock h3.title').matchHeight({byRow: false});
	}	

	$('#search-toggle-desktop').click(function(e){
		e.preventDefault();
		$('#search').stop().fadeToggle();
		$(this).find('i').toggleClass('fa-search fa-close')
	})

	$window.ready(function(){

		//#Smooth Scrolling
		$('a[href*="#"]').not('[href="#"]').not('[href*="#collapse"]').not('a.faq-header').click(function(event) {
			if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
				if (target.length) {
					event.preventDefault();
					$('html,body').animate({
						scrollTop: target.offset().top
					}, 1000, function() {
						var $target = $(target);
						$target.focus();
						if ($target.is(":focus")) {
							return false;
						} else {
							$target.attr('tabindex','-1');
							$target.focus();
							$target.removeAttr('tabindex');
						};
					});
				}
			}
		});

	}); // Ready
	// ADA
	var labels = {
		'goog-gt-votingInputSrcLang': 'Source Language:',
		'goog-gt-votingInputTrgLang': 'Target Language:',
		'goog-gt-votingInputSrcText': 'Source Text:',
		'goog-gt-votingInputTrgText': 'Translated Text:',
		'goog-gt-votingInputVote': 'Vote:'
	};

	function addLabels() {
		$.each(labels, function(id, text) {
			var input = $('#' + id);
			if (input.length && !input.prev('label').length) {
				var label = $('<label>').attr('for', id).text(text);
				input.before(label);
			}
		});
	}

	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.addedNodes.length) {
				addLabels();
			}
		});
	});

	var config = { childList: true, subtree: true };

	observer.observe(document.body, config);

	addLabels();

	// ADA rz-bar ( for empty alt )
	$('#rz-bar-wrap a img').each(function() {
		var src = $(this).attr('src');
		var fileName = src.split('/').pop().split('.')[0];
		var altText = fileName.replace(/[_-]/g, ' ') + ' icon';
		$(this).attr('alt', altText);
	});

})(jQuery);

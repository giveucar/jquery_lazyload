
(function($, window, document, undefined) {
	var $window = $(window);
	var debounce = function(callback, timeout){
		var debounceTimer;
		return function(){
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(callback, timeout);
		};
	};
	$.fn.lazyload = function(options) {
		var elements = this;
		var $container;
		var settings = {
			threshold	   : 0,
			failure_limit   : 0,
			event		   : "scroll",
			effect		  : "fadeIn",
			container	   : window,
			data_attribute  : "src",
			skip_invisible  : false,
			appear		  : null,
			load			: null,
			debounce		: 300,
			placeholder	 : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#006FC1"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite"/></path></svg>'
		};
		function update() {
			var counter = 0;
			elements.each(function() {
				var $this = $(this);
				if (settings.skip_invisible && !$this.is(":visible")) {
					return;
				}
				if ($.abovethetop(this, settings) ||
					$.leftofbegin(this, settings)) {
				} else if (!$.belowthefold(this, settings) &&
					!$.rightoffold(this, settings)) {
						$this.trigger("appear");
						counter = 0;
				} else {
					if (++counter > settings.failure_limit) {
						return false;
					}
				}
			});
		}
		if(options) {
			$.extend(settings, options);
		}
		$container = (settings.container === undefined ||
			settings.container === window) ? $window : $(settings.container);
		if (0 === settings.event.indexOf("scroll")) {
			$container.on(settings.event, debounce(
				function() {
					return update();
				}, settings.debounce)
			);
		}
		this.each(function() {
			var self = this;
			var $self = $(self);
			self.loaded = false;
			if ($self.attr("src") === undefined || $self.attr("src") === false) {
				if ($self.is("img")) {
					$self.attr("src", settings.placeholder);
				}
			}
			$self.one("appear", function() {
				if (!this.loaded) {
					if (settings.appear) {
						var elements_left = elements.length;
						settings.appear.call(self, elements_left, settings);
					}
					$("<img />")
						.on("load", function() {
							var original = $self.attr("data-" + settings.data_attribute);
							if ($self.is("img")) {
								$self.attr("src", original);
								$self.removeAttr("data-" + settings.data_attribute);
							} else {
								$self.css("background-image", "url('" + original + "')");
							}
							self.loaded = true;
							var temp = $.grep(elements, function(element) {
								return !element.loaded;
							});
							elements = $(temp);
							if (settings.load) {
								var elements_left = elements.length;
								settings.load.call(self, elements_left, settings);
							}
						})
						.attr("src", $self.attr("data-" + settings.data_attribute));
				}
			});
			if (0 !== settings.event.indexOf("scroll")) {
				$self.on(settings.event, debounce(
					function() {
						if (!self.loaded) {
							$self.trigger("appear");
						}
					}, settings.debounce)
				);
			}
		});
		$window.on("resize", debounce(update, settings.debounce));
		if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
			$window.on("pageshow", function(event) {
				if (event.originalEvent && event.originalEvent.persisted) {
					elements.each(function() {
						$(this).trigger("appear");
					});
				}
			});
		}
		var cur_top = $window.scrollTop();
		$window.scrollTop(cur_top + 1).scrollTop(cur_top);
		update();
		return this;
	};
	$.belowthefold = function(element, settings) {
		var fold;
		if (settings.container === undefined || settings.container === window) {
			fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
		} else {
			fold = $(settings.container).offset().top + $(settings.container).height();
		}
		return fold <= $(element).offset().top - settings.threshold;
	};
	$.rightoffold = function(element, settings) {
		var fold;
		if (settings.container === undefined || settings.container === window) {
			fold = $window.width() + $window.scrollLeft();
		} else {
			fold = $(settings.container).offset().left + $(settings.container).width();
		}
		return fold <= $(element).offset().left - settings.threshold;
	};
	$.abovethetop = function(element, settings) {
		var fold;
		if (settings.container === undefined || settings.container === window) {
			fold = $window.scrollTop();
		} else {
			fold = $(settings.container).offset().top;
		}
		return fold >= $(element).offset().top + settings.threshold  + $(element).height();
	};
	$.leftofbegin = function(element, settings) {
		var fold;
		if (settings.container === undefined || settings.container === window) {
			fold = $window.scrollLeft();
		} else {
			fold = $(settings.container).offset().left;
		}
		return fold >= $(element).offset().left + settings.threshold + $(element).width();
	};
	$.inviewport = function(element, settings) {
		 return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
				!$.belowthefold(element, settings) && !$.abovethetop(element, settings);
	 };
})(jQuery, window, document);

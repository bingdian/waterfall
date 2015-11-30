/*! waterfall - v0.1.73 - 2015-12-01
* http://wlog.cn/waterfall/
* Copyright (c) 2015 bingdian; Licensed MIT */
/*global Handlebars: false, console: false */
;(function( $, window, document, undefined ) {

    'use strict';

    /*
     * defaults
     */
    var $window = $(window),
        pluginName = 'waterfall',
        defaults = {
            itemCls: 'waterfall-item',  // the brick element class
            prefix: 'waterfall', // the waterfall elements prefix
            fitWidth: true, // fit the parent element width
            colWidth: 240,  // column width
            gutterWidth: 10, // the brick element horizontal gutter
            gutterHeight: 10, // the brick element vertical gutter
            align: 'center', // the brick align，'align', 'left', 'right'
            minCol: 1,  // min columns
            maxCol: undefined, // max columns, if undefined,max columns is infinite
            maxPage: undefined, // max page, if undefined,max page is infinite
            bufferPixel: -50, // decrease this number if you want scroll to fire quicker
            containerStyle: { // the waterfall container style
                position: 'relative'
            },
            resizable: true, // triggers layout when browser window is resized
            isFadeIn: false, // fadein effect on loading
            isAnimated: false, // triggers animate when browser window is resized
            animationOptions: { // animation options
            },
            isAutoPrefill: true,  // When the document is smaller than the window, load data until the document is larger
            checkImagesLoaded: true, // triggers layout when images loaded. Suggest false
            path: undefined, // Either parts of a URL as an array (e.g. ["/popular/page/", "/"] => "/popular/page/1/" or a function that takes in the page number and returns a URL(e.g. function(page) { return '/populr/page/' + page; } => "/popular/page/1/")
            dataType: 'json', // json, jsonp, html
            params: {}, // params,{type: "popular", tags: "travel", format: "json"} => "type=popular&tags=travel&format=json"
            headers: {}, // headers variable that gets passed to jQuery.ajax()

            loadingMsg: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>', // loading html

            state: {
                isDuringAjax: false,
                isProcessingData: false,
                isResizing: false,
                isPause: false,
                curPage: 1 // cur page
            },

            // callbacks
            callbacks: {
                /*
                 * loading start
                 * @param {Object} loading $('#waterfall-loading')
                 */
                loadingStart: function($loading) {
                    $loading.show();
                    //console.log('loading', 'start');
                },

                /*
                 * loading finished
                 * @param {Object} loading $('#waterfall-loading')
                 * @param {Boolean} isBeyondMaxPage
                 */
                loadingFinished: function($loading, isBeyondMaxPage) {
                    if ( !isBeyondMaxPage ) {
                        $loading.fadeOut();
                        //console.log('loading finished');
                    } else {
                        //console.log('loading isBeyondMaxPage');
                        $loading.remove();
                    }
                },

                /*
                 * loading error
                 * @param {String} xhr , "end" "error"
                 */
                loadingError: function($message, xhr) {
                    $message.html('Data load faild, please try again later.');
                },

                /*
                 * render data
                 * @param {String} data
                 * @param {String} dataType , "json", "jsonp", "html"
                 */
                renderData: function (data, dataType) {
                    var tpl,
                        template;

                    if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
                        tpl = $('#waterfall-tpl').html();
                        template = Handlebars.compile(tpl);

                        return template(data);
                    } else { // html format
                        return data;
                    }
                }
            },

            debug: false // enable debug
        };

    /*
     * Waterfall constructor
     */
    function Waterfall(element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {}, defaults, options);
        this.colHeightArray = []; // columns height array
        this.styleQueue = [];

        this._init();
    }


    Waterfall.prototype = {
        constructor: Waterfall,

        // Console log wrapper
        _debug: function () {
            if ( true !== this.options.debug ) {
                return;
            }

            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                // Modern browsers
                // Single argument, which is a string
                if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === 'string') {
                    console.log( (Array.prototype.slice.call(arguments)).toString() );
                } else {
                    console.log( Array.prototype.slice.call(arguments) );
                }
            } else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
                // IE8
                Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
            }
        },


        /*
         * _init
         * @callback {Object Function } and when instance is triggered again -> $element.waterfall()
         */
        _init: function( callback ) {
            var options = this.options,
                path = options.path;

            this._setColumns();
            this._initContainer();
            this._resetColumnsHeightArray();
            this.reLayout( callback );

            if ( !path ) {
                this._debug('Invalid path');
                return;
            }

            // auto prefill
            if ( options.isAutoPrefill ) {
                this._prefill();
            }

            // bind resize
            if ( options.resizable ) {
                this._doResize();
            }

            // bind scroll
            this._doScroll();
        },

        /*
         * init waterfall container
         */
        _initContainer: function() {
            var options = this.options,
                prefix = options.prefix;

            // fix fixMarginLeft bug
            $('body').css({
                overflow: 'auto'
            });


            this.$element.css(this.options.containerStyle).addClass(prefix + '-container');
            this.$element.after('<div id="' + prefix + '-loading">' +options.loadingMsg+ '</div><div id="' + prefix + '-message" style="text-align:center;color:#999;"></div>');

            this.$loading = $('#' + prefix + '-loading');
            this.$message = $('#' + prefix + '-message');
        },


        /**
         * get columns
         */
        _getColumns : function() {
            var options = this.options,
                $container = options.fitWidth ?  this.$element.parent() : this.$element,
                containerWidth = $container[0].tagName === 'BODY' ? $container.width() - 20 : $container.width(),  // if $container[0].tagName === 'BODY', fix browser scrollbar
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                minCol = options.minCol,
                maxCol = options.maxCol,
                cols = Math.floor(containerWidth / (colWidth + gutterWidth)),
                col = Math.max(cols, minCol );

            /*if ( !maxCol ) {
                return col;
            } else {
                return col > maxCol ? maxCol : col;
            }*/
            return !maxCol ? col : (col > maxCol ? maxCol : col);
        },


        /**
         * set columns
         */
        _setColumns: function() {
            this.cols = this._getColumns();
        },


        /*
         * get items
         */
        _getItems: function( $content ) {
            var $items = $content.filter('.' + this.options.itemCls).css({
                'position': 'absolute'
            });

            return $items;
        },


        /*
         * reset columns height array
         */
        _resetColumnsHeightArray: function() {
            var cols = this.cols,
                i;

            this.colHeightArray.length = cols;

            for (i = 0; i < cols; i++) {
                this.colHeightArray[i] = 0;
            }
        },

        /*
         * layout
         */
        layout: function($content, callback) {
            var options = this.options,
            $items = this.options.isFadeIn ? this._getItems($content).css({ opacity: 0 }).animate({ opacity: 1 }) : this._getItems($content),
                styleFn = (this.options.isAnimated && this.options.state.isResizing) ? 'animate' : 'css',
                animationOptions = options.animationOptions,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                len = this.colHeightArray.length,
                align = options.align,
                fixMarginLeft,
                obj,
                i, j, itemsLen, styleLen;

            // append $items
            this.$element.append($items);

            // fixMarginLeft
            if ( align === 'center' ) {
                fixMarginLeft = (this.$element.width() - colWidth * len  - gutterWidth * (len - 1) ) /2;
                fixMarginLeft = fixMarginLeft > 0 ? fixMarginLeft : 0;
            } else if ( align === 'left' ) {
                fixMarginLeft = 0;
            } else if ( align === 'right' ) {
                fixMarginLeft = this.$element.width() - colWidth * len  - gutterWidth * (len - 1);
            }

            // place items
            for (i = 0, itemsLen = $items.length; i < itemsLen; i++) {
                this._placeItems( $items[i], fixMarginLeft);
            }

            // set style
            for (j= 0, styleLen = this.styleQueue.length; j < styleLen; j++) {
                obj = this.styleQueue[j];
                obj.$el[ styleFn ]( obj.style, animationOptions );
            }

            // update waterfall container height
            this.$element.height(Math.max.apply({}, this.colHeightArray));

            // clear style queue
            this.styleQueue = [];

            // update status
            this.options.state.isResizing = false;
            this.options.state.isProcessingData = false;

            // callback
            if ( callback ) {
                callback.call( $items );
            }
        },


        /*
         * relayout
         */
        reLayout: function( callback ) {
            var $content = this.$element.find('.' + this.options.itemCls);

            this._resetColumnsHeightArray();
            this.layout($content , callback );
        },

        /*
         * place items
         */
        _placeItems: function( item, fixMarginLeft ) {

            var $item = $(item),
                options = this.options,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                gutterHeight = options.gutterHeight,
                colHeightArray = this.colHeightArray,
                len = colHeightArray.length,
                minColHeight = Math.min.apply({}, colHeightArray),
                minColIndex = $.inArray(minColHeight, colHeightArray),
                colIndex, //cur column index
                position;

            if ( $item.hasClass(options.prefix + '-item-fixed-left')) {
                colIndex = 0;
            } else if ( $item.hasClass(options.prefix + '-item-fixed-right') ) {
                colIndex = ( len > 1 ) ? ( len - 1) : 0;
            } else {
                colIndex = minColIndex;
            }

            position = {
                left: (colWidth + gutterWidth) * colIndex  + fixMarginLeft,
                top: colHeightArray[colIndex]
            };

            // push to style queue
            this.styleQueue.push({ $el: $item, style: position });

            // update column height
            colHeightArray[colIndex] += $item.outerHeight() + gutterHeight;

            //item add attr data-col
            //$item.attr('data-col', colIndex);
        },

        /*
         * prepend
         * @param {Object} $content
         * @param {Function} callback
         */
        prepend: function($content, callback) {
            this.$element.prepend($content);
            this.reLayout(callback);
        },

        /*
         * append
         * @param {Object} $content
         * @param {Function} callback
         */
        append: function($content, callback) {
            this.$element.append($content);
            this.reLayout(callback);
        },

        /*
         * remove item
         * @param {Object} $items
         * @param {Function} callback
         */
        removeItems:function($items, callback ) {
            this.$element.find($items).remove();
            this.reLayout(callback);
        },

        /*
         * opts
         * @param {Object} opts
         * @param {Function} callback
         */
        option: function( opts, callback ){
            if ( $.isPlainObject( opts ) ){
                this.options = $.extend(true, this.options, opts);

                if ( typeof callback === 'function' ) {
                    callback();
                }

                // re init
                this._init();
            }
        },

        /*
         * prevent ajax request
         */
        pause: function(callback) {
            this.options.state.isPause = true;

            if ( typeof callback === 'function' ) {
                callback();
            }
        },


        /*
         * resume ajax request
         */
        resume: function(callback) {
            this.options.state.isPause = false;

            if ( typeof callback === 'function' ) {
                callback();
            }
        },

        /**
         * request data
         */
        _requestData: function(callback) {
            var self = this,
                options = this.options,
                maxPage = options.maxPage,
                curPage = options.state.curPage++, // cur page
                path = options.path,
                dataType = options.dataType,
                params = options.params,
                headers = options.headers,
                pageurl;

            if ( maxPage !== undefined && curPage > maxPage ){
                options.state.isBeyondMaxPage = true;
                options.callbacks.loadingFinished(this.$loading, options.state.isBeyondMaxPage);
                return;
            }

            // get ajax url
            pageurl = (typeof path === 'function') ? path(curPage) : path.join(curPage);

            this._debug('heading into ajax', pageurl+$.param(params));

            // loading start
            options.callbacks.loadingStart(this.$loading);

            // update state status
            options.state.isDuringAjax = true;
            options.state.isProcessingData = true;

            // ajax
            $.ajax({
                url: pageurl,
                data: params,
                headers: headers,
                dataType: dataType,
                success: function(data) {
                    self._handleResponse(data, callback);
                    self.options.state.isDuringAjax = false;
                },
                error: function(jqXHR) {
                    self._responeseError('error');
                }
            });
        },


        /**
         * handle response
         * @param {Object} data
         * @param {Function} callback
         */
        _handleResponse: function(data, callback) {
            var self = this,
                options = this.options,
                content = $.trim(options.callbacks.renderData(data, options.dataType)),
                $content = $(content),
                checkImagesLoaded = options.checkImagesLoaded;

            if ( !checkImagesLoaded ) {
               self.append($content, callback);
               self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);
            } else {
                $content.imagesLoaded(function() {
                    self.append($content, callback);
                    self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);
                });
            }


        },

        /*
         * reponse error
         */
        _responeseError: function(xhr) {

            this.$loading.hide();
            this.options.callbacks.loadingError(this.$message, xhr);

            if ( xhr !== 'end' && xhr !== 'error' ) {
                xhr = 'unknown';
            }

            this._debug('Error', xhr);
        },


        _nearbottom: function() {
            var options = this.options,
                minColHeight = Math.min.apply({}, this.colHeightArray),
                distanceFromWindowBottomToMinColBottom = $window.scrollTop() + $window.height() - this.$element.offset().top - minColHeight;

            this._debug('math:', distanceFromWindowBottomToMinColBottom);

            return ( distanceFromWindowBottomToMinColBottom > options.bufferPixel );
        },

        /*
         * prefill
         */
        _prefill: function() {
            if ( this.$element.height() <= $window.height() ) {
                this._scroll();
            }
        },

        /*
         * _scroll
         */
        _scroll: function() {
            var options = this.options,
                state = options.state,
                self = this;

            if ( state.isProcessingData || state.isDuringAjax || state.isInvalidPage || state.isPause ) {
                return;
            }

            if ( !this._nearbottom() ) {
                return;
            }

            this._requestData(function() {
                var timer = setTimeout(function() {
                    self._scroll();
                }, 100);
            });
        },


        /*
         * do scroll
         */
        _doScroll: function() {
            var self = this,
                scrollTimer;

            $window.bind('scroll', function() {
                if ( scrollTimer ) {
                    clearTimeout(scrollTimer);
                }

                scrollTimer = setTimeout(function() {
                    //self._debug('event', 'scrolling ...');
                    self._scroll();
                }, 100);
            });
        },


        /*
         * resize
         */
        _resize: function() {
            var cols = this.cols,
                newCols = this._getColumns(); // new columns


            if ( newCols !== cols || this.options.align !== 'left' ) {
                //this._debug('event', 'resizing ...');
                this.options.state.isResizing = true;
                this.cols = newCols; // update columns
                this.reLayout(); // relayout
                this._prefill(); // prefill
            }
        },


        /*
         * do resize
         */
        _doResize: function() {
            var self = this,
                resizeTimer;

            $window.bind('resize', function() {
                if ( resizeTimer ) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    self._resize();
                }, 100);
            });
        }
    };


    $.fn[pluginName] = function(options) {
        if ( typeof options === 'string' ) { // plugin method
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function() {
                var instance = $.data( this, 'plugin_' + pluginName );

                if ( !instance ) {
                    instance._debug('instance is not initialization');
                    return;
                }

                if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) { //
                    instance._debug( 'no such method "' + options + '"' );
                    return;
                }

                //  apply method
                instance[options].apply( instance, args );
            });
        } else { // new plugin
            this.each(function() {
                if ( !$.data(this, 'plugin_' + pluginName) ) {
                    $.data(this, 'plugin_' + pluginName, new Waterfall(this, options));
                }
            });
        }

        return this;
    };

}( jQuery, window, document ));


/*!
 * jQuery imagesLoaded plugin v2.1.2
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */

;(function($, undefined) {
'use strict';

// blank image data-uri bypasses webkit log warning (thx doug jones)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function( callback ) {
    var $this = this,
        deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
        hasNotify = $.isFunction(deferred.notify),
        $images = $this.find('img').add( $this.filter('img') ),
        loaded = [],
        proper = [],
        broken = [];

    // Register deferred callbacks
    if ($.isPlainObject(callback)) {
        $.each(callback, function (key, value) {
            if (key === 'callback') {
                callback = value;
            } else if (deferred) {
                deferred[key](value);
            }
        });
    }

    function doneLoading() {
        var $proper = $(proper),
            $broken = $(broken);

        if ( deferred ) {
            if ( broken.length ) {
                deferred.reject( $images, $proper, $broken );
            } else {
                deferred.resolve( $images );
            }
        }

        if ( $.isFunction( callback ) ) {
            callback.call( $this, $images, $proper, $broken );
        }
    }

    function imgLoadedHandler( event ) {
        imgLoaded( event.target, event.type === 'error' );
    }

    function imgLoaded( img, isBroken ) {
        // don't proceed if BLANK image, or image is already loaded
        if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
            return;
        }

        // store element in loaded images array
        loaded.push( img );

        // keep track of broken and properly loaded images
        if ( isBroken ) {
            broken.push( img );
        } else {
            proper.push( img );
        }

        // cache image and its state for future calls
        $.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

        // trigger deferred progress method if present
        if ( hasNotify ) {
            deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
        }

        // call doneLoading and clean listeners if all images are loaded
        if ( $images.length === loaded.length ) {
            setTimeout( doneLoading );
            $images.unbind( '.imagesLoaded', imgLoadedHandler );
        }
    }

    // if no images, trigger immediately
    if ( !$images.length ) {
        doneLoading();
    } else {
        $images.bind( 'load.imagesLoaded error.imagesLoaded', imgLoadedHandler )
        .each( function( i, el ) {
            var src = el.src,

            // find out if this image has been already checked for status
            // if it was, and src has not changed, call imgLoaded on it
            cached = $.data( el, 'imagesLoaded' );
            if ( cached && cached.src === src ) {
                imgLoaded( el, cached.isBroken );
                return;
            }

            // if complete is true and browser supports natural sizes, try
            // to check for image status manually
            if ( el.complete && el.naturalWidth !== undefined ) {
                imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
                return;
            }

            // cached images don't fire load sometimes, so we reset src, but only when
            // dealing with IE, or image is complete (loaded) and failed manual check
            // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
            if ( el.readyState || el.complete ) {
                el.src = BLANK;
                el.src = src;
            }
        });
    }

    return deferred ? deferred.promise( $this ) : $this;
};

})(jQuery);

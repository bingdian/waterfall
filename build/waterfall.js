/*!
 * waterfall
 * http://wlog.cn/waterfall/
 *
 * Copyright (c) 2013 bingdian
 * Licensed under the MIT license.
 */
/*global Handlebars: false, console: false */
;(function( $, window, document, undefined ) {
    
    'use strict';
    
    /*
     * defaults
     */
    var $window = $(window),
        pluginName = 'waterfall',
        defaults = {
            itemCls: 'waterfall-item',  // 瀑布流数据块class
            prefix: 'waterfall', // 瀑布流元素前辍
            fitWidth: true, // 是否自适应父元素宽度,false时，瀑布流宽度为当前元素宽度
            colWidth: 240,  // 瀑布流每列的宽度
            gutterWidth: 10, // 数据块水平间距
            gutterHeight: 10, // 数据块垂直间距
            align: 'center', // 数据块相对于容器对齐方式，'align', 'left', 'right'
            minCol: 1,  // 数据块最小列数
            maxCol: undefined, // 数据块最多显示列数,默认undefined，最大列数无限制
            maxPage: undefined, // 最多显示多少页数据,默认undefined，无限下拉
            bufferPixel: -50, // 滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据
            containerStyle: { // 瀑布流默认样式
                position: 'relative'
            },
            resizable: true, // 缩放时是否触发数据重排
            isFadeIn: false, // 新插入数据是否使用fade动画
            isAnimated: false, // resize时数据是否显示动画
            animationOptions: { // resize动画效果，isAnimated为true时有效
            },
            isAutoPrefill: true,  // 当文档小于窗口可见区域，自动加载数据
            checkImagesLoaded: true, // 是否图片加载完成后开始排列数据块。如果直接后台输出图片尺寸，可设置为false
            path: undefined, // 瀑布流数据分页url，可以是数组如["/popular/page/", "/"] => "/popular/page/1/"，或者是根据分页返回一个url方法如：function(page) { return '/populr/page/' + page; } => "/popular/page/1/"
            dataType: 'json', //json, jsonp, html
            params: {}, //瀑布流数据请求参数
            
            loadingMsg: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>', // 加载提示进度条，html
            
            state: { 
                isDuringAjax: false, 
                isProcessingData: false, //处理数据状态，从发送ajax请求开始到瀑布流数据排列结束
                isResizing: false,
                curPage: 1 //当前第几页，默认第一页
            },

            // callbacks
            callbacks: {
                /*
                 * ajax请求开始之前
                 * @param {Object} loading $('#waterfall-loading')
                 */
                loadingStart: function($loading) {
                    $loading.show();
                    //console.log('loading', 'start');
                },
                
                /*
                 * ajax请求加载完成
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
                 * ajax请求出错误
                 * @param {String} xhr , "end" "error"
                 */
                loadingError: function($message, xhr) {
                    $message.html('Data load faild, please try again later.');
                },
                
                /*
                 * 处理ajax返回数方法
                 * @param {String} data
                 * @param {String} dataType , "json", "jsonp", "html"
                 */
                renderData: function (data, dataType) {
                    var tpl,
                        template;
                        
                    if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json或jsonp格式
                        tpl = $('#waterfall-tpl').html();
                        template = Handlebars.compile(tpl);
                        
                        return template(data);
                    } else { // html格式
                        return data;
                    }
                }
            },
            
            debug: false
        };
    
    /*
     * Waterfall constructor
     */
    function Waterfall(element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {}, defaults, options);
        this.colHeightArray = []; // 瀑布流各列高度数组
        this.styleQueue = []; 
        
        this._init();
        console.log(this);
    }
    
    
    Waterfall.prototype = {
        constructor: 'Waterfall',
        
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
         * _init 初始化瀑布流
         * @callback {Object Function } 当实例再次被触发时回调函数 -> $el.waterfall();
         */
        _init: function( callback ) {
            var options = this.options,
                path = options.path;
                
            this._setColumns();
            this._initContainer(); 
            this._resetColumnsHeightArray(); // 设置瀑布流高度数组
            this.reLayout( callback ); // 对已有数据块重排
            
            if ( !path ) { // 没有提供api
                this._debug('Invalid path');
                return;
            }
            
            // 当文档小于窗口可见区域，自动加载数据
            if ( options.isAutoPrefill ) {
                this._prefill();
            }
            
            // 绑定事件resize事件
            if ( options.resizable ) {
                this._doResize();
            }
            
            // 绑定事件scroll事件
            this._doScroll();
        },
        
        /*
         * 初始化瀑布流容器
         */
        _initContainer: function() {
            var options = this.options,
                prefix = options.prefix;
                
            //如果没有数据再插入div
            this.$element.css(this.options.containerStyle).addClass(prefix + '-container');
            this.$element.after('<div id="' + prefix + '-loading">' +options.loadingMsg+ '</div><div id="' + prefix + '-message" style="text-align:center;color:#999;"></div>');
            
            this.$loading = $('#' + prefix + '-loading');
            this.$message = $('#' + prefix + '-message');
        },
        

        /**
         * 获取可显示瀑布流列数
         */
        _getColumns : function() {
            var options = this.options,
                $container = options.fitWidth ?  this.$element.parent() : this.$element,
                containerWidth = $container[0].tagName === 'BODY' ? $container.width() - 20 : $container.width(), //如果container是body标签，减去滚动条宽度
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
         * 设置瀑布流列数
         */
        _setColumns: function() {
            this.cols = this._getColumns();
        },

        
        /*
         * 获取元素中的数据块
         */
        _getItems: function( $content ) {
            var $items = $content.filter('.' + this.options.itemCls).css({
                'position': 'absolute'
            });
            
            return $items;
        },
        
        
        /*
         * 重置瀑布流各列高度数组
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
         * 排列数据块
         */
        layout: function($content, callback) {
            var options = this.options,
				$items = this.options.isFadeIn ? this._getItems($content).css({ opacity: 0 }).animate({ opacity: 1 }) : this._getItems($content),
                styleFn = (this.options.isAnimated && this.options.state.isResizing) ? 'animate' : 'css', // 数据块动画效果
                animationOptions = options.animationOptions,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                len = this.colHeightArray.length,
                align = options.align,
                fixMarginLeft,
                obj,
				i, j, itemsLen, styleLen;

            // 处理后html插入瀑布流 
            this.$element.append($items);
            
            // 计算item的left position
            if ( align === 'center' ) {
                fixMarginLeft = (this.$element.width() - (colWidth + gutterWidth) * len) /2;
                fixMarginLeft = fixMarginLeft > 0 ? fixMarginLeft : 0;
            } else if ( align === 'left' ) {
                fixMarginLeft = 0;
            } else if ( align === 'right' ) {
                fixMarginLeft = this.$element.width() - (colWidth + gutterWidth) * len;
            }
            
            // 设置数据块的位置样式
            for (i = 0, itemsLen = $items.length; i < itemsLen; i++) {
                this._placeItems( $items[i], fixMarginLeft);
            }

            // 应用数据块样式
            for (j= 0, styleLen = this.styleQueue.length; j < styleLen; j++) {
                obj = this.styleQueue[j];
                obj.$el[ styleFn ]( obj.style, animationOptions );
            }
            
            // 瀑布流数据块排列完成设置$container高度为瀑布流最大列高度
            this.$element.height(Math.max.apply({}, this.colHeightArray));
            
            // 清除队列
            this.styleQueue = [];
            
            // 更新排列完成状态
            this.options.state.isResizing = false;
            this.options.state.isProcessingData = false;
            
            // callback
            if ( callback ) {
                callback.call( $items );
            }
        },
        
        
        /*
         * 全部重排数据块
         */
        reLayout: function( callback ) {
            var $content = this.$element.find('.' + this.options.itemCls);
            
            // 重置高度数组
            this._resetColumnsHeightArray(); 
            
            // 重排
            this.layout($content , callback );
        },
        
        /*
         * 设置数据块的位置样式
         */
        _placeItems: function( item, fixMarginLeft ) {
           
            var $item = $(item),
                options = this.options,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                gutterHeight = options.gutterHeight,
                colHeightArray = this.colHeightArray,
                len = colHeightArray.length,
                minColHeight = Math.min.apply({}, colHeightArray),        //当前所有列中最小高度
                minColIndex = $.inArray(minColHeight, colHeightArray),        //当前所有列中最小高度下标,
                colIndex, // item要插入的列index
                position;
                
             
            // 固定左边或右边
            if ( $item.hasClass(options.prefix + '-item-fixed-left')) {
                colIndex = 0;
            } else if ( $item.hasClass(options.prefix + '-item-fixed-right') ) {
                colIndex = ( len > 1 ) ? ( len - 1) : 0;
            } else {
                colIndex = minColIndex;
            }
            
            position = {
                left: (colWidth + gutterWidth) * colIndex  + fixMarginLeft,
                top: colHeightArray[colIndex]  // item要插入的列高度 
            };

            //插入动画效果队列
            this.styleQueue.push({ $el: $item, style: position });
            
            //更新colHeightArray高度
            colHeightArray[colIndex] += $item.outerHeight() + gutterHeight;
            
            //item添加class
            $item.attr('data-col', colIndex);
        },
        
        /*
         * prepend
         * @param {Object} $content
         * @param {Function} callback
         */
        prepend: function($content, callback) {
            this.$element.prepend($content);  
            this.reLayout(callback); // prepend需要重排瀑布流数据块
        },
        
        /*
         * append
         * @param {Object} $content
         * @param {Function} callback
         */
        append: function($content, callback) {
            this.$element.append($content);
            this.layout($content, callback);
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
                
                if ( callback )  {
                    callback();
                }
                
                // 重新初始化
                this._init();
            } 
        },
        
        /**
         * 请求api数据
         */
        _requestData: function(callback) {
            var self = this,
                options = this.options,
                maxPage = options.maxPage,
                curPage = options.state.curPage++, // 当前请求数据页数
                path = options.path,
                dataType = options.dataType,
                params = options.params,
                pageurl;

            // 超过最大页数 return
            if ( maxPage !== undefined && curPage > maxPage ){
                options.state.isBeyondMaxPage = true;
                options.callbacks.loadingFinished(this.$loading, options.state.isBeyondMaxPage);
                return;
            }
            
            // 获取数据url
            pageurl = (typeof path === 'function') ? path(curPage) : path.join(curPage);
            
            this._debug('heading into ajax', pageurl+$.param(params));
            
            // loading start
            options.callbacks.loadingStart(this.$loading);
            
            // 记录ajax请求状态
            options.state.isDuringAjax = true;
            options.state.isProcessingData = true;
            
            //请求数据
            $.ajax({
                url: pageurl,
                data: params,
                dataType: dataType,
                success: function(data, textStatus, jqXHR) {
                    var condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
                    
                    if ( condition ) {
                        // 模拟数据加载延迟
                        /*setTimeout(function() {
                            self._handleResponse(data, callback);
                        }, 1500);*/
                        self._handleResponse(data, callback);
                    } else {
                        self._responeseError('end');
                    }
                    
                    self.options.state.isDuringAjax = false;
                },
                error: function(jqXHR) {
                    self._responeseError('error');
                }
            });
        },
        
        
        /**
         * 处理返回的请求数据
         * @param {Object} data
         * @param {Function} callback
         */
        _handleResponse: function(data, callback) {
            var self = this,
                options = this.options,
                content = $.trim(options.callbacks.renderData(data, options.dataType)),//$.trim 去掉开头空格，以动态创建由 jQuery 对象包装的 DOM 元素
                $content = $(content),
                checkImagesLoaded = options.checkImagesLoaded;
            
            if ( !checkImagesLoaded ) { // 不需要检测图片是否加载完成
               self.append($content, callback);
               self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);
            } else {
                $content.imagesLoaded(function() { // 图片是否加载完成回调,当网络比较慢的时候需要等待很长时间
                    self.append($content, callback);
                    self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);
                });
            }
            
            
        },
        
        /*
         * 请求数据失败
         * _responeseError
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
                distanceFromWindowBottomToMinColBottom = $window.scrollTop() + $window.height() - this.$element.offset().top - minColHeight; // 窗口底部到瀑布流最小高度列的距离
                
            this._debug('math:', distanceFromWindowBottomToMinColBottom);

            // 滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据
            return ( distanceFromWindowBottomToMinColBottom > options.bufferPixel );

        },
        
        /*
         * 预填充数据
         */
        _prefill: function() {
            if ( this.$element.height() <= $window.height() ) {
                this._scroll();
            }
        },
        
        /*
         * _scroll
         * 自动填充数据
         */
        _scroll: function() {
            var options = this.options,
                state = options.state,
                self = this;
            
            
            // state.isProcessingData 数据还没有处理完成 return
            // ajax数据正在请求还没有完成 return
            // 
            if ( state.isProcessingData || state.isDuringAjax || state.isInvalidPage ) {
                return;
            }
            
            if ( !this._nearbottom() ) {
                return;
            }
            
            this._requestData(function() {
                // 数据请求并排列完成后，如果还没有填满页面，继续执行_scroll()
                var timer = setTimeout(function() {
                    self._scroll();
                }, 100);
            });
        },
        
        
        /*
         * 绑定scroll事件
         */
        _doScroll: function() {
            var self = this,
                scrollTimer;
            
            $window.bind('scroll', function() {
                clearTimeout(scrollTimer);
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
                newCols = this._getColumns(); //resize后获取页面可以显示列数
            
            //列数没变化不调整
            //页面列数有变化时resize
            //瀑布流数据块居中对齐resize
            
            if ( newCols !== cols || this.options.align !== 'left' ) {
                //this._debug('event', 'resizing ...');
                this.options.state.isResizing = true;
                this.cols = newCols; //更新列数
                this.reLayout(); //重排数据
                this._prefill(); //resize后需要判断是否需要填充新的内容
            }
        },
        
        
        /*
         * 绑定resize事件 
         */
        _doResize: function() {
            var self = this,
                resizeTimer;

            $window.bind('resize', function() {
                clearTimeout(resizeTimer);
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

                if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) { // options不是一个公有的方法，return
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
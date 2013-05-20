/*!
 * waterfall
 * http://wlog.cn/athena/waterfall/
 *
 * Copyright (c) 2013 bingdian
 * Licensed under the MIT license.
 */
;(function( $, window, document, undefined ) {
    
    /*
     * defaults
     */
    var pluginName = 'waterfall',
        defaults = {
            itemCls: 'waterfall-item',  // 瀑布流数据块class
            prefix: 'waterfall', // 瀑布流元素前辍
            fitWidth: true, // 是否自适应父元素宽度
            colWidth: 240,  // 数据块每列宽度
            gutterWidth: 0, // 数据块水平间距
            gutterHeight: 0, // 数据块垂直间距
            align: 'center', // 数据块相对于容器对齐方式，'align', 'left', 'right'
            minCol: 1,  // 数据块最小列数
            maxPage: undefined, // 最多显示多少页数据,默认undefined，无限下拉
            bufferPixel: -50, // 滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据
            containerStyle: { // 瀑布流元素样式
                position: 'relative'
            },
            resizable: true, // 缩放时是否触发数据重排?false时测试数据是否会自动加载
            isFadeIn: true, // 新插入数据是否使用fade动画
            isAnimated: false, //重排数据是否显示动画
            animationOptions: {
            },
            isAutoPrefill: true,  // 当文档小于窗口可见区域，自动加载数据
            path: undefined, // 瀑布流数据分页url，可以是数组如["/popular/page/", "/"] => "/popular/page/1/"，或者是根据分页返回一个url方法如：function(page) { return '/populr/' + page; }
            dataType: 'json', //json, jsonp, html
            params: {}, //瀑布流数据请求参数
            
            
            loadingMsg: '<div style="text-align:center;padding:10px 0 ;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>',
            
            state: { 
                isDuringAjax: false, 
                isProcessingData: false, //处理数据状态，从发送ajax请求开始到瀑布流数据排列结束
                //isDestroyed: false,
                //isDone: false, 
                curPage: 1
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
                 * @param {String} xhr , end/failed
                 */
                loadingError: function(xhr) {
                },
                
                /*
                 * 处理ajax返回数方法
                 * @param {String} data
                 */
                renderData: function (data) {
                    var tpl = $('#waterfall-tpl').html(),
                        template = Handlebars.compile(tpl);
                        
                    return template(data);
                },
            },
            
            debug: true
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
    }
    
    
    Waterfall.prototype = {
        constructor: 'Waterfall',
        
        // Console log wrapper
        _debug: function infscr_debug() {
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
            var self = this,
                options = this.options,
                path = options.path;
                
            if ( !path ) { // 没有提供api
                this._debug('Invalid path');
                return;
            }
            
            
            this._setColumns();
            this._initContainer(); 
            this._resetColumnsHeightArray();
            this._reLayout( callback ); // 对已有数据块重排
            
            // auto prefill
            if ( options.isAutoPrefill ) {
				this._prefill();
			}

            //绑定事件
            this._doResize();
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
            this.$element.after('<div id="' + prefix + '-loading">' +options.loadingMsg+ '</div>');
            
            this.$container = this.$element;
            this.$loading = $('#' + prefix + '-loading');
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
                cols = Math.floor(containerWidth / (colWidth + gutterWidth));

            return  Math.max(cols, minCol );
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
            var cols = this.cols;
            
            this.colHeightArray.length = cols;
            
            for (var i = 0; i < cols; i++) {
                this.colHeightArray[i] = 0;
            }
        },
        
        /*
         * 排列数据块
         */
        layout: function($items, callback) {
            var options = this.options,
                styleFn = this.options.isAnimated ? 'animate' : 'css', // 数据块动画效果
                animationOptions = options.animationOptions,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                len = this.colHeightArray.length,
                align = options.align,
                fixMarginLeft,
                obj;
            
            //计算item的left margin
            if ( align === 'center' ) {
                fixMarginLeft = (this.$container.width() - (colWidth + gutterWidth) * len) /2;
            } else if ( align === 'left' ) {
                fixMarginLeft = 0;
            } else if ( align === 'right' ) {
                fixMarginLeft = this.$container.width() - (colWidth + gutterWidth) * len;
            }
            
            
            // 设置数据块的位置样式
            for (var i = 0, itemsLen = $items.length; i < itemsLen; i++) {
                this._placeItems( $items[i], fixMarginLeft);
            }

            // 应用数据块样式
            for (var j= 0, styleLen = this.styleQueue.length; j < styleLen; j++) {
                obj = this.styleQueue[j];
                obj.$el[ styleFn ]( obj.style, animationOptions );
            }
            
            // 瀑布流数据块排列完成设置$container高度
            this.$element.height(Math.max.apply({}, this.colHeightArray));
            
            //清除队列
            this.styleQueue = [];
            
            
            // 更新排列完成状态
            this.options.state.isProcessingData = false;
            
            // 数据排玩完成不足一屏再次填充数据
            //this._fillData();
            
            // callback
            if ( callback ) {
                callback.call( $items );
            }
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
                colIndex,
                position;
                
             
            // 固定左边或右边
            if ( $item.hasClass(options.prefix + '-item-fixed-left')) {
                colIndex = 0;
            } else if ( $item.hasClass(options.prefix + '-item-fixed-right') ) {
                colIndex = len > 1 ? ( len - 1) : 0;
            } else {
                colIndex = minColIndex;
            }
            
            position = {
                left: (colWidth + gutterWidth) * colIndex  + fixMarginLeft,
                top: minColHeight  
            };

            
            //插入动画效果队列
            this.styleQueue.push({ $el: $item, style: position });
            
            //更新colHeightArray高度
            colHeightArray[colIndex] += $item.outerHeight() + gutterHeight;
            
            //item添加class
            $item.addClass('col-' + colIndex);
        },
        
        /*
         * 全部重排数据块
         */
        _reLayout: function( callback ) {
            var $items = this._getItems(this.$element.find('.' + this.options.itemCls));
            
            this._resetColumnsHeightArray(); //重置高度数组
            
            this.layout( $items, callback );
        },
        
        
        addItems: function($items) {
        },
        
        appended: function($items) {
        },
        
        removeItems:function($items) {
        },
        
        reLayout: function() {
        },
        
        destroy: function() {
        },
        
        /**
         * 请求api数据
         */
        _requestData: function(callback) {
            var self = this,
                options = this.options,
                maxPage = options.maxPage,
                curPage = options.state.curPage++, // increment
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
            
			this._debug('heading into ajax', pageurl);
            
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
                    console.log(textStatus);
                    if ( condition ) {
                        // 模拟数据加载延迟
                        setTimeout(function() {
                            self._handleResponse(data, callback);
                        }, 1500);
                        /*self._handleResponse(data, callback);*/
                    } else {
                        self._responeseError('end');
                    }
                    
                    self.options.state.isDuringAjax = false;
                },
                error: function() {
                    self._debug('ajax request failed.');
                    self._responeseError('failed');
                }
            });
        },
        
        
        /**
         * 处理返回的请求数据
         * @param {Object} data
         * @param {Function} callback
         */
        _handleResponse: function(data, callback) {
            var content = $.trim(this.options.callbacks.renderData(data)),//$.trim 去掉开头空格，以动态创建由 jQuery 对象包装的 DOM 元素
                $content = $(content),
                $newItems = this._getItems($content)/*.css({ opacity: 0 }).animate({ opacity: 1 })*/;
                
            //处理后html插入瀑布流 
            this.$element.append($content);
            
            //排列瀑布流数据
            this.layout($newItems, callback);
            
            //loading finished
            this.options.callbacks.loadingFinished(this.$loading, this.options.state.isBeyondMaxPage);
        },
        
        /*
         * 请求数据失败
         * _responeseError
         */
        _responeseError: function(xhr) {
            
            if (xhr === 'end' || xhr === 'failed' ) {
                this.options.callbacks.loadingError(xhr);
            } else {
                xhr = 'unknown';
            }
            
            this._debug('Error', xhr);
        },
        
        
        _nearbottom: function() {
            var options = this.options,
                minColHeight = Math.min.apply({}, this.colHeightArray),
                distanceFromWindowBottomToMinColBottom = $(window).scrollTop() + $(window).height() - this.$element.offset().top - minColHeight; // 窗口底部到瀑布流最小高度列的距离
                
            this._debug('math:', distanceFromWindowBottomToMinColBottom);

            // 滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据
            return ( distanceFromWindowBottomToMinColBottom > options.bufferPixel );

        },
        
        /*
         * 预填充数据
         */
        _prefill: function() {
            this._fillData();
        },
        
        /*
         * fillData
         * 自动填充数据
         */
        _fillData: function() {
            var options = this.options,
                state = options.state;
            
            // state.isProcessingData 数据还没有处理完成 return
            // ajax数据正在请求还没有完成 return
            // 
            if ( state.isProcessingData || state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
				return;
			}
            
            if ( !this._nearbottom() ) {
				return;
			}
            
            this._requestData();
        },
        
        
        /*
         * 绑定scroll事件
         */
        _doScroll: function() {
            var self = this,
                timer;
            
            $(window).bind('scroll', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self._debug('event', 'scroll ...');
                    self._fillData();
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
                this.cols = newCols; //更新列数
                this._reLayout(); //重排数据
            }
        },
        
        
        /*
         * 绑定resize事件 
         */
        _doResize: function() {
            var self = this,
                timer;

            $(window).bind('resize', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self._debug('event', 'resize ...');
                    self._resize();
                }, 100); 
            });
        }
    };
    
    
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Waterfall(this, options));
            }
        });
    };
    
}( jQuery, window, document ));
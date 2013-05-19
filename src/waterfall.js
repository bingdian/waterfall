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
            itemCls: 'waterfall-item',  //瀑布流数据块class
            prefix: 'waterfall', //瀑布流元素前辍
            
            fitWidth: true, //是否自适应父元素宽度
            colWidth: 240,  //数据块每列宽度
            gutterWidth: 0, //数据块水平间距
            gutterHeight: 0, //数据块垂直间距
            minCol: 1,  //数据块最小列数
            maxPage: undefined, //最多显示多少页数据,默认undefined，无限下拉
            bufferPixel: -50, // 滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据
            
            containerStyle: { //瀑布流元素样式
                position: 'relative'
            },
            
            resizable: true, //缩放时是否触发数据重排?false时测试数据是否会自动加载
            isFadeIn: true, // 新插入数据是否使用fade动画
            isAnimated: true, //重排数据是否显示动画
            animationOptions: {
            },
            isAutoPrefill: true,  // 当文档小于窗口可见区域，自动加载数据 
            
            
            loading: {
                loadingMsg: 'loading...',
                ajaxFailedMsg: 'ajax request failed, please try again later',
                start: undefined,
                finished: undefined
            },  //数据加载中内容
            
            state: {
                isDuringAjax: false,
                isDuringLayout: false,
                isDestroyed: false,
                isDone: false, 
                curPage: 1
            },
            
            path: undefined, // 瀑布流数据分页url，可以是数组如["/page/", "/"]，或者是根据分页返回一个url方法如：function(page) { return '/populr/' + page; }
            dataType: 'json', //json, jsonp, html
            params: {}, //瀑布流数据请求参数
            
            callbacks: {
            },
            tpl: $('#waterfall-tpl').html(),
            
            debug: true
        };
    
    /*
     * Waterfall constructor
     */
    function Waterfall(element, options) {
        this.$element = $(element);
        this.options = $.extend( {}, defaults, options);
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
            var options = this.options,
                path = options.path,
                tpl = options.tpl;
                
            if ( !path ) { // 没有提供api
                this._debug('Invalid path');
                return;
            }
            
            if ( !tpl ) {// 没有提供模板
                this._debug('Template needed');
                return;
            }
            
            //template
            this.template = Handlebars.compile(tpl);

            this._setColumns();
            this._initContainer(); 
            this._resetColumnsHeightArray();
            this._reLayout( callback ); // 对已有数据块重排
            
            
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
            this.$element.after('<div id="' + prefix + '-loading">' +options.loading.loadingMsg+ '</div>');
            
            this.$container = this.$element;
            this.$loading = this.$element.find('#' + prefix + '-loading');
        },
        

        /**
         * 获取可显示瀑布流列数
         */
        _getColumns : function() {
            var options = this.options,
                $container = options.fitWidth ?  this.$element.parent() : this.$element,
                containerWidth = $container.width(),
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
                obj;
            
            this.options.state.isDuringLayout = true;
            
            // 设置数据块的位置样式
            for (var i = 0, len = $items.length; i < len; i++) {
                this._placeItems( $items[i] );
            }

            // 应用数据块样式
            for (i=0, len = this.styleQueue.length; i < len; i++) {
                obj = this.styleQueue[i];
                obj.$el[ styleFn ]( obj.style, animationOptions );
            }
            
            // 瀑布流数据块排列完成设置$container高度
            this.$element.height(Math.max.apply({}, this.colHeightArray));
            
            //清除队列
            this.styleQueue = [];
            
            // 更新排列完成状态
            this.options.state.isDuringLayout = false;
            
            // 数据排玩完成不足一屏再次填充数据
            this._fillData();
            
            // callback
            if ( callback ) {
                callback.call( $items );
            }
        },
        
        
        /*
         * 设置数据块的位置样式
         */
        _placeItems: function( item ) {
            var self = this,
                $item = $(item),
                options = this.options,
                colWidth = options.colWidth,
                gutterWidth = options.gutterWidth,
                gutterHeight = options.gutterHeight,
                colHeightArray = this.colHeightArray,
                len = colHeightArray.length,
                minColHeight = Math.min.apply({}, colHeightArray),        //当前所有列中最小高度
                minColIndex = $.inArray(minColHeight, colHeightArray);        //当前所有列中最小高度下标,
                x = (colWidth + gutterWidth) * minColIndex,
                y = minColHeight,
                position = {
                    left: x,
                    top: y
                };
            
            //插入动画效果队列
            this.styleQueue.push({ $el: $item, style: position });
            
            //更新colHeightArray高度
            colHeightArray[minColIndex] += $item.outerHeight() + gutterHeight;
            
            //item添加class
            $item.addClass('col-' + minColIndex);
        },
        
        /*
         * 全部重排数据块
         */
        _reLayout: function( callback ) {
            var $items = this.$element.find('.' + this.options.itemCls);
            
            this._resetColumnsHeightArray(); //重置高度数组
            
            this.layout( $items, callback )
        },
        
        _startLoading: function() {
        },
        
        _endLoading: function() {
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
                timestamp = new Date().getTime(),
                params = options.params,
                pageurl;

            // 超过最大页数 return
            if ( maxPage !== undefined && curPage > maxPage ){
                options.state.isBeyondMaxPage = true;
                this.destroy();
                return;
            }
            
            // 获取数据url
            pageurl = (typeof path === 'function') ? path(curPage) : path.join(curPage);
			this._debug('heading into ajax', pageurl);
            
            // 加载数据前显示loading
            this.$loading.show();
            
            // 记录ajax请求状态
            this.options.state.isDuringAjax = true;
            
            //请求数据
            $.ajax({
                url: pageurl,
                data: params,
                dataType: dataType,
                success: function(data, textStatus, jqXHR) {
                    condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
                    
                    console.log('ajax load page ' + curPage);
                    //console.log(textStatus);
                    //console.log(jqXHR);
                    //console.log(condition);
                    
                    if (condition) {
                        // 模拟数据加载延迟
                        setTimeout(function() {
                            self._handleResponse(data, callback);
                        }, 600);
                        /*self._handleResponse(data, callback);*/
                    } else {
                        self._responeseError('end');
                    }
                    
                    self.options.state.isDuringLayout = false;
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
            var template = this.template,
                content = $.trim(this.template(data)), //$.trim 去掉开头空格，以动态创建由 jQuery 对象包装的 DOM 元素
                $content = $(content),
                $newItems = this._getItems($content)/*.css({ opacity: 0 }).animate({ opacity: 1 })*/;

            //处理后html插入瀑布流 
            this.$element.append($content);
            
            //排列瀑布流数据
            this.layout($newItems, callback);
            
            //隐藏loading
            this.$loading.hide();
        },
        
        /*
         * 请求数据失败
         * _responeseError
         */
        _responeseError: function(xhr) {
            var options = this.options;

            if (xhr !== 'destroy' && xhr !== 'end' && xhr !== 'failed' ) {
                xhr = 'unknown';
            }
            
            this._debug('Error', xhr);
            
            if (xhr === 'end' || options.state.isBeyondMaxPage) {
                
            }
            
            if ( xhr === 'failed' ) {
                this.$loading.html(options.loading.ajaxFailed);
            }
            
            
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
            
            console.log(state.isDuringLayout);
            
            // state.isDuringLayout 数据还没有排列完成 return
            // ajax数据正在请求还没有完成 return
            // 
            if ( state.isDuringLayout || state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
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
                newCols = this._getColumns(), //resize后获取页面可以显示列数
                i = 0,
                len;
            
            console.log('resize之前列数:' + cols);    
            console.log('resize之后列数:' + newCols);
            
            //列数没变化不调整
            //页面列数有变化时resize
            if ( newCols !== cols) {
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
        
    }
    
    
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Waterfall(this, options));
            }
        });
    };
    
}( jQuery, window, document ));
/*
 * To do
 * 改进瀑布流数据块算法 - ok
 * 瀑布流animate - ok
 * 优化动画效果
 * page path 方法
 * 插入数据时效果append effect
 * 测试ajax数据顺序
 * 跨域
 * 增加mustache有等模板支持
 * 增加公用方法
 * 数据居左、中、右
 * 数据块固定位置如居中，居左，在固定列等
 */
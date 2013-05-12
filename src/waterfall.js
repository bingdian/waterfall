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
            prefix: 'waterfall', //
            
            fitWidth: true, //是否自适应父元素宽度
            colWidth: 240,  //数据块每列宽度
            gutterWidth: 0, //数据块水平间距
            gutterHeight: 0, //数据块垂直间距
            minCol: 1,  //数据块最小列数
            maxPage: 5, //最多显示多少页数据
            diff: -100, //加载线
            
            containerStyle: { //瀑布流元素样式
                position: 'relative'
            },
            
            resizable: true, //缩放时是否触发数据重排
            animated: false, //重排数据是否显示动画
            
            autoLoad: true, //
            loading: 'loading...',  //数据加载中内容
            api: null,  //瀑布流数据api url, json数据
            params: {}, //瀑布流数据请求参数
            tpl: $('#waterfall-tpl').html()
        },
        
        // helper function for logging errors
        // $.error breaks jQuery chaining
        logError = function( message ) {
            if ( window.console ) {
                window.console.error( message );
            }
        };
    
    /*
     * Waterfall constructor
     */
    function Waterfall(element, options) {
        this.$element = $(element);
        this.options = $.extend( {}, defaults, options);
        this.colHeightArray = []; 
        this.loaded; //记录ajax请求数据是否加载完成
        this.page = 1;
        
        this._init();
    }
    
    
    Waterfall.prototype = {
        constructor: 'Waterfall',
        
        /*
         * 初始化瀑布流容器
         */
        _initContainer: function() {
            var options = this.options,
                prefix = options.prefix,
                loading = options.loading;
                
            this.$element.css(this.options.containerStyle).addClass(prefix);
            this.$element.append('<div class="' + prefix + '-container"></div><div class="' + prefix + '-loading">' +loading+ '</div>');
            
            this.$container = this.$element.find('.' + prefix + '-container');
            this.$loading = this.$element.find('.' + prefix + '-loading');
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
            var $items = $content.find('.' + this.options.itemCls).css({
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
        
        /**
         * 请求api数据
         */
        _requestData: function(callback) {
            var self = this,
                options = this.options,
                api = options.api;
                timestamp = new Date().getTime(),
                params = options.params;
                
            console.log('开始请求数据...');
            
            // page
            params.page = this.page;
            
            // 加载数据前显示loading
            this.$loading.show(); 
            
            $.ajax({
                url: api,
                data: params,
                dataType: 'json',
                //async: false, //同步请求,防止页面加载顺序错乱
                success: function(data) {
                    /* 模拟数据加载延迟
                    setTimeout(function() {
                        self._handleResponse(data, callback);
                    }, 2000);*/
                    self._handleResponse(data, callback);
                },
                error: function() {
                    logError('数据加载失败，请稍后再试。');
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
                content = this.template(data),
                $content = $('<div>' + content + '</div>'),
                $newItems = this._getItems($content);
            
            //处理后html插入瀑布流 
            this.$container.append($content);
            
            //排列瀑布流数据
            this.layout($newItems, callback);
            
            //隐藏loading
            this.$loading.hide();
            
            //更新瀑布流page
            this.page += 1;
        },
        
        
        /*
         * 设置数据块的位置
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
                y = minColHeight;
            
            //console.log(colHeightArray);console.log(x);
            
            $item.css({
                left: x,
                top: y
            });
            
            //更新colHeightArray高度
            colHeightArray[minColIndex] += $item.outerHeight() + gutterHeight;
            
            //item添加class
            $item.addClass('col-' + minColIndex);
        },
        
        /*
         * 排列数据块
         */
        layout: function($items, callback) {
            
            console.log('瀑布流数据开始排列 ...')
            
            for (var i = 0, len = $items.length; i < len; i++) {
                this._placeItems( $items[i] );
            }
            
            // 瀑布流数据块排列完成设置$container高度
            this.$container.height(Math.max.apply({}, this.colHeightArray));

            console.log('瀑布流数据排列完成 ... ');
            
            if ( callback ) {
                callback.call( $items );
            }
        },
        
        
        /*
         * 全部重排数据块
         */
        _reLayout: function( callback ) {
            var $items = this.$element.find('.' + this.options.itemCls);
            
            console.log('重排已有数据...');
            
            this._resetColumnsHeightArray(); //重置高度数组
            
            this.layout( $items, callback )
        },


        /*
         * scroll
         */
        _scroll: function() {
            var options = this.options,
                maxPage = options.maxPage,
                curPage = this.page,
                diff = options.diff,    //为正时可以看到瀑布流底部
                loadLine = $(window).scrollTop() + $(window).height() - this.$element.offset().top  - diff, //预加载线
                minColHeight = Math.min.apply({}, this.colHeightArray);
            
            if ( loadLine >  minColHeight) {
                this._requestData();
            }
        },
        
        
        /*
         * 页面滚动事件
         */
        _doScroll: function() {
            var _self = this,
                timer;
            
            $(window).bind('scroll', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    console.log('scroll ...');
                    _self._scroll();
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
         * 
         */
        _doResize: function() {
            var self = this,
                timer;

            $(window).bind('resize', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self._resize();
                }, 100); 
            });
        },
        

        /*
         * _init 初始化瀑布流
         * @callback {Object Function } 当实例再次被触发时回调函数 -> $el.waterfall();
         */
        _init: function( callback ) {
            var options = this.options,
                api = options.api,
                tpl = options.tpl;
                
            console.log('瀑布流初始化 ...');
            
            if ( !api ) {// 没有提供api
                logError('Invalid api');
                return;
            }
            
            if ( !tpl ) {// 没有提供模板
                logError('Template needed');
                return;
            }
            
            //template
            this.template = Handlebars.compile(tpl);

            this._setColumns();
            this._initContainer();
            this._resetColumnsHeightArray();
            this._reLayout( callback );
            
            this._doScroll();
            
            if ( options.resizable ) {
                this._doResize();
            }
            
            this._requestData();
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
 * 瀑布流animate
 * 插入数据时效果append effect
 * 测试ajax数据顺序
 * 跨域
 * 增加mustache有等模板支持
 * 增加公用方法
 * 数据居左、中、右
 * 数据块固定位置如居中，居左，在固定列等
 */
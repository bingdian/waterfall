# Waterfall

瀑布流布局插件, 类似于 [Pinterest](http://pinterest.com/)、[花瓣](http://huaban.com/)、[发现啦](http://faxianla.com/)。

[En](index.html) [中文](index-zh.html)

## 文档

### 下载

下载[waterfall插件](https://github.com/bingdian/waterfall/archive/master.tar.gz)最新版本。

### 使用

[min]: https://raw.github.com/bingdian/waterfall/master/build/waterfall.min.js
[max]: https://raw.github.com/bingdian/waterfall/master/build/waterfall.js

html：

    <div id="container"></div>
    
引入jquery，handlebars和waterfall(注：waterfall默认返回json格式数据并使用[handlebars](http://handlebarsjs.com/)模板渲染json数据，你也可以在options中配置使用其它javascript模板如[mustache](http://mustache.github.com/)解析json数据或者直接返回html):

    <script src="/path/jquery.min.js"></script>
    <script src="/path/handlebars.js"></script>
    <script src="/path/waterfall.min.js"></script>

template:

    <script id="waterfall-tpl" type="text/x-handlebars-template">
        //template content
    </script>

script:
    
    $('#container').waterfall({
		itemCls: 'waterfall-item', 
		prefix: 'waterfall',
		fitWidth: true, 
		colWidth: 240, 
		gutterWidth: 10,
		gutterHeight: 10,
		align: 'center',
		minCol: 1, 
		maxCol: undefined, 
		maxPage: undefined, 
		bufferPixel: -50, 
		containerStyle: {
			position: 'relative'
		},
		resizable: true, 
		isFadeIn: false,
		isAnimated: false,
		animationOptions: { 
		},
		isAutoPrefill: true,
		checkImagesLoaded: true,
		path: undefined,
		dataType: 'json', 
		params: {}, 
		headers: {}, 
		
		loadingMsg: '&lt;div style="text-align:center;padding:10px 0; color:#999;">&lt;img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt="">&lt;br />Loading...&lt;/div>',
		
		state: { 
			isDuringAjax: false, 
			isProcessingData: false, 
			isResizing: false,
			curPage: 1 
		},
	
		// callbacks
		callbacks: {
			/*
			 * loadingStart
			 * @param {Object} loading $('#waterfall-loading')
			 */
			loadingStart: function($loading) {
				$loading.show();
				//console.log('loading', 'start');
			},
			
			/*
			 * loadingFinished
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
			 * loadingError
			 * @param {String} xhr , "end" "error"
			 */
			loadingError: function($message, xhr) {
				$message.html('Data load faild, please try again later.');
			},
			
			/*
			 * renderData
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
		
		debug: false
	});
    
### options

<table>
    <tr>
        <th class="min-th">Name</th>
		<th class="min-th">Type</th>
		<th class="min-th">Default value</th>
		<th>Description</th>
    </tr>
    <tr>
        <td>itemCls</td>
        <td>String</td>
        <td>'waterfall-item'</td>
        <td>瀑布流数据块class</td>
    </tr>
    <tr>
        <td>prefix</td>
        <td>String</td>
        <td>'waterfall'</td>
        <td>瀑布流元素前辍</td>
    </tr>
    <tr>
        <td>fitWidth</td>
        <td>Boolean</td>
        <td>true</td>
        <td>是否自适应父元素宽度</td>
    </tr>
    <tr>
        <td>colWidth</td>
        <td>Integer</td>
        <td>240</td>
        <td>瀑布流每列的宽度</td>
    </tr>
    <tr>
        <td>gutterWidth</td>
        <td>Integer</td>
        <td>10</td>
        <td>数据块水平间距</td>
    </tr>
    <tr>
        <td>gutterHeight</td>
        <td>Integer</td>
        <td>10</td>
        <td>数据块垂直间距</td>
    </tr>
    <tr>
        <td>align</td>
        <td>String</td>
        <td>'center'</td>
        <td>数据块相对于容器对齐方式，'align', 'left', 'right'</td>
    </tr>
    <tr>
        <td>minCol</td>
        <td>Integer</td>
        <td>1</td>
        <td>数据块最小列数</td>
    </tr>
    <tr>
        <td>maxCol</td>
        <td>Integer</td>
        <td>undefined</td>
        <td>数据块最多显示列数,默认undefined，最大列数无限制</td>
    </tr>
    <tr>
        <td>maxPage</td>
        <td>Integer</td>
        <td>undefined</td>
        <td>最多显示多少页数据,默认undefined，无限下拉</td>
    </tr>
    <tr>
        <td>bufferPixel</td>
        <td>Integer</td>
        <td>-50</td>
        <td>滚动时, 窗口底部到瀑布流最小高度列的距离 > bufferPixel时, 自动加载新数据</td>
    </tr>
    <tr>
        <td>containerStyle</td>
        <td>Object</td>
        <td>{position: 'relative'}</td>
        <td>瀑布流默认样式</td>
    </tr>
    <tr>
        <td>resizable</td>
        <td>Boolean</td>
        <td>true</td>
        <td>缩放时是否触发数据重排</td>
    </tr>
    <tr>
        <td>isFadeIn</td>
        <td>Boolean</td>
        <td>false</td>
        <td>新插入数据是否使用fade动画</td>
    </tr>
    <tr>
        <td>isAnimated</td>
        <td>Boolean</td>
        <td>false</td>
        <td>resize时数据是否显示动画</td>
    </tr>
    <tr>
        <td>animationOptions</td>
        <td>Object</td>
        <td>{}</td>
        <td>resize动画效果，isAnimated为true时有效</td>
    </tr>
    <tr>
        <td>isAutoPrefill</td>
        <td>Boolean</td>
        <td>true</td>
        <td>当文档小于窗口可见区域，自动加载数据</td>
    </tr>
    <tr>
        <td>checkImagesLoaded</td>
        <td>Boolean</td>
        <td>true</td>
        <td>是否图片加载完成后开始排列数据块。如果直接后台输出图片尺寸，可设置为false，强烈建议从后台输出图片尺寸，设置为false</td>
    </tr>
    <tr>
        <td>path</td>
        <td>Array, Function</td>
        <td>undefined</td>
        <td>瀑布流数据分页url，可以是数组如["/popular/page/", "/"] => "/popular/page/1/"，或者是根据分页返回一个url方法如：function(page) { return '/populr/page/' + page; } => "/popular/page/1/"</td>
    </tr>
    <tr>
        <td>dataType</td>
        <td>String</td>
        <td>'json'</td>
        <td>瀑布流返回数据格式，'json', 'jsonp', 'html'</td>
    </tr>
    <tr>
        <td>params</td>
        <td>Object</td>
        <td>{}</td>
        <td>瀑布流数据请求参数,{type: "popular", tags: "travel", format: "json"} => "type=popular&tags=travel&format=json"</td>
    </tr>
    <tr>
        <td>headers</td>
        <td>Object</td>
        <td>{}</td>
        <td></td>
    </tr>
    <tr>
        <td>loadingMsg</td>
        <td>Html</td>
        <td>见下面代码</td>
        <td>加载提示进度条，html</td>
    </tr>
    <tr>
        <td>callbacks</td>
        <td>Object</td>
        <td>见下面代码</td>
        <td>callback</td>
    </tr>
    <tr>
        <td>debug</td>
        <td>Boolean</td>
        <td>false</td>
        <td>开启debug</td>
    </tr>
</table>

loadingMsg:

    '&lt;div style="text-align:center;padding:10px 0; color:#999;">&lt;img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt="">&lt;br />Loading...&lt;/div>'

callbacks:

    callbacks: {
        /*
         * ajax请求开始之前
         * @param {Object} loading $('#waterfall-loading')
         */
        loadingStart: function($loading) {
            $loading.show();
        },
        
        /*
         * ajax请求加载完成
         * @param {Object} loading $('#waterfall-loading')
         * @param {Boolean} isBeyondMaxPage
         */
        loadingFinished: function($loading, isBeyondMaxPage) {
            if ( !isBeyondMaxPage ) {
                $loading.fadeOut();
            } else {
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
    }
            

### method

    $('#container').waterfall( 'methodName', [optionalParameters] );

**prepend**

    $('#container').waterfall('prepend', $content, callback);
    
**append**
    
    $('#container').waterfall('append', $content, callback);
    
**removeItems**
    
    $('#container').waterfall('removeItems', $items, callback);

**reLayout**

    $('#container').waterfall('reLayout', $content, callback);

**pause**

    $('#container').waterfall('pause', callback);
    
**resume**

    $('#container').waterfall('resume', callback);

**option**
    
    $('#container').waterfall('option', options, callback);
    
## Demos
 
 * [无限下拉数据](http://wlog.cn/demo/waterfall/infinitescroll.html)
 * [有限下拉数据完成后显示分页](http://wlog.cn/demo/waterfall/finitescroll.html)
 * [瀑布流固定宽度](http://wlog.cn/demo/waterfall/custom-width.html)
 * [自定义最大列最小列](http://wlog.cn/demo/waterfall/min-max-columns.html)
 * [resize动画效果](http://wlog.cn/demo/waterfall/animate.html)
 * [加载数据时fadeIn效果](http://wlog.cn/demo/waterfall/fadein.html)
 * [左侧或右侧固定列](http://wlog.cn/demo/waterfall/fixed-left-or-right.html)
 * [使用其它模板如mustache解析json数据](http://wlog.cn/demo/waterfall/mustache.html)
 * [ajax加载html格式](http://wlog.cn/demo/waterfall/html.html)
 * [ajax加载jsonp格式](http://wlog.cn/demo/waterfall/jsonp.html)
 * [没有更多数据处理](http://wlog.cn/demo/waterfall/no-more-data.html)
 * [methods](http://wlog.cn/demo/waterfall/methods.html)

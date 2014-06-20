# Waterfall

jquery waterfall plugin,like [Pinterest](http://pinterest.com/)、[huaban.com](http://huaban.com/)、[faxianla.com](http://faxianla.com/)

[En](index.html) [中文](index-zh.html)

## Documentation

### Download

Download the latest [waterfall plugin](https://github.com/bingdian/waterfall/archive/master.tar.gz)。

### Getting started

Markup:

    <div id="container"></div>

Add jQuery, [handlebars](http://handlebarsjs.com/) and the Waterfall script. (You can also use other javascript template,see [demo](http://wlog.cn/demo/waterfall/mustache.html))

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
        <td>the waterfall brick element class</td>
    </tr>
    <tr>
        <td>prefix</td>
        <td>String</td>
        <td>'waterfall'</td>
        <td>waterfall elements prefix</td>
    </tr>
    <tr>
        <td>fitWidth</td>
        <td>Boolean</td>
        <td>true</td>
        <td>fit the parent element width</td>
    </tr>
    <tr>
        <td>colWidth</td>
        <td>Integer</td>
        <td>240</td>
        <td>column width</td>
    </tr>
    <tr>
        <td>gutterWidth</td>
        <td>Integer</td>
        <td>10</td>
        <td>the waterfall brick element horizontal gutter</td>
    </tr>
    <tr>
        <td>gutterHeight</td>
        <td>Integer</td>
        <td>10</td>
        <td>the waterfall brick element vertical gutter</td>
    </tr>
    <tr>
        <td>align</td>
        <td>String</td>
        <td>'center'</td>
        <td>'align', 'left', 'right'</td>
    </tr>
    <tr>
        <td>minCol</td>
        <td>Integer</td>
        <td>1</td>
        <td>min columns</td>
    </tr>
    <tr>
        <td>maxCol</td>
        <td>Integer</td>
        <td>undefined</td>
        <td>max columns</td>
    </tr>
    <tr>
        <td>maxPage</td>
        <td>Integer</td>
        <td>undefined</td>
        <td>max page</td>
    </tr>
    <tr>
        <td>bufferPixel</td>
        <td>Integer</td>
        <td>-50</td>
        <td>decrease this number if you want scroll to fire quicker</td>
    </tr>
    <tr>
        <td>containerStyle</td>
        <td>Object</td>
        <td>{position: 'relative'}</td>
        <td>the waterfall container style</td>
    </tr>
    <tr>
        <td>resizable</td>
        <td>Boolean</td>
        <td>true</td>
        <td>triggers layout when browser window is resized</td>
    </tr>
    <tr>
        <td>isFadeIn</td>
        <td>Boolean</td>
        <td>false</td>
        <td>append html effect</td>
    </tr>
    <tr>
        <td>isAnimated</td>
        <td>Boolean</td>
        <td>false</td>
        <td>triggers animate when browser window is resized </td>
    </tr>
    <tr>
        <td>animationOptions</td>
        <td>Object</td>
        <td>{}</td>
        <td>animation options</td>
    </tr>
    <tr>
        <td>isAutoPrefill</td>
        <td>Boolean</td>
        <td>true</td>
        <td>When the document is smaller than the window, load data until the document is larger</td>
    </tr>
    <tr>
        <td>checkImagesLoaded</td>
        <td>Boolean</td>
        <td>true</td>
        <td>triggers layout when images loaded. Suggest false</td>
    </tr>
    <tr>
        <td>path</td>
        <td>Array, Function</td>
        <td>undefined</td>
        <td>Either parts of a URL as an array (e.g. ["/popular/page/", "/"] or a function that takes in the page number and returns a URL(e.g. function(page) { return '/populr/page/' + page; })</td>
    </tr>
    <tr>
        <td>dataType</td>
        <td>String</td>
        <td>'json'</td>
        <td>'json', 'jsonp', 'html'</td>
    </tr>
    <tr>
        <td>params</td>
        <td>Object</td>
        <td>{}</td>
        <td>params,{type: "popular", tags: "travel", format: "json"} => "type=popular&tags=travel&format=json"</td>
    </tr>
    <tr>
        <td>headers</td>
        <td>Object</td>
        <td>{}</td>
        <td>Custom header fields that get passed directly to jQuery.ajax()</td>
    </tr>
    <tr>
        <td>loadingMsg</td>
        <td>html</td>
        <td></td>
        <td>loading html</td>
    </tr>
    <tr>
        <td>callbacks</td>
        <td>Object</td>
        <td></td>
        <td>callback</td>
    </tr>
    <tr>
        <td>debug</td>
        <td>Boolean</td>
        <td>false</td>
        <td>enable debug</td>
    </tr>
</table>

loadingMsg:

    '&lt;div style="text-align:center;padding:10px 0; color:#999;">&lt;img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt="">&lt;br />Loading...&lt;/div>'

callbacks:

    callbacks: {
        /*
         * loading start 
         * @param {Object} loading $('#waterfall-loading')
         */
        loadingStart: function($loading) {
            $loading.show();
        },
        
        /*
         * loading finished
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
 
 * [infinitescroll](http://wlog.cn/demo/waterfall/infinitescroll.html)
 * [finitescroll](http://wlog.cn/demo/waterfall/finitescroll.html)
 * [custom width](http://wlog.cn/demo/waterfall/custom-width.html)
 * [min-max-columns](http://wlog.cn/demo/waterfall/min-max-columns.html)
 * [resize animate](http://wlog.cn/demo/waterfall/animate.html)
 * [fadeIn](http://wlog.cn/demo/waterfall/fadein.html)
 * [fix brick left or right](http://wlog.cn/demo/waterfall/fixed-left-or-right.html)
 * [use mustache template](http://wlog.cn/demo/waterfall/mustache.html)
 * [html datatype](http://wlog.cn/demo/waterfall/html.html)
 * [jsonp datatype](http://wlog.cn/demo/waterfall/jsonp.html)
 * [no more data](http://wlog.cn/demo/waterfall/no-more-data.html)
 * [methods](http://wlog.cn/demo/waterfall/methods.html)

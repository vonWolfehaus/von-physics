
// DOM utility functions

define(function() {
	return {
		copySpatial: function(fromElement, toElement) {
			var rect = fromElement.getBoundingClientRect(), //this.getOffsetRect(fromElement)
				aStyle = fromElement.style,
				bStyle = toElement.style;
			
			bStyle.position = 'absolute';
			bStyle.top = rect.top+'px';
			bStyle.left = rect.left+'px';
			
			if (fromElement.nodeName === 'CANVAS') {
				toElement.width = fromElement.width;
				toElement.height = fromElement.height;
			} else {
				bStyle.width = fromElement.offsetWidth; //aStyle.width;
				bStyle.height = fromElement.offsetHeight; //aStyle.height;
			}
			
		},
		
		/*getOffsetRect: function(element) {
			var left = 0, top = 0,
				w = element.offsetWidth,
				h = element.offsetHeight;
			
			while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
				left += element.offsetLeft - element.scrollLeft;
				top += element.offsetTop - element.scrollTop;
				console.log(element.nodeName);
				element = element.offsetParent;
			}
			
			return {
				top: top,
				left: left,
				right: left + w,
				bottom: top + h,
			};
		}*/
	};
});
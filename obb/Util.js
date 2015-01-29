/**
 * 工具类
 */
var Util = {
	/**
	 * 两点间距离
	 */
	distance: function(p1, p2) {
		return Math.sqrt(this.sqr(p2.x - p1.x) + this.sqr(p2.y - p1.y));
	},
	/**
	 * 平方
	 */
	sqr: function(n) {
		return n * n;
	}
}
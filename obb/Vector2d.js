var Vector2d = function(x, y) {
		this.x = x;
		this.y = y;
	};

Vector2d.prototype = {
	/**
	 * 向量的值
	 */
	get magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	/**
	 * 获取向量对应的单位向量
	 */
	get unitVector() {
		return new Vector2d(this.x / this.magnitude, this.y / this.magnitude);
	},
	/**
	 * 向量的点积
	 */
	dotProduct: function(vector) {
		return this.x * vector.x + this.y * vector.y;
	},
	/**
	 * 向量的和
	 */
	add: function(vector) {
		return new Vector2d(this.x + vector.x, this.y + vector.y);
	},
	/**
	 * 向量的差
	 */
	minus: function(vector) {
		return new Vector2d(this.x - vector.x, this.y - vector.y);
	},
	scale: function(s) {
		return new Vector2d(this.x * s, this.y * s);
	},
	rotate: function(angle, axis) {
		var x = this.x - axis.x;
		var y = this.y - axis.y;

		var x_prime = axis.x + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
		var y_prime = axis.y + ((x * Math.sin(angle)) + (y * Math.cos(angle)));

		return new Vector2d(x_prime, y_prime);
	},
	cross: function(vector) {
		return (this.x * vector.y - this.y * vector.x);
	},
	/**
	 * 向量左法线
	 */
	get leftNormal() {
		return new Vector2d(this.y, -this.x);
	},
	/**
	 * 向量右法线
	 */
	get rightNormal() {
		return new Vector2d(-this.y, this.x);
	}
};

/**
 * 获取指定度数的单位向量
 */
Vector2d.unitVector = function(deg) {
	return new Vector2d(Math.cos(Math.PI * deg / 180), Math.sin(Math.PI * deg / 180));
};
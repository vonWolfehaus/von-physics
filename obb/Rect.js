
var Rect = function(center, width, height, deg, velocity) {
	this.center = center;
	this.width = width;
	this.height = height;
	this.deg = deg || 0;
	this.color = "blue";

	this.velocity = velocity || new Vec2(0, 0);
};

Rect.prototype = {
	draw: function(context) {
		var points = this.getPoints(),
			prePoint;

		context.save();
		context.beginPath();
		points.forEach(function(p) {
			if (prePoint) {
				context.lineTo(p.x, p.y);
			} else {
				context.moveTo(p.x, p.y);
			}
			prePoint = p;
		});
		prePoint && context.lineTo(points[0].x, points[0].y);
		context.closePath();
		context.fillStyle = this.color;
		context.fill();
		context.stroke();
		context.restore();
	},
	
	update: function(d) {
		d = d || 1;
		this.center.x += d * this.velocity.x;
		this.center.y += d * this.velocity.y;
		// put getPoints here
	},
	
	getPoints: function() {
		var points = [],
			uv1 = Vec2.unitVector(this.deg),
			uv2 = Vec2.unitVector(this.deg + 90),
			uv3 = Vec2.unitVector(-this.deg),
			uv4 = Vec2.unitVector(90 - this.deg),
			cx = this.center.dotProduct(uv1),
			cy = this.center.dotProduct(uv2);

		points.push(new Vec2(cx - this.width / 2, cy - this.height / 2));
		points.push(new Vec2(cx + this.width / 2, cy - this.height / 2));
		points.push(new Vec2(cx + this.width / 2, cy + this.height / 2));
		points.push(new Vec2(cx - this.width / 2, cy + this.height / 2));

		return points.map(function(p) {
			return new Vec2(p.dotProduct(uv3), p.dotProduct(uv4));
		});
	},
	
	getVectors: function() {
		var points = this.getPoints(),
			v1 = new Vec2(points[1].x - points[0].x, points[1].y - points[0].y),
			v2 = new Vec2(points[3].x - points[0].x, points[3].y - points[0].y);

		return [v1, v2];
	},
	
	getMaxMinProjection: function(axis) {
		var points = this.getPoints(),
			i, pj, max, min;
		
		for (i = 0; i < points.length; i++) {
			pj = points[i].dotProduct(axis);
			if (min == null || min > pj) min = pj;
			if (max == null || max < pj) max = pj;
		}
		/*points.forEach(function(p) {
			var pj = p.dotProduct(axis);
			(min == null || min > pj) && (min = pj);
			(max == null || max < pj) && (max = pj);
		});*/

		return {
			max: max,
			min: min
		};
	},
	
	containPoint: function(point) {
		var normals = this.getVectors().map(function(v) {
			return v.leftNormal.unitVector;
		}),
			dotV = new Vec2(point.x, point.y),
			rect = this,
			isContain = true;

		normals.forEach(function(axis) {
			var maxmin = rect.getMaxMinProjection(axis),
				cpj = dotV.dotProduct(axis);

			if (cpj < maxmin.min || cpj > maxmin.max) {
				isContain = false;
				return false;
			}
		});

		return isContain;
	},
	
	isSAT: function(normal, point) {
		var points = this.getPoints(),
			len = points.length;

		for(var i = 0; i < len; i++) {
			if(points[i].minus(point).dotProduct(normal) < 0) {
				return false;
			}
		}

		return true;
	}
};

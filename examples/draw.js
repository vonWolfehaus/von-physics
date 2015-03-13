
vgp.draw = {
	circle: function(ctx, pos, radius, color) {
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, radius, 0, vgp.utils.TAU, false);
		ctx.closePath();
		ctx.fillStyle = color || 'rgba(250, 10, 10, 0.6)';
		ctx.fill();
	},
	
	rect: function(ctx, pos, width, height, color) {
		ctx.fillStyle = color || 'rgba(250, 10, 10, 0.6)';
		ctx.fillRect(pos.x, pos.y, width, height);
	},
	
	outline: function(ctx, pos, width, height, color) {
		ctx.strokeStyle = color || 'rgba(250, 10, 10, 0.6)';
		ctx.strokeRect(pos.x, pos.y, width, height);
	},
	
	polygon: function(ctx, pos, verts, color) {
		var i, v = verts[0];
		ctx.fillStyle = color || 'rgba(250, 10, 10, 0.6)';
		ctx.beginPath();
		ctx.moveTo(v.x + pos.x, v.y + pos.y);
		for (i = 1; i < verts.length; i++) {
			v = verts[i];
			ctx.lineTo(v.x + pos.x, v.y + pos.y);
		}
		ctx.closePath();
		ctx.fill();
	},
	
	collider: function(body, color) {
		switch (body.type) {
			case vgp.Type.AABB2:
				this.rect(game.world.context, body.min, body.width, body.height, color);
				break;
			case vgp.Type.CIRCLE:
				this.circle(game.world.context, body.position, body.radius, color);
				break;
		}
	}
};
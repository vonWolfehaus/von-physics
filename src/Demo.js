require.config({
	baseUrl: 'src'
});

require(['core/Engine', 'core/Kai', 'core/CommTower',
        'Aabb2State', 'AabbTHREEState', 'RadialState'],
	function(Engine, Kai, Tower,
			Aabb2State, AabbTHREEState, RadialState) {
		
		var i, buttons = document.getElementsByTagName('button');
		var engine = new Engine();
		
		engine.state.add('Aabb2State', Aabb2State);
		// engine.state.add('AabbTHREEState', AabbTHREEState);
		engine.state.add('RadialState', RadialState);
		
		engine.start('Aabb2State');
		
		for (i = 0; i < buttons.length; i++) {
			buttons[i].addEventListener('mouseup', buttonPress, false);
		}
		
		function buttonPress(evt) {
			if (this.disabled || Kai.inputBlocked) return;
			Tower.requestState.dispatch(this.dataset.state);
			
			// re-enable the previously-selected button... with a sledge hammer
			for (i = 0; i < buttons.length; i++) {
				if (!!buttons[i].getAttribute('disabled')) {
					buttons[i].removeAttribute('disabled');
				}
			}
			
			this.setAttribute('disabled', 'disabled');
		}
		
});
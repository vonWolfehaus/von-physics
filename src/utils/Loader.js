/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2013 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */
define(function(require) {

var Kai = require('core/Kai');

var Loader = function() {
	
	/**
	 * If you want to append a URL before the path of any asset you can set this here.
	 * Useful if you need to allow an asset url to be configured outside of the game code.
	 * MUST have / on the end of it!
	 * @property {string} baseURL
	 * @default ''
	 */
	this.baseURL = '';
	this.crossOrigin = '';
	this.isLoading = false;
	this.progress = 0;
	
	this.onFileComplete = new Signal();
	this.onFileError = new Signal();
	this.onLoadStart = new Signal();
	this.onLoadComplete = new Signal();
	
	this._fileList = [];
	this._fileIndex = 0;
	
	
	this._xhr = new XMLHttpRequest();
};

Loader.prototype = {
	
	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/
	
	image: function (key, url, overwrite) {

		if (typeof overwrite === "undefined") { overwrite = false; }

		if (overwrite)
		{
			this._replaceInFileList('image', key, url);
		}
		else
		{
			this._addToFileList('image', key, url);
		}

		return this;

	},
	
	/**
	 * Add a new sprite sheet to the loader.
	 *
	 * @param {string} key - Unique asset key of the sheet file.
	 * @param {string} url - URL of the sheet file.
	 * @param {number} frameWidth - Width of each single frame.
	 * @param {number} frameHeight - Height of each single frame.
	 * @param {number} [frameMax=-1] - How many frames in this sprite sheet. If not specified it will divide the whole image into frames.
	 * @return {Phaser.Loader} This Loader instance.
	 */
	spritesheet: function (key, url, frameWidth, frameHeight, frameMax) {

		if (typeof frameMax === "undefined") { frameMax = -1; }

		this._addToFileList('spritesheet', key, url, { frameWidth: frameWidth, frameHeight: frameHeight, frameMax: frameMax });

		return this;
	},
	
	/**
	 * Add a text file to the Loader.
	 *
	 * @param {string} key - Unique asset key of the text file.
	 * @param {string} url - URL of the text file.
	 * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
	 * @return {Phaser.Loader} This Loader instance.
	 */
	text: function (key, url, overwrite) {

		if (typeof overwrite === "undefined") { overwrite = false; }

		if (overwrite)
		{
			this._replaceInFileList('text', key, url);
		}
		else
		{
			this._addToFileList('text', key, url);
		}

		return this;

	},
	
	/**
	* Add a new audio file to the loader.
	*
	* @method Phaser.Loader#audio
	* @param {string} key - Unique asset key of the audio file.
	* @param {Array|string} urls - An array containing the URLs of the audio files, i.e.: [ 'jump.mp3', 'jump.ogg', 'jump.m4a' ] or a single string containing just one URL.
	* @param {boolean} autoDecode - When using Web Audio the audio files can either be decoded at load time or run-time. They can't be played until they are decoded, but this let's you control when that happens. Decoding is a non-blocking async process.
	* @return {Phaser.Loader} This Loader instance.
	*/
	audio: function (key, urls, autoDecode) {

		if (typeof autoDecode === "undefined") { autoDecode = true; }

		this.addToFileList('audio', key, urls, { buffer: null, autoDecode: autoDecode });

		return this;

	},
	
	/**
	 * Remove loading request of a file.
	 *
	 * @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
	 * @param {string} key - Key of the file you want to remove.
	 */
	removeFile: function (type, key) {

		var file = this.getAsset(type, key);

		if (file !== false)
		{
			this._fileList.splice(file.index, 1);
		}

	},

	/**
	* Remove all file loading requests.
	*
	*/
	removeAll: function () {

		this._fileList.length = 0;

	},

	/**
	* Start loading the assets. Normally you don't need to call this yourself as the StateManager will do so.
	*
	* @method Phaser.Loader#start
	*/
	start: function () {

		if (this.isLoading)
		{
			return;
		}

		this.progress = 0;
		this.hasLoaded = false;
		this.isLoading = true;

		this.onLoadStart.dispatch(this._fileList.length);

		if (this._fileList.length > 0)
		{
			this._fileIndex = 0;
			this._progressChunk = 100 / this._fileList.length;
			this._loadFile();
		}
		else
		{
			this.progress = 100;
			this.hasLoaded = true;
			this.onLoadComplete.dispatch();
		}

	},
	
	reset: function () {

		this.preloadSprite = null;
		this.isLoading = false;
		this._fileList.length = 0;
		this._fileIndex = 0;

	},
	
	/**
	 * Gets the asset that is queued for load.
	 *
	 * @param {string} type - The type asset you want to check.
	 * @param {string} key - Key of the asset you want to check.
	 * @return {any} Returns an object if found that has 2 properties: index and file. Otherwise false.
	 */
	getAsset: function (type, key) {

		if (this._fileList.length > 0)
		{
			for (var i = 0; i < this._fileList.length; i++)
			{
				if (this._fileList[i].type === type && this._fileList[i].key === key)
				{
					return { index: i, file: this._fileList[i] };
				}
			}
		}

		return false;
		
	},

	/**
	* Returns the number of files that have already been loaded, even if they errored.
	*
	* @return {number} The number of files that have already been loaded (even if they errored)
	*/
	totalLoadedFiles: function () {

		var total = 0;

		for (var i = 0; i < this._fileList.length; i++)
		{
			if (this._fileList[i].loaded)
			{
				total++;
			}
		}

		return total;

	},

	/**
	* Returns the number of files still waiting to be processed in the load queue. This value decreases as each file is in the queue is loaded.
	*
	* @return {number} The number of files that still remain in the load queue.
	*/
	totalQueuedFiles: function () {
		var i, total = 0;

		for (i = 0; i < this._fileList.length; i++) {
			if (this._fileList[i].loaded === false) {
				total++;
			}
		}

		return total;
	},
	
	/**
	 * Check whether asset exists with a specific key.
	 *
	 * @method Phaser.Loader#checkKeyExists
	 * @param {string} type - The type asset you want to check.
	 * @param {string} key - Key of the asset you want to check.
	 * @return {boolean} Return true if exists, otherwise return false.
	 */
	checkKeyExists: function (type, key) {
		if (this._fileList.length > 0)
		{
			for (var i = 0; i < this._fileList.length; i++)
			{
				if (this._fileList[i].type === type && this._fileList[i].key === key)
				{
					return true;
				}
			}
		}

		return false;
	},
	
	
	/*-------------------------------------------------------------------------------
									PRIVATE
	-------------------------------------------------------------------------------*/
	
	/**
	* Internal function that adds a new entry to the file list. Do not call directly.
	*
	* @method Phaser.Loader#_addToFileList
	* @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
	* @param {string} key - The unique Cache ID key of this resource.
	* @param {string} url - The URL the asset will be loaded from.
	* @param {object} properties - Any additional properties needed to load the file.
	* @protected
	*/
	_addToFileList: function (type, key, url, properties) {

		var entry = {
			type: type,
			key: key,
			url: url,
			data: null,
			error: false,
			loaded: false
		};

		if (typeof properties !== "undefined")
		{
			for (var prop in properties)
			{
				entry[prop] = properties[prop];
			}
		}

		if (this.checkKeyExists(type, key) === false)
		{
			this._fileList.push(entry);
		}

	},
	
	/**
	* Internal function that replaces an existing entry in the file list with a new one. Do not call directly.
	*
	* @method Phaser.Loader#_replaceInFileList
	* @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
	* @param {string} key - The unique Cache ID key of this resource.
	* @param {string} url - The URL the asset will be loaded from.
	* @param {object} properties - Any additional properties needed to load the file.
	* @protected
	*/
	_replaceInFileList: function (type, key, url, properties) {

		var entry = {
			type: type,
			key: key,
			url: url,
			data: null,
			error: false,
			loaded: false
		};

		if (typeof properties !== "undefined")
		{
			for (var prop in properties)
			{
				entry[prop] = properties[prop];
			}
		}

		if (this.checkKeyExists(type, key) === false)
		{
			this._fileList.push(entry);
		}

	},
	
	

	/**
	* Load files. Private method ONLY used by loader.
	*
	* @method Phaser.Loader#_loadFile
	* @private
	*/
	_loadFile: function () {

		if (!this._fileList[this._fileIndex])
		{
			console.warn('Phaser.Loader _loadFile invalid index ' + this._fileIndex);
			return;
		}

		var file = this._fileList[this._fileIndex];
		var self = this;

		//  Image or Data?
		switch (file.type) {
			case 'image':
			case 'spritesheet':
			case 'textureatlas':
			case 'bitmapfont':
			case 'tileset':
				file.data = new Image();
				file.data.name = file.key;
				file.data.onload = function () {
					return self._fileComplete(self._fileIndex);
				};
				file.data.onerror = function () {
					return self._fileError(self._fileIndex);
				};
				file.data.crossOrigin = this.crossOrigin;
				file.data.src = this.baseURL + file.url;
				break;

			case 'audio':
				/*file.url = this._getAudioURL(file.url);

				if (file.url !== null)
				{
					//  WebAudio or Audio Tag?
					if (this.game.sound.usingWebAudio)
					{
						this._xhr.open("GET", this.baseURL + file.url, true);
						this._xhr.responseType = "arraybuffer";
						this._xhr.onload = function () {
							return self._fileComplete(self._fileIndex);
						};
						this._xhr.onerror = function () {
							return self._fileError(self._fileIndex);
						};
						this._xhr.send();
					}
					else if (this.game.sound.usingAudioTag)
					{
						if (this.game.sound.touchLocked)
						{
							//  If audio is locked we can't do this yet, so need to queue this load request. Bum.
							file.data = new Audio();
							file.data.name = file.key;
							file.data.preload = 'auto';
							file.data.src = this.baseURL + file.url;
							this._fileComplete(this._fileIndex);
						}
						else
						{
							file.data = new Audio();
							file.data.name = file.key;
							file.data.onerror = function () {
								return self._fileError(self._fileIndex);
							};
							file.data.preload = 'auto';
							file.data.src = this.baseURL + file.url;
							file.data.addEventListener('canplaythrough', Phaser.GAMES[this.game.id].load._fileComplete(this._fileIndex), false);
							file.data.load();
						}
					}
				}
				else
				{
					this._fileError(this._fileIndex);
				}*/

				break;

			case 'text':
				this._xhr.open("GET", this.baseURL + file.url, true);
				this._xhr.responseType = "text";
				this._xhr.onload = function () {
					return self._fileComplete(self._fileIndex);
				};
				this._xhr.onerror = function () {
					return self._fileError(self._fileIndex);
				};
				this._xhr.send();
				break;
		}

	},
	
	/**
	* Handle loading next file.
	*
	* @param {number} previousIndex - Index of the previously loaded asset.
	* @param {boolean} success - Whether the previous asset loaded successfully or not.
	* @private
	*/
	_nextFile: function (previousIndex, success) {

		this.progress = Math.round(this.progress + this._progressChunk);

		if (this.progress > 100)
		{
			this.progress = 100;
		}

		if (this.preloadSprite !== null)
		{
			if (this.preloadSprite.direction === 0)
			{
				this.preloadSprite.crop.width = Math.floor((this.preloadSprite.width / 100) * this.progress);
			}
			else
			{
				this.preloadSprite.crop.height = Math.floor((this.preloadSprite.height / 100) * this.progress);
			}

			this.preloadSprite.sprite.crop = this.preloadSprite.crop;
		}

		this.onFileComplete.dispatch(this.progress, this._fileList[previousIndex].key, success, this.totalLoadedFiles(), this._fileList.length);

		if (this.totalQueuedFiles() > 0)
		{
			this._fileIndex++;
			this.loadFile();
		}
		else
		{
			this.hasLoaded = true;
			this.isLoading = false;
			
			this.removeAll();
			
			this.onLoadComplete.dispatch();
		}

	},
	
	/**
	 * Private method ONLY used by loader.
	 * @method Phaser.Loader#_getAudioURL
	 * @param {array|string} urls - Either an array of audio file URLs or a string containing a single URL path.
	 * @private
	 */
	_getAudioURL: function (urls) {

		/*var extension;

		if (typeof urls === 'string') { urls = [urls]; }

		for (var i = 0; i < urls.length; i++)
		{
			extension = urls[i].toLowerCase();
			extension = extension.substr((Math.max(0, extension.lastIndexOf(".")) || Infinity) + 1);

			if (this.game.device.canPlayAudio(extension))
			{
				return urls[i];
			}

		}*/

		return null;

	},

	/**
	 * Error occured when loading a file.
	 *
	 * @method Phaser.Loader#_fileError
	 * @param {number} index - The index of the file in the file queue that errored.
	 */
	_fileError: function (index) {

		this._fileList[index].loaded = true;
		this._fileList[index].error = true;

		this.on_fileError.dispatch(this._fileList[index].key, this._fileList[index]);

		console.warn("Phaser.Loader error loading file: " + this._fileList[index].key + ' from URL ' + this._fileList[index].url);

		this._nextFile(index, false);

	},

	/**
	 * Called when a file is successfully loaded.
	 *
	 * @method Phaser.Loader#_fileComplete
	 * @param {number} index - The index of the file in the file queue that loaded.
	 */
	_fileComplete: function (index) {

		if (!this._fileList[index])
		{
			console.warn('Phaser.Loader _fileComplete invalid index ' + index);
			return;
		}
		

		var file = this._fileList[index];
		file.loaded = true;

		var loadNext = true;
		var self = this;

		switch (file.type)
		{
			case 'image':

				Kai.cache.addImage(file.key, file.url, file.data);
				break;

			case 'spritesheet':

				Kai.cache.addSpriteSheet(file.key, file.url, file.data, file.frameWidth, file.frameHeight, file.frameMax);
				break;

			case 'tileset':

				Kai.cache.addTileset(file.key, file.url, file.data, file.tileWidth, file.tileHeight, file.tileMax, file.tileMargin, file.tileSpacing);
				break;

			case 'audio':

				/*if (this.game.sound.usingWebAudio)
				{
					file.data = this._xhr.response;

					Kai.cache.addSound(file.key, file.url, file.data, true, false);

					if (file.autoDecode)
					{
						Kai.cache.updateSound(key, 'isDecoding', true);

						var that = this;
						var key = file.key;

						this.game.sound.context.decodeAudioData(file.data, function (buffer) {
							if (buffer)
							{
								that.game.cache.decodedSound(key, buffer);
							}
						});
					}
				}
				else
				{
					file.data.removeEventListener('canplaythrough', Phaser.GAMES[this.game.id].load._fileComplete);
					Kai.cache.addSound(file.key, file.url, file.data, false, true);
				}*/
				break;

			case 'text':
				file.data = this._xhr.responseText;
				Kai.cache.addText(file.key, file.url, file.data);
				break;

			case 'script':
				file.data = document.createElement('script');
				file.data.language = 'javascript';
				file.data.type = 'text/javascript';
				file.data.defer = false;
				file.data.text = this._xhr.responseText;
				document.head.appendChild(file.data);
				break;
		}

		if (loadNext)
		{
			this._nextFile(index, true);
		}

	},

	/**
	 * Successfully loaded a JSON file.
	 *
	 * @method Phaser.Loader#_jsonLoadComplete
	 * @param {number} index - The index of the file in the file queue that loaded.
	 */
	_jsonLoadComplete: function (index) {

		if (!this._fileList[index])
		{
			console.warn('Phaser.Loader _jsonLoadComplete invalid index ' + index);
			return;
		}

		var file = this._fileList[index];
		var data = JSON.parse(this._xhr.responseText);

		file.loaded = true;

		if (file.type === 'tilemap')
		{
			Kai.cache.addTilemap(file.key, file.url, data, file.format);
		}
		else
		{
			Kai.cache.addTextureAtlas(file.key, file.url, file.data, data, file.format);
		}

		this._nextFile(index, true);

	}
};

return Loader;

});
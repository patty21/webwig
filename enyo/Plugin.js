/**
 * result from backend
 * {type = error, message = chyba}
 * {type = ok, data = [...]}
 */

enyo.kind({
	name: "WIGApp.Plugin",
	kind: "enyo.Hybrid",
	executable: "wig",

	create: function() {
		this.inherited(arguments);
		// we create this as a deferred callback so we can call back into the
		// plugin immediately
		this.addCallback("getCartridgesResult", enyo.bind(this, this.getCardridgesCallback), true);
		this.addCallback("openCartridgeResult", enyo.bind(this, this.openCartridgeResult), true);
		
		this.addCallback("MessageBox", enyo.bind(this, this.messageBox), true);
		this.addCallback("Dialog", enyo.bind(this, this.dialog), true);
		this.addCallback("playAudio", enyo.bind(this, this.playAudio), true);
		this.addCallback("stopSound", enyo.bind(this, this.stopSound), true);
		this.addCallback("Alert", enyo.bind(this, this.Alert), true);
		this.addCallback("GetInput", enyo.bind(this, this.getInput), true);
		this.addCallback("ShowStatusText", enyo.bind(this, this.ShowStatusText), true);
		this.addCallback("updateState", enyo.bind(this, this.updateUI), true);
		this.addCallback("showScreen", enyo.bind(this, this.showScreen), true);
		this.addCallback("ClosePrompt", enyo.bind(this, this.closePrompt), true);
		this.addCallback("showMapResponse", enyo.bind(this, this.showMapResponse), true);
	},
	cartDir: "",
	
	playAudio: function(media){
		console.error("***** WIG Enyo: playAudio: " + media);
		this.owner.$.sound.setSrc(this.cartDir + media);
		this.owner.$.sound.play();
	},
	stopSound: function(){
		console.error("***** WIG Enyo: stopSound");
		this.owner.$.sound.audio.pause();
	},
	Alert: function(){
		console.error("***** WIG Enyo: Alert");
		this.owner.$.SysSound.call({"name": "tones_3beeps_otasp_done"});
	},
	messageBox: function(message, media, button1, button2, callback){
		/*console.error("***** WIG Enyo: messageBox:" + message + "b:" + button1 + ", " + button2 + " m:" + media + " c:" + callback);
		if( media ){
			console.error("***** WIG Enyo: Media url: " + media);
		}*/
		this.owner.popupMessage( new WIGApp.MessageBox(message, "Message", (media != "" ? this.cartDir + media : null ), button1, button2, (callback == "1"))  );
	},
	dialog: function(message, media){
		/*console.error("***** WIG Enyo: dialog:" + message);
		if( media ){
			console.error("***** WIG Enyo: Media url: " + media);
		}*/
		this.owner.popupMessage( new WIGApp.Dialog(message, "Message", this.cartDir + media) );
	},
	MessageBoxResponse: function( value ){
		console.error("***** WIG Enyo: MessageBoxResponse value: " + value);
		if ( window.PalmSystem) {
			this.callPluginMethodDeferred(enyo.nop, "MessageBoxResponse", value);
		}
	},
	getInput: function(type, text, choices, media){
		console.error("***** WIG Enyo: getInput: type: " + type + " text:" + text + " choices: " + choices);
		this.owner.popupMessage( new WIGApp.GetInput(text, "Message", this.cartDir + media, type, choices) );
	},
	GetInputResponse: function( value ){
		if ( window.PalmSystem) {
			this.callPluginMethodDeferred(enyo.nop, "GetInputResponse", value);
		} else {
			console.error("GetInput response: " + value)
		}
	},
	ShowStatusText: function(text){
		enyo.windows.addBannerMessage(text, "{}");
	},
	updateUI: function( JSONdata ){
		console.error(JSONdata);
		result = enyo.json.parse(JSONdata);
		if(result.type == "ok") {
			console.error("***** WIG Enyo: UpdateUI ok ...", JSONdata);
			this.owner.$.gMain.updateUI(result.data);
		} else if( result.type == "error" ){
			console.error("***** WIG Enyo: UpdateUI failed ...");
			this.owner.popupMessage( new WIGApp.Dialog(result.message, "Error") );
			//enyo.windows.addBannerMessage(result.message, "{}");
		} else {
			console.error("***** WIG Enyo: Unknown result of updateUI");
		}
	},
	//_resultsCallbacks: [],
	getCardridgesCallback: function(filesJSON) {
		console.error("***** WIG Enyo: _getMetaCallback");
		// we rely on the fact that calls to the plugin will result in callbacks happening
		// in the order that the calls were made to do a first-in, first-out queue
		//var callback = this._resultsCallbacks.shift();
		//if (callback) {
			console.error(filesJSON);
			result = enyo.json.parse(filesJSON);
			if(result.type == "ok") {
				this.owner.$.cList.updateFileList(result.data);
			} else if( result.type == "error" ){
				console.error("***** WIG Enyo: Result failed ...");
				this.owner.popupMessage( new WIGApp.Dialog(result.message, "Error") );
				enyo.windows.addBannerMessage(result.message, "{}");
			} else {
				console.error("***** WIG Enyo: Unknown result of getMetaCallback");
			}
		/*}
		else {
			console.error("WIG Enyo: got results with no callbacks registered: " + filesJSON);
		}*/
	},
	openCartridgeResult: function(JSONdata){
		console.error(JSONdata);
		result = enyo.json.parse(JSONdata);
		if(result.type == "ok") {
			this.cartDir = result.data.cartDir;
			this.owner.$.gMain.setup(result.data);
			this.owner.$.pane.selectViewByName("gMain");
		} else if( result.type == "error" ){
			console.error("***** WIG Enyo: Open failed ...");
			this.owner.popupMessage( new WIGApp.Dialog(result.message, "Error") );
			//enyo.windows.addBannerMessage(result.message, "{}");
		} else {
			console.error("***** WIG Enyo: Unknown result of getMetaCallback");
		}
	},
	
	getCartridges: function(refresh/*, callback*/) {
		if ( window.PalmSystem) {
			console.error("***** WIG Enyo: getCartridges refresh = " + refresh);
			//this._resultsCallbacks.push(callback);
			this.callPluginMethodDeferred(enyo.nop, "getCartridges", refresh);
		}
		else {
			// if not on device, return mock data
			enyo.nextTick(this, function() { this.owner.$.cList.updateFileList([
        {
            "filename": "mp.gwc",
            "icon": "images/locations.png",
            "splash": "images/locations.png",
            "type": "Geocache",
            "name": "Monty Python a Svaty Gral",
            "guid": "9680e562-caf2-455e-a095-654b67d8080e",
            "description": "Stan se na chvili kralem Artusem a prijmi jeho poslani najit Svaty gral. Cesta to nebude jednoducha. Tvuj verny sluha Patynka a dalsi udatni rytiri kulateho stolu Ti vsak pomohou. Kdo videl film \"Monty Python and the Holy Grail\" bude mit cestu snazsi a hlavne mnohem zazivnejsi.",
            "startingLocationDescription": "Pobl?? zast?vky MHD N?m. 28. dubna. V noci pak jezd? do Bystrce no?n? autobusov? spoje.",
            "latitude": 49,
            "longitude": 16,
            "version": "1.2",
            "author": "Karbanatek",
            "saved": false,
            "complete": false
        },
        {
            "filename": "wherigo.lua.gwc",
            "iconID": "-1",
            "type": "",
            "name": "Ahoj Svete",
            "guid": "97e8dd40-78a6-4ae1-9575-6260ff64bdc5",
            "description": "",
            "startingLocationDescription": "",
            "latitude": 360,
            "longitude": 360,
            "version": "0",
            "author": "",
            "saved": true,
            "complete": true
        }
			]);
			});
		}
	},
	openCartridge: function(filename, load_game){
		if ( window.PalmSystem) {
			console.error("***** WIG Enyo: openCartridge filename = " + filename);
			this.callPluginMethodDeferred(enyo.nop, "openCartridge", filename, load_game, Number(this.owner.getPrefs("gps")) );
		} else {
			enyo.nextTick(this, function() { this.openCartridgeResult(
				"{\"type\": \"ok\", \"data\": { \"cartDir\": \"./\", \"locationsEmpty\": \"Nowhere to go\" }}");
			});
			enyo.nextTick(this, function() { this.owner.$.gMain.updateUI(

{
        "locations": [
			{
				"name": "Vzdaleny bod",
				"description": "far over the misty mountains cold. ",
				"distance": 6578.808,
				"bearing": 33.333333,
				"commands": [],
                "id": "17",
			},
			{
				"name": "Paloucek",
				"description": "Paloucek pobliz tramvajove smycky Certova rokle. ",
				"distance": 65.808471927813,
				"bearing": 184.97249242265,
				"commands": [],
                "id": "18",
			},
			{
				"name": "Bod tady",
				"description": "bla bla bla. ",
				"distance": 0,
				"bearing": 0,
				"commands": [],
                "id": "19",
			},
		],
        "youSee": [
			{
				"name": "Neco",
				"description": "nikde",
				"commands": [],
                "id": "99",
			},
			{
				"name": "Neco druheho",
				"description": "nikde!!",
				"commands": [],
                "id": "98",
			}
        ],
        "inventory": [
            {
                "name": "denik krale Artuse",
                "description": "",
                "media": "images/gps_4.png",
                "icon": "images/task.png",
                "id": "129",
                "commands": [
                    {
                        "id": "_1iJNa",
                        "text": "cist denik"
                    }
                ]
            },
            {
                "name": " ulozit hru",
                "description": "",
                "id": "136",
                "commands": [],
                "onclick": true
            }
        ],
        "tasks": [
            {
                "name": "Go Home",
                "commands": [],
                "id": "138",
                "onclick": function(context){
					context.owner.showScreenLua("main")
					},
                "complete": false,
				"sort": 5,
            },
            {
                "name": "Go Locations",
                "commands": [],
                "id": "150",
                "onclick": function(context){
					context.owner.showScreenLua("locations")
					},
                "complete": true,
				"sort": 4,
            },
            {
                "name": "Go Detail",
                "commands": [],
                "id": "13",
                "onclick": function(context){
					context.owner.showScreenLua("detail", "138")
					},
                "complete": false,
				"sort": 3,
            },
            {
                "name": "Completed",
                "commands": [],
                "id": "13",
                "complete": true,
				"sort": 2,
            }
        ],
        "gps": {"acc": 38, "state": 1, "heading": 90}
    }
			
				);
			});
		}
	},
	closeCartridge: function(save, callback){
		console.error("***** WIG Enyo: closeCartridge save = " + save);
		if ( window.PalmSystem) {
			//this._resultsCallbacks.push(callback);
			this.callPluginMethodDeferred(enyo.nop, "closeCartridge", save);
		}
		this.owner.$.gMain.updateUI({
			"locations": [],
			"youSee": [],
			"inventory": [],
			"tasks": [],
			"gps": {"acc": 0, "state": 0, "heading": 90 }
		});
	},
	callback: function(event, id){
		if ( window.PalmSystem) {
			console.error("***** WIG Enyo: callback event = " + event + " id = " + id);
			this.callPluginMethodDeferred(enyo.nop, "CallbackFunction", event, id);
		}
	},
	setPosition: function(lat, lon){
		if ( window.PalmSystem) {
			//console.error("***** WIG Enyo: setPosition (debug) lat = " + lat + " lon = " + lon);
			this.callPluginMethodDeferred(enyo.nop, "setPosition", lat, lon);
		}
	},
	movePosition: function(lat, lon){
		if ( window.PalmSystem) {
			console.error("***** WIG Enyo: movePosition (debug) lat = " + lat + " lon = " + lon);
			this.callPluginMethodDeferred(enyo.nop, "movePosition", lat, lon);
		}
	},
	showScreen: function(screen, item){
		console.error("***** WIG Enyo: showScreen: " + screen + ", item:" + item);
		this.owner.$.gMain.showScreenLua(screen, item);
	},
	switchGPS: function(newState){
		console.error("***** WIG Enyo: switchGPS = " + newState);
		if ( window.PalmSystem) {
			this.callPluginMethodDeferred(enyo.nop, "switchGPS", newState);
		}
	},
	closePrompt: function(){
		this.owner.goBack(null, this);
	},
	save: function(){
		console.error("***** WIG Enyo: Savegame");
		this.callPluginMethodDeferred(enyo.nop, "save");
	},
	showMap: function(zone_id){
		this.callPluginMethodDeferred(enyo.nop, "showMap", zone_id);
	},
	showMapResponse: function(JSONdata){
		result = enyo.json.parse(JSONdata);
		console.error(JSONdata);
		if( result ) {
			this.owner.showMap(result);
			console.error("***** WIG Enyo: showMap OK ...");
		} else {
			console.error("***** WIG Enyo: Unknown result of showMap");
		}
	},
	deleteCartridge: function(filename){
		if ( window.PalmSystem) {
			this.callPluginMethodDeferred(enyo.nop, "deleteCartridge", filename);
		} else {
			console.log("Delete " + filename);
		}
		//this._resultsCallbacks.push( enyo.bind(this.owner.$.cList, "updateFileList") );
	},
});

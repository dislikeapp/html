
var GUI = OE.Utils.defClass2({
	overlay: undefined,
	ui: undefined,
	
	userData: undefined,
	shopActive: false,
	
	selectedShopItem: undefined,
	selectedObject: undefined,
	
	constructor: function() {
		this.overlay = document.getElementById("ingameOverlay");
		var ui = this.ui = {};
		var names = ["frame", "toggle", "gameState", "content", "userInfo", "shop", "shopInfo", "selection"];
		for (var i=0; i<names.length; i++)
			ui[names[i]] = this.overlay.findByName(names[i]);
		
		ui.toggle.on("click", function() {
			this.contentVisible = !this.contentVisible;
			ui.content.style.display = this.contentVisible ? 'block' : 'none';
			ui.frame.style.bottom = this.contentVisible ? '4px' : 'initial';
		}.bind(this));
	},
	
	setUserData: function(userData) {
		this.userData = userData;
		this.updateUserInfo();
	},
	updateUserInfo: function() {
		var str = '<div class="balance">Balance: $'+this.userData.balance+'</div>';
		this.ui.userInfo.innerHTML = str;
	},
	
	setGameState: function(state) {
		if (state === app.STATE_BUILDING) {
			this.setShopActive(true);
			this.ui.gameState.setAttribute("class", "gameState build");
			this.ui.gameState.innerHTML = "BUILD";
		}
		else if (state === app.STATE_DEFENDING) {
			this.setShopActive(false);
			this.ui.gameState.setAttribute("class", "gameState defend");
			this.ui.gameState.innerHTML = "DEFEND";
		}
	},
	setShopActive: function(active) {
		this.shopActive = active;
		if (!active) {
			// this.selectShopItem(undefined);
		}
	},
	
	createShop: function(items) {
		var str = '';
		
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			item.id = i;
			str += '<a name="item '+i+'" style="background-image: url(\''+item.preview+'\');"></a>';
		}
		this.ui.shop.innerHTML = str;
		
		for (var i=0; i<items.length; i++) {
			(function() { 
				var item = items[i];
				var e = this.ui.shop.findByName('item '+i);
				e.on("click", function() {
					this.selectShopItem(item);
				}.bind(this));
			}.bind(this))(i);
		}
	},
	
	selectShopItem: function(info) {
		this.selectedShopItem = info;
		
		if (info === undefined) {
			this.ui.shopInfo.innerHTML = '';
			return;
		}
		
		var level = info.levels[0];
		
		var delay = (1000.0 * level.delay / 60.0).toFixed(0);
		var range = level.range;
		
		var str = '<div class="preview" style="background-image: url(\''+info.preview+'\');"></div>'
			+'<p class="model">Model: '+level.name+'</p>'
			+'<p class="details">'
				+'Range: '+range+' units<br />'
				+'Delay: '+delay+' ms<br />'
				+'Power: '+level.power+'<br /></p>'
			+'<p><a name="buy" class="btn yellow">Buy for $'+level.cost+'</a><p>';
		this.ui.shopInfo.innerHTML = str;
		
		var buyBtn = this.ui.shopInfo.findByName("buy");
		buyBtn.on("click", this.buySelected.bind(this));
	},
	
	setSelection: function(object) {
		this.selectedObject = object;
		
		if (object instanceof Tower) {
			var info = app.towerData[object.tower_id];
			var level = info.levels[object.upgrade_level];
			var nextLv = object.upgrade_level + 1;
			
			var delay = (1000.0 * level.delay / 60.0).toFixed(0);
			var range = level.range;
			
			var sell_price = this.getSellPrice(object.tower_id, object.upgrade_level);
			
			var str = '<div class="preview" style="background-image: url(\''+info.preview+'\');"></div>'
				+'<p class="model">Selection:<br />'+level.name+'</p>'
				+'<p class="details">'
					+'Upgrade: Lv. '+nextLv+'<br />'
					+'Range: '+range+' units<br />'
					+'Delay: '+delay+' ms<br />'
					+'Power: '+level.power+'<br /></p>';
			
			str += '<p><a name="sell" class="btn red">Sell for $'+sell_price+'</a></p>';
			
			if (nextLv < info.levels.length) {
				var next = info.levels[nextLv];
				str += '<p><a name="upgrade" class="btn yellow">Upgrade for $'+next.cost+'</a></p>';
			}
			
			this.ui.selection.innerHTML = str;
			
			var upBtn = this.ui.selection.findByName("upgrade");
			var sellBtn = this.ui.selection.findByName("sell");
			
			if (upBtn) {
				upBtn.on("click", this.upgradeSelected.bind(this));
			}
			sellBtn.on("click", this.sellSelected.bind(this));
		}
		else if (object instanceof Actor) {
			object.health = 20;
			object.healthMax = 35;
			var hp = object.health;
			var hpm = object.healthMax;
			var percent = (100.0 * hp / hpm).toFixed(0);
			
			var str = '<div>Actor</div>'
				+'<div>Health: '+percent+'% ('+hp+'/'+hpm+')</div>';
			this.ui.selection.innerHTML = str;
		}
		else if (object instanceof Waypoint) {
			var str = '<div>Waypoint</div>';
			
			if (object.isEmitter) {
				var percent = (100.0 * object.difficulty).toFixed(0);
				str += '<div>Difficulty: '+percent+'%</div>';
			}
			this.ui.selection.innerHTML = str;
		}
		else if (object instanceof Wall) {
			var str = '<div>Wall</div>';
			this.ui.selection.innerHTML = str;
		}
		else {
			this.ui.selection.innerHTML = '';
		}
	},
	
	getSellPrice: function(tower_id, upgrade_level) {
		var info = app.towerData[tower_id];
		var total_price = 0;
		for (var i = 0; i <= upgrade_level; i++) {
			total_price += info.levels[i].cost;
		}
		return Math.round(total_price * 0.6);
	},
	
	buySelected: function() {
		if (!this.shopActive) {
			alert("Can only buy during build phase!");
			return;
		}
		if (app.map.cursor.mActive) {
			var obj = app.map.getObject(app.map.cursorX, app.map.cursorY);
			if (obj === undefined) {
				var info = this.selectedShopItem;
				if (info !== undefined) {
					var level = info.levels[0];
					if (this.userData.charge(level.cost)) {
						var tower = app.map.addTower(app.map.cursorX, app.map.cursorY, info.id);
						if (tower === undefined) {
							this.userData.receive(level.cost);
						}
						else {
							this.updateUserInfo();
							this.setSelection(tower);
						}
					}
					else {
						alert("Not enough funds!");
					}
				}
			}
			else {
				alert("Something is in the way!");
			}
		}
		else {
			alert("Please select a grid space first.");
		}
	},
	sellSelected: function() {
		if (!this.shopActive) {
			alert("Can only sell during build phase!");
			return;
		}
		
		var object = this.selectedObject;
		
		if (object !== undefined) {
			var sell_price = this.getSellPrice(object.tower_id, object.upgrade_level);
			
			app.map.clearObject(object.map_pos_x, object.map_pos_y);
			this.userData.receive(sell_price);
			this.updateUserInfo();
			this.setSelection(undefined);
		}
	},
	upgradeSelected: function() {
		var object = this.selectedObject;
		
		if (object !== undefined) {
			var info = app.towerData[object.tower_id];
			var nextLv = object.upgrade_level + 1;
			
			if (nextLv < info.levels.length) {
				if (this.userData.charge(info.levels[nextLv].cost)) {
					object.setUpgradeLevel(nextLv);
					this.updateUserInfo();
					this.setSelection(object);
				}
				else {
					alert("Not enough funds!");
				}
			}
		}
	}
});

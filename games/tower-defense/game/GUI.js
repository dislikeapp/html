
var GUI = OE.Utils.defClass2({
	overlay: undefined,
	ui: undefined,
	
	userData: undefined,
	
	constructor: function() {
		this.overlay = document.getElementById("ingameOverlay");
		var ui = this.ui = {};
		var names = ["frame", "toggle", "content", "userInfo", "shop", "shopInfo", "selection"];
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
		var str = '<div class="balance">Balance: '+this.userData.balance+'</div>';
		this.ui.userInfo.innerHTML = str;
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
					this.selectTower(item);
				}.bind(this));
			}.bind(this))(i);
		}
	},
	
	selectTower: function(info) {
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
		buyBtn.on("click", function() {
			if (app.map.cursor.mActive) {
				var obj = app.map.getObject(app.map.cursorX, app.map.cursorY);
				if (obj === undefined) {
					if (this.userData.charge(level.cost)) {
						this.updateUserInfo();
						var tower = app.addTower(app.map.cursorX, app.map.cursorY, info.id);
						this.setSelection(tower);
					}
					else {
						alert("Not enough funds!");
					}
				}
				else {
					alert("Something is in the way!");
				}
			}
			else {
				alert("Please select a grid space first.");
			}
		}.bind(this));
	},
	
	setSelection: function(object) {
		if (object instanceof Tower) {
			var info = app.towerData[object.tower_id];
			var level = info.levels[object.upgrade_level];
			var nextLv = object.upgrade_level + 1;
			
			var delay = (1000.0 * level.delay / 60.0).toFixed(0);
			var range = level.range;
			
			var total_price = 0;
			for (var i = 0; i <= object.upgrade_level; i++) {
				total_price += info.levels[i].cost;
			}
			var sell_price = Math.round(total_price * 0.6);
			
			var str = '<p class="model">Selection: '+level.name+'</p>'
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
				upBtn.on("click", function() {
					if (this.userData.charge(info.levels[nextLv].cost)) {
						object.setUpgradeLevel(nextLv);
						this.updateUserInfo();
						this.setSelection(object);
					}
					else {
						alert("Not enough funds!");
					}
				}.bind(this));
			}
			sellBtn.on("click", function() {
				app.map.setObject(object.map_pos_x, object.map_pos_y, undefined);
				this.userData.receive(sell_price);
				this.updateUserInfo();
				this.setSelection(undefined);
			}.bind(this));
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
		else {
			this.ui.selection.innerHTML = '';
		}
	}
});

$(function() {
	var canvas = $("#c");
	var canvasHeight;
	var canvasWidth;
	var ctx;
	var dt = 0.1;
	
	var pointCollection;
	
	function init() {
		updateCanvasDimensions();
		
		var g = jsonToPoint("[{\"topic\":\"government\",\"usage\":8,\"sentiment\":0.6}, {\"topic\":\"Moose\",\"usage\":5,\"sentiment\":1}]");

		gLength = g.length;
		for (var i = 0; i < gLength; i++) {
			g[i].curPos.x = (canvasWidth/2 - 180) + g[i].curPos.x;
			g[i].curPos.y = (canvasHeight/2 - 65) + g[i].curPos.y;
			
			g[i].originalPos.x = (canvasWidth/2 - 180) + g[i].originalPos.x;
			g[i].originalPos.y = (canvasHeight/2 - 65) + g[i].originalPos.y;
		};
		
		pointCollection = new PointCollection();
		pointCollection.points = g;
		
		initEventListeners();
		timeout();
	};

	function jsonToPoint(e) {
		var arr_from_json = JSON.parse(e);
		var placed = [];
		for (var i = 0; i < Object.keys(arr_from_json).length; i++) {
			var radius = ((canvasWidth * canvasHeight) / 7000) * (arr_from_json[i]['usage'] / 10);
			var y, x;
			while (true) {
			    y = genRandom(canvasHeight)*.5, x = genRandom(canvasWidth)*.5;
				var passed = true;
				for (var ii = 0; ii < placed.length; ii++) {
					if (distance(placed[ii].originalPos, x, y) > ((radius / 2) + (placed[ii].radius / 2))) {
						continue;
					}
					passed = false;
					break;
				}
				if  (passed) {
					break;
				}
			}
			console.log(x + ":" + y)
			placed.push(new Point(x, y, 5.0, radius, getColorForPercentage(arr_from_json[i]['sentiment']), arr_from_json[i]['topic']));
			console.log("placed" + placed);
		}
		return placed;
	}

	function distance(vector, x2, y2) {
		xs = vector.x - x2;
		xs = xs * xs;

		ys = vector.y - y2;
		ys = ys * ys;
		 
		return ( xs + ys )^.5;
	}

	function genRandom(max) {
		return Math.random() * max;
	}

	var percentColors = [
    { pct: 0.0, color: { r: 0xc0, g: 0x39, b: 0x2B} },
    { pct: 0.5, color: { r: 0x75, g: 0x5D, b: 0x72} },
    { pct: 1.0, color: { r: 0x29, g: 0x80, b: 0xb9 } } ];

	var getColorForPercentage = function(pct) {
	    for (var i = 1; i < percentColors.length - 1; i++) {
	        if (pct < percentColors[i].pct) {
	            break;
	        }
	    }
	    var lower = percentColors[i - 1];
	    var upper = percentColors[i];
	    var range = upper.pct - lower.pct;
	    var rangePct = (pct - lower.pct) / range;
	    var pctLower = 1 - rangePct;
	    var pctUpper = rangePct;
	    var color = {
	        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
	        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
	        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	    };
	    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	    // or output as hex if preferred
	} 

	function componentToHex(c) {
   	    var hex = c.toString(16);
    	return hex.length == 1 ? "0" + hex : hex;
    }

	function rgbToHex(r, g, b) {
	    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	
	function initEventListeners() {
		$(window).bind('resize', updateCanvasDimensions).bind('mousemove', onMove);
		
		canvas.get(0).ontouchmove = function(e) {
			e.preventDefault();
			onTouchMove(e);
		};
		
		canvas.get(0).ontouchstart = function(e) {
			e.preventDefault();
		};
	};
	
	function updateCanvasDimensions() {
		var body = $(this.ie6 ? document.body : document);
		canvas.attr({height: window.innerHeight-2, width: window.innerWidth-2});
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();
		console.log(canvasWidth);
		console.log(canvasHeight);

		draw();
	};
	
	function onMove(e) {
		mousePos = pointCollection.mousePos;
		console.log(mousePos.x + ":" + mousePos.y)
		if (pointCollection)
			pointCollection.mousePos.set(e.pageX, e.pageY);
	};
	
	function onTouchMove(e) {
		if (pointCollection)
			pointCollection.mousePos.set(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	};
	function timeout() {
		draw();
		update();
		
		setTimeout(function() { timeout() }, 30);
	};
	
	function draw() {
		var tmpCanvas = canvas.get(0);

		if (tmpCanvas.getContext == null) {
			return; 
		};
		
		ctx = tmpCanvas.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (pointCollection)
			pointCollection.draw();
	};
	
	function update() {		
		if (pointCollection)
			pointCollection.update();
	};
	
	function Vector(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
 
		this.addX = function(x) {
			this.x += x;
		};
		
		this.addY = function(y) {
			this.y += y;
		};
		
		this.addZ = function(z) {
			this.z += z;
		};
 
		this.set = function(x, y, z) {
			this.x = x; 
			this.y = y;
			this.z = z;
		};
	};
	
	function PointCollection() {
		this.mousePos = new Vector(0, 0);
		this.points = new Array();
		
		this.newPoint = function(x, y, z) {
			var point = new Point(x, y, z);
			this.points.push(point);
			return point;
		};
		
		this.update = function() {		
			var pointsLength = this.points.length;
			
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;
				
				var dx = this.mousePos.x - point.curPos.x;
				var dy = this.mousePos.y - point.curPos.y;
				var dd = (dx * dx) + (dy * dy);
				var d = Math.sqrt(dd);
				
				if (d < 150) {
					point.targetPos.x = (this.mousePos.x < point.curPos.x) ? point.curPos.x - dx : point.curPos.x - dx;
					point.targetPos.y = (this.mousePos.y < point.curPos.y) ? point.curPos.y - dy : point.curPos.y - dy;
				} else {
					point.targetPos.x = point.originalPos.x;
					point.targetPos.y = point.originalPos.y;
				};
				
				point.update();
			};
		};
		
		this.draw = function() {
			var pointsLength = this.points.length;
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;

				point.draw();
			};
		};
	};
	
	function Point(x, y, z, size, colour, topic) {
		this.topic = topic;
		this.colour = colour;
		this.curPos = new Vector(x, y, z);
		this.friction = 0.8;
		this.originalPos = new Vector(x, y, z);
		this.radius = size;
		this.springStrength = 0.1;
		this.targetPos = new Vector(x, y, z);
		this.velocity = new Vector(0.0, 0.0, 0.0);
		
		this.update = function() {
			var dx = this.targetPos.x - this.curPos.x;
			var ax = dx * this.springStrength;
			this.velocity.x += ax;
			this.velocity.x *= this.friction;
			this.curPos.x += this.velocity.x;
			
			var dy = this.targetPos.y - this.curPos.y;
			var ay = dy * this.springStrength;
			this.velocity.y += ay;
			this.velocity.y *= this.friction;
			this.curPos.y += this.velocity.y;
			
			var dox = this.originalPos.x - this.curPos.x;
			var doy = this.originalPos.y - this.curPos.y;
			var dd = (dox * dox) + (doy * doy);
			var d = Math.sqrt(dd);
			
		};
		
		this.draw = function() {
			ctx.fillStyle = this.colour;
			ctx.beginPath();
			ctx.arc(this.curPos.x, this.curPos.y, this.radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = "black"; // font color to write the text with
	   	    var font = "bold " + this.radius/3 +"px serif";
		    ctx.font = font;
		    var width = ctx.measureText(topic).width;
			var height = ctx.measureText("W").width;
		    ctx.fillText(this.topic, (this.curPos.x-width/4)-20,(this.curPos.y-height/2))+20;
		    console.log(this.topic);
		};
	};
	
	init();
});
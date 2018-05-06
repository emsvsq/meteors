var COEFF_Y_GROUND = 350;

function MapObject (image, xImage, yImage, wImage, hImage, x, y, w, h) {
	  this.image = image;
	  this.x = x;
	  this.y = y;
	  this.w = w;
	  this.h = h;
	  this.xImage = xImage;
	  this.yImage = yImage;
	  this.wImage = wImage;
	  this.hImage = hImage;
	}

	 function Player (image, xImage, yImage, wImage, hImage, x, y, w, h, curFrame, trackRight, trackLeft, frameCount, spriteWidth, spriteHeight, rows, cols,keynumLeft, keynumRight, keynumUp, keynumDown) {
		MapObject.call(this, image, xImage, yImage, wImage, hImage, x, y, w, h)
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.jump = false;
		//8 frames
		this.curFrame = curFrame;
		 //The 0th (first) row is for the right movement
		this.trackRight = trackRight; 
		 //1st (second) row for the left movement (counting the index from 0)
		this.trackLeft = trackLeft; 
		//The total frame is 8 
		this.frameCount = frameCount; 
		//SPRITESHEET HUMAIN
		this.spriteWidth = spriteWidth; 
		this.spriteHeight = spriteHeight; 
		 //2 lignes et 8 colonnes
		this.rows = rows; 
		this.cols = cols;
		this.width = this.spriteWidth/this.cols; 
		this.height = this.spriteHeight/this.rows; 
		this.wImage = this.width;
		this.hImage = this.height;
		this.w = this.width;
		this.h = this.height;
		this.beforeJumpY = COEFF_Y_GROUND;
		this.keynumLeft = keynumLeft;
		this.keynumRight = keynumRight;
		this.keynumUp = keynumUp;
		this.keynumDown = keynumDown;
		this.numberJumps = 0; 
		this.isOnRight = true; 
		this.isOnLeft = false; 
	}
	
	function Meteor (image, xImage, yImage, wImage, hImage, x, y, w, h, curFrame, trackRight, trackLeft, frameCount, spriteWidth, spriteHeight, rows, cols, sizeFactor) {
		MapObject.call(this, image, xImage, yImage, wImage, hImage, x, y, w, h)
		//8 frames
		this.curFrame = curFrame;
		 //The 0th (first) row is for the right movement
		this.trackRight = trackRight; 
		 //1st (second) row for the left movement (counting the index from 0)
		this.trackLeft = trackLeft; 
		//The total frame is 8 
		this.frameCount = frameCount;
		this.spriteWidth = spriteWidth; 
		this.spriteHeight = spriteHeight; 
		 //2 lignes et 8 colonnes
		this.rows = rows; 
		this.cols = cols;
		this.width = this.spriteWidth/this.cols; 
		this.height = this.spriteHeight/this.rows; 
		this.wImage = this.width;
		this.hImage = this.height;
		this.w = this.width * sizeFactor;
		this.h = this.height * sizeFactor;
		this.exploded = false;
		this.groundcollision = null;
	}
	
	 function Explosion (image, xImage, yImage, wImage, hImage, x, y, w, h, curFrame, trackRight, trackLeft, frameCount, spriteWidth, spriteHeight, rows, cols, sizeFactor) {
		MapObject.call(this,image,  xImage, yImage, wImage, hImage, x, y, w, h)
		this.curFrame = curFrame;
		this.trackRight = trackRight; 
		this.trackLeft = trackLeft;
		this.frameCount = frameCount;
		this.spriteWidth = spriteWidth; 
		this.spriteHeight = spriteHeight;
		this.rows = rows; 
		this.cols = cols;
		this.width = this.spriteWidth/this.cols; 
		this.height = this.spriteHeight/this.rows; 
		this.wImage = this.width;
		this.hImage = this.height;
		this.w = this.width * sizeFactor;
		this.h = this.height * sizeFactor;
	}

	 function Ground (image, xImage, yImage, wImage, hImage, x, y, w, h) {
		MapObject.call(this,image,  xImage, yImage, wImage, hImage, x, y, w, h)
		this.leftY = this.y;
		this.rightY = this.y;
		this.setY = function(yCoord) {
			this.y = yCoord;
			this.leftY = yCoord;
			this.rightY = yCoord;
		}
		this.getYByX =  function(xCoord) {
			return this.y - 120;
		};
	}

	 function GroundMontant (image, xImage, yImage, wImage, hImage, x, y, w, h) {
		Ground.call(this, image, xImage, yImage, wImage, hImage, x, y, w, h)
		this.leftY = this.y + 153;
		this.rightY = this.y;
		this.setY = function(yCoord) {
			this.y = yCoord;
			this.leftY = yCoord + 153;
			this.rightY = yCoord;
		}
		this.getYByX = function(xCoord) {
			var hauteur = 135;
			var longueur = this.w - (this.x + this.w) - xCoord;
			var currentX = xCoord - this.x;
			var pourcentage = currentX / this.w;
			//return this.y - (hauteur * (longueur - (canvasWidth - xCoord) / longueur)) - 120;
			return this.y - pourcentage * hauteur - 3;
			//return this.y - 153/255 * currentX;
		};
	}
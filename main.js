// Inits
window.onload = function init() {
  "use strict";
  var game = new Jeu();
 //game.draw();
  //game.start();
};

var Jeu = function () {
	var canvasWidth = 1200, canvasHeight = 600, fps = 60, meteor_speed = 6, meteor_freq = 80;
	var inputStates = {};
	var listMenu = ["Jouer", "Options", "Quitter"];
	var listOptions = {"Adapter la taille de l'écran" : false, "Activer le son" : true, "Nombre de joueurs" : 1};
	var currentSelectedMenu = 0;
	var currentSelectedOption = 0;
	var pushUp = false;
	var pushDown = false;
	var pushEnter = false;
	var pushEscape = false;
	var pushLeft = false;
	var pushRight = false;
	var meteorsNumber = 00;
	var frameDrawingSpeed = 0;
	var soundActivated = true;
	
	var screenWidth = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	var screenHeight = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;
	
	var sizeFactor = 1;

	if ((screenWidth / canvasWidth) > (screenHeight / canvasHeight)) {
		sizeFactor = ((screenHeight  - 22) / canvasHeight);
	} else {
		sizeFactor = ((screenWidth  - 22) / canvasWidth);
	}
    
	if (sizeFactor < 1) {
		sizeFactor = 1;
	}
	var COEFF_SIZEFACTOR = sizeFactor;
	
	if (listOptions["Adapter la taille de l'écran"] == false) {
		sizeFactor = 1;
	}
	canvasWidth = parseInt(canvasWidth * sizeFactor, 10);
	canvasHeight = parseInt(canvasHeight * sizeFactor, 10);
	
	var etats = {
			menu : 0,
			game : 1,
			gameOver : 2,
			options : 3
		};
		
	var gameState = etats.menu;
		
	 ////////Constantes
	var COEFF_SPEED = 8; 
	var COEFF_MONTEE = 4;
	var COEFF_GRAVITE = 8;
	var COEFF_SAUT = 12;
	var COEFF_X_MONTEE = 900;
	var COEFF_Y_GROUND = 350;
	var COEFF_HAUTEUR_SAUT = 130;
	var MAX_JUMP = 1;

	var listObjectsGround = [];
	var listObjectsCharacters = [];
	var listObjectsMeteor = [];
	var listObjectsExplosion = [];
    
    var assets = {};

	var canvas = document.querySelector("#canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
    var ctx = canvas.getContext('2d');

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
    
	function AddPlayers() {
		listObjectsCharacters = [];
		listObjectsCharacters.push(new Player(assets.character, 0, 0, -1, -1, 0 * sizeFactor, 350 * sizeFactor, -1, -1, 0, 0, 1, 8, 864, 280, 2, 8, 37, 39, 38, 40));
		if (listOptions["Nombre de joueurs"] == 2) {
			listObjectsCharacters.push(new Player(assets.character2, 0, 0, -1, -1, 300 * sizeFactor, 350 * sizeFactor, -1, -1, 0, 0, 1, 8, 864, 280, 2, 8, 65, 69, 90, 32));
		}
	}

	function InitMapObjects() {
		//Ajout des personnages
		AddPlayers();
			
		//////////Sol//////////////////
		//Sprite Sol plat 1
		listObjectsGround = [];
		listObjectsGround.push(new Ground(assets.ground, 0, 800, 255, 150 * sizeFactor, 0 * sizeFactor, canvasHeight - 150, 255 * sizeFactor, 150 * sizeFactor));
		//Sprite Sol plat 2
		listObjectsGround.push(new Ground(assets.ground, 255, 800, 255, 150 * sizeFactor, 253 * sizeFactor, canvasHeight - 139, 255 * sizeFactor, 150 * sizeFactor));
		//Sprite Sol plat 1 rogné plat
		listObjectsGround.push(new Ground(assets.ground, 100, 800, 155, 150 * sizeFactor, 507 * sizeFactor, canvasHeight - (30  * sizeFactor), 155 * sizeFactor, 150 * sizeFactor));
		listObjectsGround.push(new Ground(assets.ground, 100, 800, 155, 150 * sizeFactor, 661 * sizeFactor, canvasHeight - (135 * sizeFactor), 155 * sizeFactor, 150 * sizeFactor));
		listObjectsGround.push(new Ground(assets.ground, 100, 800, 155, 150 * sizeFactor, 815 * sizeFactor, canvasHeight - (135  * sizeFactor), 155 * sizeFactor, 150 * sizeFactor));
		//Sprite Sol montée
		listObjectsGround.push(new GroundMontant(assets.ground, 258, 510, 255, 280 * sizeFactor, 968 * sizeFactor, canvasHeight - (275  * sizeFactor), 255 * sizeFactor, 280 * sizeFactor));
	}
		
	function updatePlayerFrame(i){
		
		//for(var i = 0; i < listObjectsCharacters.length; i++) {
			var joueur = listObjectsCharacters[i];
			
			var currentNextGroundY = canvas.height;
			
			if (frameDrawingSpeed % 5 == 0) {
				//frame index 
				joueur.curFrame = ++joueur.curFrame % joueur.frameCount; 
				if (joueur.left) {
					joueur.xImage = (joueur.spriteWidth - joueur.width) - joueur.curFrame * joueur.width;
				}
				else if (joueur.right) {
					joueur.xImage = joueur.curFrame * joueur.width;
				}
			}
			
			//////////////////////////////////////////////Mouvement gauche
			if (joueur.left && joueur.x > 0){
				var goLeft = true;
				
				for(var i= 0; i < listObjectsGround.length; i++) {
					var nextLeftGround = listObjectsGround[i];
					//Se stopper au prochain obstacle à gauche
					if (((nextLeftGround.x + nextLeftGround.w) < (joueur.x)) && ((nextLeftGround.x + nextLeftGround.w) > (joueur.x - 10))) {
						currentNextGroundY = nextLeftGround.rightY;
						if ((joueur.y + (joueur.h * 2/3)) > nextLeftGround.rightY) {
							goLeft = false;
						}
						break;
					}
				}
				if (goLeft) {
					if (joueur.y <= currentNextGroundY){
						joueur.yImage = joueur.trackLeft * joueur.height;
						joueur.x-= COEFF_SPEED; 
						
					}
				}
			}
			/////////////////////////////////////////////////////////////
			
			////////////////////////////////////////////Mouvement droit
			if (joueur.right && joueur.x < canvasWidth - joueur.width){
				var goRight = true;
				
				for(var i= 0; i < listObjectsGround.length; i++) {
					var nextRightGround = listObjectsGround[i];
					//Se stopper au prochain obstacle à droite
					if ((nextRightGround.x >= (joueur.x + joueur.w)) && (nextRightGround.x < (joueur.x + joueur.w + 10))) {
						currentNextGroundY = nextRightGround.leftY;
						if ((joueur.y + (joueur.height * 2/3)) > nextRightGround.leftY) {
							goRight = false;
						}
						break;
					}
				}

				if (goRight) {
					if (joueur.y <= currentNextGroundY) {
						joueur.yImage = joueur.trackRight * joueur.height;
						joueur.x+=COEFF_SPEED;
					}
				}
			}
			///////////////////////////////////////////////////////////////////
			
			/////////////////////////////////SAUT////////////////////////////
			if (joueur.jump) {
			
				//if (joueur.y > joueur.beforeJumpY - COEFF_HAUTEUR_SAUT && joueur.y <= COEFF_Y_GROUND) {
				if (joueur.y > joueur.beforeJumpY - COEFF_HAUTEUR_SAUT) {
					joueur.y-= COEFF_SAUT;
				}
				else {
					joueur.jump = false;
					joueur.up = false;
				}
			} else if (joueur.up){
				joueur.jump = true;
			}
			/////////////////////////////////////////////////////////////////
			
			///////////////////////////Implementation de la gravité/collisions////////////////////
			if (!joueur.jump) {
				//////////////Calcul du Y du sol courant
				var currentGroundY = canvas.height;
				var currentGround;
				var nextRightGround;
				var nextLeftGround;
						
				for(var i= 0; i < listObjectsGround.length; i++) {
					var g = listObjectsGround[i];
					var centreDeGraviteJoueurX = joueur.x + (joueur.w / 2);
					if ((g.x < centreDeGraviteJoueurX) && ((g.x + g.w) > centreDeGraviteJoueurX)) {
						currentGround = g;
						currentGroundY = g.getYByX(centreDeGraviteJoueurX);
					}
					if ((g.x) <= (g.x + g.width + (10 * sizeFactor))) {
						nextRightGround = listObjectsGround[i];	
					}
					if ((g.x + g.w) >= (g.x - (10 * sizeFactor))) {
						nextLeftGround = listObjectsGround[i];
								
					}
				}
				
				
				//////////////////////Gestion des collisions////////////////////
						
				if (joueur.y < currentGroundY) {
					joueur.down = true;
					joueur.y+= COEFF_GRAVITE;
					
					////Si présence d'un vide, déplacement automatique du X afin d'éviter une moitié de joueur dans le terrain
					if (currentGround !=null) {
						if ((joueur.x < currentGround.x) && (!goLeft) ) {
							if ((nextRightGround != null) && (Math.abs(nextRightGround.y - currentGroundY) > 20)) {
								if (nextRightGround.y <= currentGroundY) {
									joueur.x = currentGround.x + 5;
								}
							} else if ((nextLeftGround != null) && (Math.abs(nextLeftGround.y - currentGroundY) > 20)) {
								joueur.x = currentGround.x + 5;
							}
						} else if ((joueur.x + joueur.w <= currentGround.x) && (!goLeft)) {
							if ((nextRightGround != null) && (Math.abs(nextRightGround.y - currentGroundY) > 20)) {
								if (nextRightGround.y < currentGroundY) {
									joueur.x = currentGround.x + 5;
								}
							} else if ((nextLeftGround != null) && (Math.abs(nextLeftGround.y - currentGroundY) > 20)) {
								joueur.x = currentGround.x + 5;
							}
						} 
						
						else if ((joueur.x + (10 * sizeFactor) > currentGround.x + currentGround.w) && (!goRight)) {
							if ((nextLeftGround != null) && (Math.abs(nextLeftGround.y - currentGroundY) > 20)) {
								if (nextLeftGround.y < currentGroundY) {
									joueur.x = currentGround.x + currentGround.w - joueur.w - 10;
								}
							}
						} else if ((joueur.x + joueur.w + (10 * sizeFactor) > currentGround.x + currentGround.w) && (!goRight)) {
							if ((nextLeftGround != null) && (Math.abs(nextLeftGround.y - currentGroundY) > 20)) {
								if (nextLeftGround.y < currentGroundY) {
									joueur.x = currentGround.x + currentGround.w - joueur.w - 10;
								}
							}
						}
					}
				} else if (joueur.y > currentGroundY + 20){
                    
					if ((nextLeftGround != null) && (nextLeftGround != null) && (nextLeftGround instanceof GroundMontant)) {
						joueur.y-= COEFF_SPEED * 2;
					}
					
					if ((nextRightGround != null) && (nextRightGround != null) && !(nextRightGround instanceof GroundMontant)) {
						joueur.y-= COEFF_SPEED * 2;
					}
					
						
				} else {
					joueur.down = false;
				}
				//////////////////////////////////////////////////////////
				
				if (joueur.y >= currentGroundY) {
					
					joueur.up = false;
					if(joueur.numberJumps == 1) {
						joueur.numberJumps--;
					}
					
				}
			}
			/////////////////////////////////////////////////////////////////////
		//}
	}
	
	function updateMeteorFrame(){
		
		//////////Creation aléatoire des météores///////////////
		if (frameDrawingSpeed % meteor_freq == 0) {
				
			var randomX = (Math.random() * (canvas.width) + 1);
			var randomImageMeteor = parseInt(Math.floor(Math.random() * 7));
			var newMeteor = new Meteor(assets.meteor, 0, 0, -1, -1, randomX - 30, - 200  * sizeFactor, -1, -1, 0, randomImageMeteor, 1, 8, 1024, 1024, 8, 8, sizeFactor);
			var centreDeGravite = newMeteor.x + (newMeteor.w / 2);

			
			for(var i= 0; i < listObjectsGround.length; i++) {
				var g = listObjectsGround[i];
				if ((g.x <= centreDeGravite) && (g.x + g.w >= centreDeGravite)) {
					newMeteor.groundcollision = g.getYByX(centreDeGravite);
					break;
				}
			}
			listObjectsMeteor.push(newMeteor);

			var randomSound = parseInt((Math.random() * 2 + 1));
			switch	(randomSound) {
				case 1:
					if (soundActivated) {
                        playSound(assets.meteorLaunch1);
						//meteorLaunch1.currentTime=0;
						//meteorLaunch1.play();
					}
				break;
				case 2:
					if (soundActivated) {
                        playSound(assets.meteorLaunch3);
						//meteorLaunch3.currentTime=0;
						//meteorLaunch3.play();
					}
				break;
				default:
					if (soundActivated) {
                        playSound(assets.meteorLaunch1);
					   //meteorLaunch1.currentTime=0;
					   //meteorLaunch1.play();
					}
				break;
			}
			
		}
		/////////////////////////////////////////////////////
		
		for(var i = 0; i < listObjectsMeteor.length; i++) {
			var meteore = listObjectsMeteor[i];
				
				meteore.curFrame = ++meteore.curFrame % meteore.frameCount;
				meteore.xImage = (meteore.spriteWidth - meteore.width) - meteore.curFrame * meteore.width;
				meteore.yImage = meteore.trackRight * meteore.height;
				meteore.y+= meteor_speed * sizeFactor;
				
				///////////////////////Si météore touche un joueur///////////////////////////////////
				for(var j = 0; j < listObjectsCharacters.length; j++) {
					var joueur = listObjectsCharacters[j];
					if ((meteore.y + 75 * sizeFactor >= joueur.y) && (meteore.y + 40 * sizeFactor <= joueur.y + joueur.h)) {
						
						var centreDeGraviteJoueurX = joueur.x + (joueur.w / 2);
						if ((centreDeGraviteJoueurX - 10 > meteore.x) && (centreDeGraviteJoueurX + 10 < meteore.x + meteore.w)) {
							gameState = etats.gameOver;
						}
					}
				}
				////////////////////////////////////////////////////////////////////////////////////////
			
            var facteurTaille = 45;
            if (sizeFactor > 1) {
                var amplitude = sizeFactor - 1;
                facteurTaille = facteurTaille - (90 * amplitude)
                //facteurTaille = 0;
            }
			if ((meteore.groundcollision != null) && (meteore.y > meteore.groundcollision + facteurTaille)) {
				newExplosion = new Explosion(assets.explosion, 0, 0, -1, -1, meteore.x - 55 * sizeFactor, meteore.groundcollision + facteurTaille, -1, -1, 0, 0, 1, 3, 768, 512, 4, 3, sizeFactor);
				listObjectsExplosion.push(newExplosion);
				meteorsNumber++;
				if (soundActivated) {
                    playSound(assets.meteorHit);
					//meteorHit.currentTime=0;
					//meteorHit.play();
				}
				listObjectsMeteor.splice(i, 1);
				i--;
			}
		}
	}
	
	
	function updateExplosionFrame(){
		
		for(var i = 0; i < listObjectsExplosion.length; i++) {
			var explosion = listObjectsExplosion[i];
			
			if (frameDrawingSpeed % 3 == 0) {
				explosion.curFrame = ++explosion.curFrame % explosion.frameCount;
				explosion.xImage = (explosion.spriteWidth - explosion.width) - explosion.curFrame * explosion.width;
				if (explosion.curFrame % 3 == 0) {
					explosion.trackRight++;
				}
				explosion.yImage = explosion.trackRight * explosion.height;
			}
			
			if (explosion.trackRight >= explosion.rows) {
				listObjectsExplosion.splice(i, 1);
				i--;
			}
		}
		
	}
	
	function levelUp() {
        var secondsLabel = document.getElementById("seconds").innerHTML;
		var minutesLabel = document.getElementById("minutes").innerHTML;
		
		if ((parseInt(minutesLabel) == 0) && (parseInt(secondsLabel) == 20)) {
			meteor_speed = 8;
		} else if ((parseInt(minutesLabel) == 0) && (parseInt(secondsLabel) == 30)) {
			listObjectsGround[1].setY(canvasHeight - (34));
			listObjectsGround[4].setY(canvasHeight - (30));
		} else if ((parseInt(minutesLabel) == 0) && (parseInt(secondsLabel) == 45)) {
			meteor_speed = 10;
			meteor_freq = 50;
		} else if ((parseInt(minutesLabel) == 2) && (parseInt(secondsLabel) == 0)) {
			meteor_speed = 11;
			meteor_freq = 35;
		} else if ((parseInt(minutesLabel) == 3) && (parseInt(secondsLabel) == 0)) {
			meteor_speed = 12;
			meteor_freq = 25;
		} else if ((parseInt(minutesLabel) == 4) && (parseInt(secondsLabel) == 0)) {
			meteor_freq = 10;
		} else if ((parseInt(minutesLabel) == 5) && (parseInt(secondsLabel) == 0)) {
			meteor_freq = 2;
			meteor_speed = 13;
		}
	}
	
	
	function draw(){
        
		switch (gameState) {
			case etats.menu: 
				drawMenu();
			break;
		
			case etats.game: 
				drawGame();
			  break;
			  
			  case etats.gameOver:
				drawGameOver();
			  break;
			  
			  case etats.options:
				drawOptions();
			  break;
		}
		
		requestAnimationFrame(draw);
	}
	
	function drawMenu() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);	
			//ctx.drawImage(menu, 0, 0, 1000, 667, 0, 0, 1200, 667);
			ctx.drawImage(assets.menu, 0, 0, 1980, 1113, 0 * sizeFactor, 0 * sizeFactor, 1200 * sizeFactor, 600 * sizeFactor);
			
			ctx.font = '' + 40 * sizeFactor + 'pt Calibri';
			
			if (inputStates.up) {
				pushUp = true;
			}
			if (inputStates.down) {
				pushDown = true;
			}
			if (inputStates.enter) {
				pushEnter = true;
			}
			
			if (pushUp) {
				if (inputStates.up == false) {
					if (currentSelectedMenu > 0) {
						currentSelectedMenu--;
						if (soundActivated) {
                            playSound(assets.button);
							//button.currentTime=0;
							//button.play();
						}
					}
					pushUp = false;
				}
			}
			
			if (pushDown) {
				if (inputStates.down == false) {
					if (currentSelectedMenu < listMenu.length - 1) {
						currentSelectedMenu++;
						if (soundActivated) {
							playSound(assets.button);
							//button.currentTime=0;
							//button.play();
						}
					}
					pushDown = false;
				}
			}
			
			for(var i= 0; i < listMenu.length; i++) {
				if (i == currentSelectedMenu) {
					ctx.fillStyle = '#36438D';
					
				} else {
					ctx.fillStyle = '#FCF4D5';
					ctx.fillStyle = '#83A5D9';
					
				}					
				ctx.fillText(listMenu[i], 100 * sizeFactor, 100 * i  * sizeFactor + 100 * sizeFactor);
			}
			
			
			if (pushEnter) {
			
				if (inputStates.enter) {
					pushEnter = false;
					switch(currentSelectedMenu) {
						case 0:
							ctx.clearRect(0, 0, canvasWidth, canvasHeight);
							ResetParamGame();
							inputStates.enter = false;
							gameState = etats.game;
						break;
						
						case 1:
							gameState = etats.options;
							inputStates.enter = false;
						break;
						
						case 2:
							window.open('','_parent','');
							window.close();;
						break;
					}
				}
			}
	}
    
    function display(numJoueur) {
        return function() {
            updatePlayerFrame(numJoueur);
         }(numJoueur);
    }
	
	function drawGame() {
				frameDrawingSpeed++;
				levelUp();
				//updatePlayerFrame();
                //Impossible sans closure
				for(var i = 0; i < listObjectsCharacters.length; i++) {
					/*window.setTimeout(function display(numJoueur) {
                        return function() {
                            updatePlayerFrame(numJoueur);
                        };
					}(i), 10);*/
					display(i);
				}
				updateMeteorFrame();
				updateExplosionFrame();
				
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);
				//Dessin du fond
				ctx.drawImage(assets.background, 0, 0, 1920, 1200, 0 * sizeFactor, - 200 * sizeFactor, 1200 * sizeFactor, 800 * sizeFactor);
				displayScore();
				
				//Dessin des joueurs
				for(var i= 0; i < listObjectsCharacters.length; i++) {
					var c = listObjectsCharacters[i];
					ctx.drawImage(c.image, c.xImage, c.yImage, c.wImage, c.hImage, c.x, c.y, c.w, c.h);
				}
				
				//Dessin des météores
				for(var i= 0; i < listObjectsMeteor.length; i++) {
					var m = listObjectsMeteor[i];
					ctx.drawImage(m.image, m.xImage, m.yImage, m.wImage, m.hImage, m.x, m.y, m.w, m.h);
				}
				
				//Dessin des explosions
				for(var i= 0; i < listObjectsExplosion.length; i++) {
					var e = listObjectsExplosion[i];
					ctx.drawImage(e.image, e.xImage, e.yImage, e.wImage, e.hImage, e.x, e.y, e.w, e.h);
				}
				
				//Dessin du sol
				for(var i= 0; i < listObjectsGround.length; i++) {
					var g = listObjectsGround[i];
					 ctx.drawImage(g.image, g.xImage, g.yImage, g.wImage, g.hImage, g.x, g.y, g.w, g.h);
                }
	}
	
	
	function drawGameOver() {
					///////Dessin du fond et du score
					ctx.clearRect(0, -178 * sizeFactor, 1200 * sizeFactor, 375 * sizeFactor);
					ctx.drawImage(assets.background, 0, 0, 1920, 600,  0 * sizeFactor, -177 * sizeFactor, 1200 * sizeFactor, 375 * sizeFactor);
					ctx.font = '' + 40 * sizeFactor + 'pt Calibri';
					ctx.fillStyle = '#83A5D9';
					ctx.fillText("Score : " + document.getElementById("minutes").innerHTML + ":" + 
					document.getElementById("seconds").innerHTML , canvasWidth / 2 - 175 * sizeFactor, 50 * sizeFactor);
					ctx.fillText("Game over : Press Enter for menu" , canvasWidth / 2 - 400 * sizeFactor, 100 * sizeFactor);
					displayScore();
					
					///////////////////
					if (inputStates.enter) {
						inputStates.enter = false;
						gameState = etats.menu;
						listObjectsMeteor = [];
						
						for(var i = 0; i < listObjectsCharacters.length; i++) {
							var joueur = listObjectsCharacters[i];
							joueur.x = 0;
							joueur.y = 350 * sizeFactor;
							joueur.left = false;
							joueur.right = false;
							joueur.up = false;
						}
					}
	}
	
	function drawOptions() {
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);
				ctx.font = '' + 40 * sizeFactor + 'pt Calibri';
				ctx.drawImage(assets.options, 0, 0, 1920, 1080, -200 * sizeFactor, - 200 * sizeFactor, 1400 * sizeFactor, 800 * sizeFactor);
				
				if (inputStates.up) {
					pushUp = true;
				}
				if (inputStates.down) {
					pushDown = true;
				}
				if (inputStates.enter) {
					pushEnter = true;
				}
				if (inputStates.escape) {
					pushEscape = true;
				}
				if (inputStates.left) {
					pushLeft = true;
				}
				if (inputStates.right) {
					pushRight = true;
				}
				
				if (pushUp) {
					if (inputStates.up == false) {
						if (currentSelectedOption > 0) {
							currentSelectedOption--;
							if (soundActivated) {
                                playSound(assets.button);
								//button.currentTime=0;
								//button.play();
							}
						}
						pushUp = false;
					}
				}
				
				var iTableauOptions = 0;
				for (o in listOptions) ++iTableauOptions;
				if (pushDown) {
					if (inputStates.down == false) {
						if (currentSelectedOption < iTableauOptions - 1) {
							currentSelectedOption++;
							if (soundActivated) {

                                playSound(assets.button);
								/*button.currentTime=0;
								button.play();*/
							}
						}
						pushDown = false;
					}
				}
				
				if (pushEnter) {
					if (inputStates.enter == false) {
						switch(currentSelectedOption) {
							case 0: //Adapter l'écran
								var sizeOption = false;
								if (sizeFactor == 1) {
									sizeFactor = COEFF_SIZEFACTOR;
									sizeOption = true;
								} else {
									sizeFactor = 1;
									sizeOption = false;
								}
								canvasWidth = parseInt(1200 * sizeFactor); 
								canvasHeight = parseInt(600 * sizeFactor);
								canvas.width = canvasWidth;
								canvas.height = canvasHeight;
								listOptions["Adapter la taille de l'écran"] = sizeOption;
								listObjectsCharacters = [];
								listObjectsGround = [];
								InitMapObjects();
								InitEvents();
							break;
							case 1: ////Son activé
								var active = listOptions["Activer le son"];
								if (active) {
									soundActivated = false;
								} else {
									soundActivated = true;
								}
								listOptions["Activer le son"] = soundActivated;
							
							break;
						}
						pushEnter = false;
					}
				}
				if (pushLeft) {
					if (inputStates.left == false) {
						if (currentSelectedOption == 2) {
							if (listOptions["Nombre de joueurs"] > 1) {
								listOptions["Nombre de joueurs"] = listOptions["Nombre de joueurs"] - 1;
								if (listObjectsCharacters.length >= 2) {
									AddPlayers();
									InitEvents();
								}
							}
							pushLeft = false;
						}
					}
				}
				if (pushRight) {
					if (inputStates.right == false) {
						if (currentSelectedOption == 2) {
							if (listOptions["Nombre de joueurs"] < 2) {
								listOptions["Nombre de joueurs"] = listOptions["Nombre de joueurs"] + 1;
								AddPlayers();
								InitEvents();
							}
							pushRight = false;
						}
					}
				}
				
				if (pushEscape) {
					if (inputStates.escape == false) {
						gameState = etats.menu;
						pushEscape = false;
					}
				}
				
				var i = 0;
				for(var key in listOptions) {
					var value = listOptions[key];
					var valueAffiche = value.toString();
					if (value ===  true) {
						valueAffiche = "Oui";
					} else if (value ===  false) {
						valueAffiche = "Non";
					}
					if (i == currentSelectedOption) {
						ctx.fillStyle = '#36438D';
						
					} else {
						ctx.fillStyle = '#83A5D9';
					}
					if (i == 2) {
						valueAffiche = "< " + valueAffiche + " >";
					}
					ctx.fillText(key, canvasWidth / 2 - 400 * sizeFactor, 100 * (i) * sizeFactor + 100 * sizeFactor);
					ctx.fillText(valueAffiche , canvasWidth / 2 + 300 * sizeFactor, 100 * (i) * sizeFactor + 100 * sizeFactor);
					i++;
				}
				ctx.fillStyle = '#83A5D9';
				ctx.fillText("Appuyez sur échap pour retourner au menu" , canvasWidth / 2 - 500 * sizeFactor, 100 * (i + 0.8) * sizeFactor + 100 * sizeFactor);
			
	}
	
	function displayScore() {
		ctx.font = '20pt Calibri';
		ctx.fillStyle = '#83A5D9';
		ctx.fillText("Score : " + meteorsNumber ,10 , 30);
	}

	//Touches pour le mouvement
	function onKeyDownAll(event) {
		if(window.event) {                    
			keynum = event.keyCode;
		} else if(event.which){                 
		  keynum = event.which;
		}
		
		///////////Pour tous les joueurs//////////
		//if (gameState != etats.game) {
			if(keynum == 13) {
				inputStates.enter = true;
			}
			if (keynum == 38) {
				inputStates.up = true;
			}
			if (keynum == 40) {
				inputStates.down = true;
			}
			if (keynum == 27) {
				inputStates.escape = true;
			}
			if (keynum == 37) {
				inputStates.left = true;
			}
			if (keynum == 39) {
				inputStates.right = true;
			}
	//	}
		//////////////////////////////////////////
		
	}
	
	function onKeyUpAll(event) {
		if(window.event) {                   
		  keynum = event.keyCode;
		} else if(event.which){                 
		  keynum = event.which;
		}
		
		///////////Pour tous les joueurs//////////
		//if (gameState != etats.game) {
			if (keynum == 13) {
				inputStates.enter = false;
			}
			if (keynum == 38) {
				inputStates.up = false;
			}
			if (keynum == 40) {
				inputStates.down = false;
			}
			if (keynum == 27) {
				inputStates.escape = false;
			}
			if (keynum == 37) {
				inputStates.left = false;
			}
			if (keynum == 39) {
				inputStates.right = false;
			}
		//}
		//////////////////////////////////////////
	}
	
	function onKeyDown(numJoueur, window, listObjectsCharacters) {
		if(window.event) {                    
			keynum = event.keyCode;
		}
		
		if (gameState == etats.game) {			
				var joueur = listObjectsCharacters[numJoueur];
					
				if (keynum == joueur.keynumLeft) {
					joueur.left = true;
					joueur.isOnLeft = true; 
					joueur.isOnRight = false;
				}
				if(keynum == joueur.keynumRight) {
					joueur.right = true;
					joueur.isOnLeft = false;
					joueur.isOnRight = true;
				}
				if(keynum == joueur.keynumUp) {
						
					if ((!joueur.down) &&  (!joueur.jump) && (joueur.numberJumps < MAX_JUMP)){
						joueur.up = true;
						joueur.beforeJumpY = joueur.y;
						joueur.numberJumps++;
					}
				}
				if(keynum == joueur.keynumDown) {
					//joueur.down = true;
				}
		}
			
		
	}
	function onKeyUp(numJoueur, window, listObjectsCharacters) {
		if(window.event) {                   
		  keynum = event.keyCode;
		} 
        
		if (gameState == etats.game) {
				var joueur = listObjectsCharacters[numJoueur];
				if (keynum == joueur.keynumLeft) {
					joueur.left = false;
				}
				if(keynum == joueur.keynumRight) {
					joueur.right = false;
				}
				if(keynum == joueur.keynumUp) {
					joueur.up = false;
				}
				if(keynum == joueur.keynumDown) {
						//joueur.down = false;
                }
		}
	}

	function InitTime() {
		var minutesLabel = document.getElementById("minutes");
        var secondsLabel = document.getElementById("seconds");
		
        setInterval(setTime, 1000);

        function setTime()
        {
			if (gameState == etats.game) {
				var totalSeconds = parseInt(document.getElementById("seconds").innerHTML);
				var totalMinutes = parseInt(document.getElementById("minutes").innerHTML);
				++totalSeconds;
				if (totalSeconds == 60) {
					totalSeconds = 0;
					minutesLabel.innerHTML = pad(totalMinutes + 1);
				}
				secondsLabel.innerHTML = pad(totalSeconds);
			}
        }

        function pad(val)
        {
            var valString = val + "";
            if(valString.length < 2)
            {
                return "0" + valString;
            }
            else
            {
                return valString;
            }
        }
	}
	
	function InitEvents() {
	
		for(var i= 0; i < listObjectsCharacters.length;  i++) {
			var currentPlayer = i;
			
			window.addEventListener("keydown", ( function(numJoueur, window, listObjectsCharacters) {
				return function() {onKeyDown(numJoueur, window, listObjectsCharacters);};
			})(i, window, listObjectsCharacters), false);
			window.addEventListener("keyup", ( function(numJoueur, window, listObjectsCharacters) {
				return function() {onKeyUp(numJoueur, window, listObjectsCharacters);};
			})(i, window, listObjectsCharacters), false);
			
		}
	}
	
	function ResetParamGame() {
		document.getElementById("minutes").innerHTML = "00";
		document.getElementById("seconds").innerHTML = "00";
		if (listObjectsCharacters.length > 1) {
			listObjectsCharacters[1].x = 300 * sizeFactor;
		}
		meteor_speed = 6;
		meteor_freq = 80;
		meteorsNumber = 0;
		listObjectsExplosion = [];
		listObjectsMeteor = [];
		listObjectsGround[0].setY(canvasHeight - 150);
		listObjectsGround[1].setY(canvasHeight - 139);
		listObjectsGround[2].setY(canvasHeight - 30);
		listObjectsGround[3].setY(canvasHeight - 135);
		listObjectsGround[4].setY(canvasHeight - 135);
		listObjectsGround[5].setY(canvasHeight - 275);
	}
    
    function playSound(sound) {
        sound.currentTime=0;
        sound.play();
    }
    
	window.addEventListener("keydown", onKeyDownAll);
	window.addEventListener("keyup", onKeyUpAll);
	
	
    
    
    function allAssetsLoaded(assetsLoaded) {
        console.log("all samples loaded and decoded");
        for (var asset in assetsLoaded) {
            assets[asset] = assetsLoaded[asset];
        }
    }
    

    var assetsToLoadURLs = {
        background: { url: 'Images/background.jpg' }, 
        character: { url: "Images/sprites2.png" },
        character2: { url:"Images/sprites3.png" },
        ground: { url:"Images/ground1.png" },
        meteor: { url: "Images/spritemeteor.png" },
        explosion: { url: "Images/explosion.png" },
        menu: { url: "Images/menu1980.jpg" },
        options: { url: "Images/options.jpg" },

        button: { url: 'Sounds/MouseClick1.mp3', buffer: false, loop: false, volume: 1.0 },
        meteorLaunch1: { url: 'Sounds/GlueScreenMeteorLaunch1.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorLaunch2: { url: 'Sounds/InfernalBirth1.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorLaunch3: { url: 'Sounds/GlueScreenMeteorLaunch3.mp3', buffer: true, loop: true, volume: 1.0 },
        meteorHit: { url: 'Sounds/GlueScreenMeteorHit3.mp3', buffer: true, loop: true, volume: 1.0 }

    };

    function loadAssets(callback) {
        // here we should load the souds, the sprite sheets etc.
        // then at the end call the callback function           
        loadAssetsUsingHowlerAndNoXhr(assetsToLoadURLs, callback);
    }

    // You do not have to understand in details the next lines of code...
    // just use them!

    /* ############################
        BUFFER LOADER for loading multiple files asyncrhonously. The callback functions is called when all
        files have been loaded and decoded 
     ############################## */
    function isImage(url) {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function isAudio(url) {
        return (url.match(/\.(mp3|ogg|wav)$/) != null);
    }

    function loadAssetsUsingHowlerAndNoXhr(assetsToBeLoaded, callback) {
        var assetsLoaded = {};
        var loadedAssets = 0;
        var numberOfAssetsToLoad = 0;

        // define ifLoad function
        var ifLoad = function () {
            if (++loadedAssets >= numberOfAssetsToLoad) {
                callback(assetsLoaded);
            }
            console.log("Loaded asset " + loadedAssets);
        };

        // get num of assets to load
        for (var name in assetsToBeLoaded) {
            numberOfAssetsToLoad++;
        }

        console.log("Nb assets to load: " + numberOfAssetsToLoad);

        for (name in assetsToBeLoaded) {
            var url = assetsToBeLoaded[name].url;
            console.log("Loading " + url);
            if (isImage(url)) {
                assetsLoaded[name] = new Image();

                assetsLoaded[name].onload = ifLoad;
                // will start async loading. 
                assetsLoaded[name].src = url;
            } else {

                assetsLoaded[name] = new Audio([url]);

                if (++loadedAssets >= numberOfAssetsToLoad) {
                            callback(assetsLoaded);
                 }
            } // if

        } // for
    } // function
    
    loadAssets(function (assets) {
                allAssetsLoaded(assets);
                InitTime();
                InitMapObjects();
                InitEvents();
                draw();
            });

}
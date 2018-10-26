var sprites = {
                ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
                missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
                enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
                enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
                enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
                enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
                explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
                enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1, }
            }

var playerships = {
    ship1:{sprite:'ship',velocity:250,reloadTime:0.25,health:1000}
}

var missileSilo = {
    missile1:{velocity:700,sprite:'missile',damage:9},
    missile2:{velocity:150,sprite:'enemy_missile',damage:15}
}

var enemies = {
  straight: { x: 0,  y: -50, sprite: 'enemy_ship', health: 10, 
              E: 110 ,damage:500,points:200,reloadTime:0.75 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100, missiles: 2 ,damage:500,points:300,reloadTime:1.5 },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 ,damage:500,points:250,reloadTime:2.0},
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: 4, E: 100, firePercentage: 0.04, missiles: 2,damage:500 ,points:100,reloadTime:2.0},
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 ,damage:200,points:900,reloadTime:1.8}
};

var levels = {
    level1: [
             [ 0,      4000,  500, 'step' ],
             [ 6000,   13000, 800, 'ltr' ],
             [ 10000,  16000, 400, 'circle' ],
             [ 17800,  20000, 500, 'straight', { x: 50 } ],
             [ 18200,  20000, 500, 'straight', { x: 90 } ],
             [ 18200,  20000, 500, 'straight', { x: 10 } ],
             [ 22000,  25000, 400, 'wiggle', { x: 150 }],
             [ 22000,  25000, 400, 'wiggle', { x: 100 }]]
};


var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

   function startGame(){
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,70));
    Game.setBoard(2,new Starfield(100,0.8,50));
    Game.setBoard(3,new TitleScreen("Space Attack!","Press space to start playing",playGame));
    }
    var playGame =  function(){
        //Game.setBoard(3,new TitleScreen("Space Attack!","Game Started..."));
        //Game.setBoard(3,new PlayerShip(200));
        var board = new GameBoard();
        // board.add(new Enemy(enemies.straight));
        // board.add(new Enemy(enemies.circle));
        board.add(new Level(levels.level1,winGame));
        board.add(new PlayerShip(playerships.ship1));
        Game.setBoard(3,board);
        Game.setBoard(5,new GamePoints());
    }
    var loseGame = function() {
        Game.setBoard(3,new TitleScreen("You lose!","Press Fire to play again...",playGame));
    }
    var winGame = function(){
        Game.setBoard(3,new TitleScreen("You win!","Press Fire to play again...",playGame))
    }
window.addEventListener('DOMContentLoaded',function(){
    Game.init("game",sprites,startGame)
});

var Starfield = function(speed,opacity,numStars,clear){
   
    var speed = speed;
    var starCanvas = document.createElement("canvas");
    var starContext = starCanvas.getContext("2d");
    starCanvas.width = Game.width;
    starCanvas.height = Game.height;

    var offset = 0;

    if(clear)
    {
        starContext.fillStyle = "#000";
        starContext.fillRect(0,0,starCanvas.width,starCanvas.height);
    }

    starContext.fillStyle = "#fff";
    starContext.globalAlpha = opacity;

    for (var i = 0; i < numStars; i++) {
        starContext.fillRect(Math.floor(Math.random()*starCanvas.width),
                                        Math.floor(Math.random()*starCanvas.height),
                                        2,2);
    }
    this.draw = function(ctx){
        var intOffset = Math.floor(offset);
        var remaining = starCanvas.height - intOffset;

        if(intOffset > 0){
            ctx.drawImage(starCanvas,0,remaining,starCanvas.width,intOffset,
            0,0, starCanvas.width,intOffset);
        }
        if(remaining > 0)
        {
            ctx.drawImage(starCanvas,0,0,starCanvas.width,remaining,0,intOffset,starCanvas.width,remaining);
        }
    }

    this.step = function(dt){
        offset += dt * speed;
        offset = offset % starCanvas.height;
    }

}

var PlayerShip = function(ship){

    this.setup(ship.sprite,ship);
    this.x =  Game.width/2 - this.w /2;
    this.y =  Game.height - 10 - this.h - Game.playerOffset;
    this.vx=0;
    var maxdisplacement = Game.width - this.w ;
    this.reload = this.reloadTime;
    this.step = function(dt)
     {
         if(Game.keys['left']){
             this.vx = -this.velocity;
              this.x += this.vx * dt;
         }
         if(Game.keys['right']){
             this.vx = this.velocity;
              this.x += this.vx * dt;
         }
        // this.x += this.vx * dt;
  
         if(this.x < 5) {
             this.x = 5;
         }
  
         if(this.x >= (maxdisplacement-5))
         {this.x = maxdisplacement - 5;}

         this.reload-=dt;
         if(Game.keys['fire'] && this.reload <=0)
         {
             Game.keys['fire']=false;
             this.reload = this.reloadTime;
             this.board.add(new PlayerMissile(this.x,this.y+this.h/2,missileSilo.missile1));
             this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2,missileSilo.missile1));
         }
     }
}

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;
PlayerShip.prototype.hit = function(damage){
                                this.health-=damage;
                                if(this.health <=0)
                                {
                                    if(this.board.remove(this))
                                    {
                                        this.board.add(new Explosion(this.x+ this.w/2, this.y + this.h/2,loseGame));
                                    }
                                }
                            }

var PlayerMissile = function(x,y,missile){
    this.setup(missile.sprite,missile);
    this.x = x - this.w/2;
    this.y = y - this.h;
    this.vy = -this.velocity;

    this.step = function(dt){
        this.y+= dt * this.vy;
        var collision = this.board.collide(this,OBJECT_ENEMY | OBJECT_ENEMY_PROJECTILE);
        if(collision)
        {
            collision.hit(this.damage);
            this.board.remove(this);
        }
        else if(this.y < -this.h){this.board.remove(this);}
    }

    this.draw = function(ctx){
        SpriteSheet.draw(ctx,'missile',this.x,this.y);
    }
}
PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

var Enemy = function(blueprint,override){
    
    this.merge(this.baseparameters);
    this.setup(blueprint.sprite,blueprint);
    this.merge(override);
    this.t = 0;
    this.reload =  this.reloadTime;
 
    this.step = function(dt)
    {
        this.t += dt;
        this.vx = this.A + this.B * Math.sin(this.C * this.t) + this.D
        this.vy = this.E + this.F * Math.sin(this.G * this.t) + this.H
        this.x+= this.vx * dt;
        this.y+= this.vy * dt;
        this.reload -= dt;
        if(this.reload<0 && Math.random() < this.firePercentage)
        {
            this.reload = this.reloadTime;
           if(this.missiles = 2){
            this.board.add(new EnemyMissile(this.x,this.y + this.h/2,missileSilo.missile2));
            this.board.add(new EnemyMissile(this.x + this.w,this.y + this.h/2,missileSilo.missile2));
           }
           else{
            this.board.add(new EnemyMissile(this.x + this.w/2,this.y + this.h/2,missileSilo.missile2));

           }
        }
        var collision = this.board.collide(this,OBJECT_PLAYER);
        if(collision)
        {
            collision.hit(this.damage);
            this.board.remove(this);
        }
        
        if(this.y > Game.height || 
            this.x < -this.w ||
            this.x > Game.width)
            {
                this.board.remove(this);
            }
    }
    
}



Enemy.prototype = new Sprite();
Enemy.prototype.baseparameters={
    A:0,B:0,C:0,D:0,
    E:0,F:0,G:0,H:0, firePercentage:0.05 ,missiles:1
    };
Enemy.prototype.type = OBJECT_ENEMY;
Enemy.prototype.hit = function(damage){
        this.health-=damage;
        if(this.health <=0)
        {
            Game.points += this.points ||100;
            if(this.board.remove(this))
            {
                this.board.add(new Explosion(this.x + this.w/2, this.y + this.h/2));
            }
        }
}

var Explosion = function(x,y,callback){
    this.setup('explosion',{frame:0});
    this.subFrame=0;
    this.x = x;
    this.y= y;
    this.callback = callback || false;

    this.step = function(dt){
        this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
    if(this.callback)
    {this.callback();}
  }
    }
}
Explosion.prototype =  new Sprite();

var Level = function(levelData,callback){
    this.levelData = [];
    for (var i=0; i < levelData.length;i++)
    {
        this.levelData.push(Object.create(levelData[i]));
    }
    
    this.t = 0;
    this.callback = callback;

    this.step = function(dt)
    {
        this.t += dt * 1000;
        var remove =[];

        for(var i=0;i<this.levelData.length;i++)
        {
            var curShip = this.levelData[i];
            if(!curShip)
                break;
            if(curShip[0] <this.t + 2000)
            {
                if(curShip[0] < this.t)
                {
                    var enemy = enemies[curShip[3]];
                    override = curShip[4];
                    this.board.add(new Enemy(enemy,override));

                    curShip[0] += curShip[2];
                }
                else if(this.t > curShip[1]){
                    remove.push(curShip);
                }
            }
        }

        for(var i=0;i<remove.length;i++)
        {
            var index = this.levelData.indexOf(remove[i]);
            if(index!=-1)
            {
                this.levelData.splice(index,1);
            }
        }

        if(this.levelData.length == 0 && this.board.cnt[OBJECT_ENEMY]==0)
        {
            if(this.callback)
            {
                this.callback();
            }
        }
    }

    this.draw = function(ctx){

    }
}

var EnemyMissile = function(x,y,missile){
    this.setup(missile.sprite,missile);
    this.vy= this.velocity;
    this.x = x - this.w/2;
    this.y = y;
    
    this.step = function(dt){
        this.y+= dt * this.vy;
        var collision = this.board.collide(this,OBJECT_PLAYER)
        if(collision){
            collision.hit(this.damage);
            this.board.remove(this);
        }

        if(this.y > Game.height)
        {
            this.board.remove(this);
        }
    }

}


EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;
EnemyMissile.prototype.hit = function(damage){
    Game.points+=800;
    if(this.board.remove(this))
      {
          this.board.add(new Explosion(this.x+ this.w/2, this.y + this.h/2));
      }
    
}
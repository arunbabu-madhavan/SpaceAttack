var spriteImageUrl = 'sprites.png';

var Game = new function()
{
    this.init = function(canvasId,sprite_data,callBack){
        this.canvas= document.getElementById('game');
        this.context = this.canvas.getContext("2d");
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.playerOffset =40;
        this.points =0;
        this.canvasMultiplier =1;
        if(!this.context) {return alert('Please upgrade your browser!');}
        
        this.setupInput();
        this.setBoard(4,new TouchControls());
        this.loop();
        
        SpriteSheet.load(sprite_data,callBack);

    }
    
  // Handle Input
  var KEY_CODES = { 37:'left', 39:'right', 32 :'fire', 38:'up', 40:'down' };
  this.keys = {};

  this.setupInput =  function(){
      window.addEventListener('keydown',function(e){
        if(KEY_CODES[e.keyCode]){
            Game.keys[KEY_CODES[e.keyCode]] =  true;
            e.preventDefault();
        }          
      },false);

      window.addEventListener('keyup',function(e){
           if(KEY_CODES[e.keyCode]){
            Game.keys[KEY_CODES[e.keyCode]] =  false;
            e.preventDefault();
        }  
      },false);
  } 
  var boards = [];
  var lastTime =  new Date().getTime();
  var maxTime = 1/30;
  this.loop = function(){
      var curTime = new Date().getTime();
      requestAnimationFrame(Game.loop);
      var dt = (curTime - lastTime)/1000;
      if(dt>maxTime){dt=maxTime;}

      for (var index = 0; index < boards.length; index++) {
          if(boards[index])
          {
              boards[index].step(dt);
              boards[index].draw(Game.context);
          }
          lastTime =  curTime;
          
      }
  }

  this.setBoard = function(num,board){
      boards[num] = board;
  }

}

var SpriteSheet = new function()
{
    this.map={};

    this.load = function(spriteData,callBack)
    {
        this.map = spriteData;
        this.image = new Image();
        this.image.src =spriteImageUrl;
        this.image.onload = callBack;
    }
    this.draw = function(ctx,sprite,x,y,frame)
    {
        frame = frame || 0;
        var s = this.map[sprite];
        ctx.drawImage(this.image,s.sx + frame * s.w, 
                 s.sy,
                 s.w,
                 s.h,
                 x,
                 y,
                 s.w,
                 s.h         
                );
    }

}

var TitleScreen = function TitleScreen(title,subtitle,callBack)
{
    this.step = function(dt){
        if(Game.keys['fire'] && callBack){
            callBack();
        }
    }
    this.draw = function(ctx){
        ctx.fillStyle = '#f00';
        ctx.textAlign = 'center';

        ctx.font = 'bold 40px bungee';
        ctx.fillText(title,Game.width/2,Game.height/2);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px bungee';
        ctx.fillText(subtitle,Game.width/2,Game.height/2 + 50);
    }
}

var GameBoard = function(){
    var board = this;
    this.objects = [];
    this.cnt = [];

    this.add = function(obj){
        obj.board = this;
        this.objects.push(obj);
        this.cnt[obj.type] = (this.cnt[obj.type]|| 0 ) + 1;
        return obj;
    }
    this.removed=[];
    
    this.resetRemoved = function(){
        this.removed = [];
    }


    this.remove = function(obj){
      
        var isAlive =this.removed.indexOf(obj)==-1
        if(isAlive)
        {
            this.removed.push(obj);
            return true;
        }
        else
            return false;
    }

    this.finalizeRemove = function(){
        for(var i=0;i<this.removed.length;i++)
        {
            var index = this.objects.indexOf(this.removed[i]);
            if(index!=-1)
            {
                this.cnt[this.objects[index].type]--; 
                this.objects.splice(index,1);
            }
        }
    }

    this.iterate = function(functionName){
        var args = Array.prototype.slice.call(arguments,1);
        for(var i=0;i<this.objects.length;i++)
        {
            var obj = this.objects[i];
            obj[functionName].apply(obj,args);
        }
    }

    this.detect = function(functionhandler){
        for(var i=0;i<this.objects.length;i++)
        {
             if(functionhandler.call(this.objects[i])){return this.objects[i];}
        }
        return false;
    }

    this.step= function(dt){
        this.resetRemoved();
        this.iterate('step',dt);
        this.finalizeRemove();
    }

    this.draw = function(ctx){
        this.iterate('draw',ctx);
    }

    this.overlap= function(obj1,obj2){
        return !(((obj1.y + obj1.h < obj2.y) || (obj1.y > obj2.h + obj2.y -1 )) || 
                 ((obj1.x+obj1.w-1<obj2.x) || (obj1.x>obj2.x+obj2.w-1)));
    }
    this.collide = function(obj,type){
        return this.detect(function(){
            if(obj!=this)
            {
                var collision = (!type || type & this.type) && this.board.overlap(obj,this);
                return collision ? this:false;
            }
        });
    }
}

var Sprite = function(){
    this.merge = function(props){
        if(props)
        {
            for (var prop in props)
                this[prop] = props[prop];
        }
    }
    this.setup = function(sprite,props){
        this.sprite = sprite;
        this.merge(props);
        this.frame = this.frame || 0;
        this.w = SpriteSheet.map[this.sprite].w;
        this.h = SpriteSheet.map[this.sprite].h;
    }
    this.draw = function(ctx){
        SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
    }
    this.hit = function(damage){
        this.board.remove(this);
    }
};

var TouchControls = function(){
    var gutterWidth = 10;
    var unitWidth = Game.width/4;
    var blockWidth = unitWidth - gutterWidth;
    var blockheight = Game.playerOffset;
    this.drawSquare = function(ctx,x,y,txt,on,fireButton){
        ctx.globalAlpha = on ? 0.9:0.6;
        ctx.fillStyle - '#ccc';
        var boxWidth = fireButton ? Game.width - unitWidth  - x - 10:blockWidth;
        ctx.fillRect(x,y,boxWidth,blockheight);

        ctx.fillStyle = "#FFF";
        ctx.textAlign ="center";
        ctx.globalAlpha = 1;

        ctx.font = "bold " + (blockheight) + "px bungee";
        
        ctx.fillText(txt,x+boxWidth/2 ,y + blockheight -5);


    }
      this.draw = function(ctx) {
    ctx.save();

    var yLoc = Game.height - blockheight - 10 ;
    this.drawSquare(ctx,gutterWidth,yLoc,"\u25C0", Game.keys['left']);
    this.drawSquare(ctx,Game.width - unitWidth,yLoc,"\u25B6", Game.keys['right']);
    this.drawSquare(ctx,unitWidth + gutterWidth,yLoc,"\u25C9",Game.keys['fire'],true);

    ctx.restore();
  };

  this.trackTouch = function(e){
      var touch,x;
      e.preventDefault();
     
          Game.keys['left'] =false;
          Game.keys['right'] =false;
      for(var i =0;i<e.targetTouches.length;i++)
      {
          touch = e.targetTouches[i];
          x= touch.pageX /Game.canvasMultiplier - Game.canvas.offsetLeft;
          y= touch.pageY /Game.canvasMultiplier - Game.canvas.offsetTop;
          if(y > Game.height - blockheight)
            {if(x < unitWidth)
            {
               Game.keys['left'] = true;
            }

            if(x > Game.width - unitWidth)
            {
                 Game.keys['right'] = true;
            }

            
          }

      }

      for(var i =0;i<e.changedTouches.length;i++)
      {
            touch = e.changedTouches[i];
            x= touch.pageX /Game.canvasMultiplier - Game.canvas.offsetLeft;
          y= touch.pageY /Game.canvasMultiplier - Game.canvas.offsetTop;
          if(y > Game.height - blockheight)
          {
            if(e.type=='touchstart' || e.type =='touchend')
            {
                if(x > unitWidth && x < Game.width - unitWidth)
                {
                    Game.keys['fire'] = e.type=='touchstart';  
                }
            }    
          }
      }


      
      
  }
  
  Game.canvas.addEventListener('touchstart',this.trackTouch,true);
  Game.canvas.addEventListener('touchmove',this.trackTouch,true);
  Game.canvas.addEventListener('touchend',this.trackTouch,true);

  // For Android
  Game.canvas.addEventListener('dblclick',function(e) { e.preventDefault(); },true);
  Game.canvas.addEventListener('click',function(e) { e.preventDefault(); },true);

  this.step = function(dt) { };
}

var GamePoints = function(){
    Game.points=0;
    var pointslength = 8;

    this.draw = function(ctx){
        ctx.save();
        ctx.font = "bold 18px arial";
        ctx.fillStyle = "#fff";
        var score = Game.points.toString();
        var zeros = "";
        for(var i=0;i<(pointslength - score.length);i++)
        {
            zeros+="0";
        }
        ctx.fillText(zeros+score,30,20);
        ctx.restore();
    }
    this.step = function(dt){
    }
}
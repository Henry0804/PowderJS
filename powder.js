//Api
var Powder = {};
Powder.Paused = false;
Powder.Step = false;
Powder.Api = {};
Canvas.onmousemove = function (e) {Powder.Mouse = e;}
Canvas.onmousedown = function (e) {Powder.Mouse = e;}
Canvas.onmouseup = function (e) {Powder.Mouse = e;}
Powder.Mouse = {};



//Vector Class
class Vector {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  static HasMotion(Vec) {
    return Boolean(Vec.x|Vec.y);
  }
}






//Game update, render, and motion settings/functions
Powder.Elements = [];//Particles have global properties,
Powder.Objects = [];
Powder.Options = {Gravity:1};
Powder.Width = 1000;
Powder.Height = 1000;
Powder.AreaWidth = 200;
Powder.AreaHeight = 200;

Powder.Render = function () {
  if (Keyboard.w) {
    Powder.Render.Offset.y++;
  }
  if (Keyboard.s) {
    Powder.Render.Offset.y--;
  }
  if (Keyboard.a) {
    Powder.Render.Offset.x++;
  }
  if (Keyboard.d) {
    Powder.Render.Offset.x--;
  }
  var z = Powder.Render.Zoom,o = Powder.Render.Offset,f = Math.floor,r = Math.round;
  z = 1-z;
  Draw.fillStyle = "white";
  Draw.fillRect(0,0,Powder.Width,Powder.Height);
  //Draw gridlike lines.
  var Switch = true;
  var incW = Powder.Width/(Powder.AreaWidth*z);
  var incH = Powder.Height/(Powder.AreaHeight*z);

  Powder.Objects.forEach((Obj, i) => {
   Draw.fillStyle = Obj.constructor.Color[Obj.CurrentColor];
   Draw.fillRect(Obj.Position.x*incW+o.x*incW,Obj.Position.y*incH+o.y*incH,incW,incH);
  });
  //Render cursor
  Draw.fillStyle = "red";
  Draw.globalAlpha = 0.5;
  Draw.fillRect(Math.floor(Powder.Mouse.offsetX/incW)*incW,Math.floor(Powder.Mouse.offsetY/incH)*incH,incW,incH);
  Draw.globalAlpha = 1;

  Draw.strokeStyle = "gray";
  var w = r( 3*(1-z) );
  Draw.lineWidth = w;
  if (w!=0) {
    for (var x = 0; x < Powder.Width/incW; x++) {
      for (var y = 0; y < Powder.Height/incH; y++) {
        Draw.strokeRect(x*incW,y*incH,incW,incH);

      }
    }
  }

}



Powder.Render.Zoom = 0.90;
Powder.Render.Offset = new Vector(0,0);


Powder.Update = function () {
  Powder.Control();
  if (!Powder.Paused|Powder.Step) {
    Powder.Motion();
    //Powder.Density();
    Powder.PartUpdate();
    Powder.Step = false;
  }
  Powder.Render();
}




Powder.PartUpdate = function () {
  Powder.Objects.forEach((Obj, i) => {
    Obj.constructor.Update(Obj);
  });

}

Powder.Motion2 = function () {//Calc particle velocity
  //return
  //Apply gravity
  var Active = true;



  Powder.Objects.forEach((Obj, i) => {
    if (Obj.constructor.MaxGravity>Obj.Motion.y) {
    Obj.Motion.y += Powder.Options.Gravity;
    }
  });

//Current slow motion function:

/*
1. For each particle with motion...
2. Step once for that particle and check if inside stuff.
3. This function expands with each new particle


*/

  //More Motion/gravity/move objects.
  var MaxCalls = 200;
  var Calls = 0;

  Powder.Objects.forEach((Obj, i) => {
    Obj.CurrentMotion.x = Obj.Motion.x;
    Obj.CurrentMotion.y = Obj.Motion.y;
  });


  while (Active) {
    var ParticleHasMotion = false;
    Powder.Objects.forEach((Obj, i) => {
      var v = new Vector(Obj.CurrentMotion.x,Obj.CurrentMotion.y);
      if (Vector.HasMotion(v) ) {ParticleHasMotion = true;
        var AddX = 0;
        var AddY = 0;
        if (Obj.CurrentMotion.x>0) {AddX = 1;} if (Obj.CurrentMotion.x<0) {AddX = -1;}
        if (Obj.CurrentMotion.y>0) {AddY = 1;} if (Obj.CurrentMotion.y<0) {AddY = -1;}

        //Check if object is inside other object.
        var IsInsideElem = Powder.Api.Elements.IsInsideElement(Obj.Position.x+AddX,Obj.Position.y+AddY);

        if (!IsInsideElem) {Obj.Position.x += AddX;Obj.Position.y += AddY;Obj.CurrentMotion.x -= AddX;Obj.CurrentMotion.y -= AddY;} else {Obj.Motion.x = 0;Obj.Motion.y = 0;}
      }
    });
    if (!ParticleHasMotion) {Active = false;}
    Calls++;
    if (Calls>=MaxCalls) {Active = false;}
  }



  Powder.Objects.forEach((Obj, i) => {
    /*if (Obj.Position.x<0) {Obj.Position.x = 0;}
    if (Obj.Position.x>500) {Obj.Position.x = 500;}
    if (Obj.Position.y<0) {Obj.Position.y = 0;}
    if (Obj.Position.y>50) {Obj.Position.y = 50;}*/
    if (Powder.Api.Elements.IsInvalidPosition(Obj.Position) ) {Powder.Objects.pop(i);}//Remove object.
  });

}


/*
Origional Motion Function
Powder.Objects.forEach((Obj, i) => {
  var Active = true;
  var XPlus = true;
  var YPlus = true;
  if (Obj.Position.x<0) {XPlus = false;}
  if (Obj.Position.y<0) {YPlus = false;}
  //XPlus is true when x is positive
  var AddX = 0;
  var AddY = 0;
  while (Active) {
    if (Obj.Motion.x) {
      if (XPlus) {AddX++;} else {AddX--;}
    }

    if (Obj.Motion.y) {
      if (YPlus) {AddY++;} else {AddY--;}
    }

  }
});
*/


//original motion from the motion function:
/*var StoredMotion = [];
Powder.Objects.forEach((Obj, i) => {
  StoredMotion[i] = {x:0,y:0};
});
var MaxCalls = 200;
var Calls = 0;
while (Active) {
  ParticleHasMotion = false;
  Powder.Objects.forEach((Obj, i) => {
    var v = new Vector(Obj.Motion.x+StoredMotion[i].x,Obj.Motion.y+StoredMotion[i].y);
    if (Vector.HasMotion(v) ) {ParticleHasMotion = true;
      var AddX = 0;
      var AddY = 0;
      if (Obj.Motion.x+StoredMotion[i].x>0) {AddX = 1;} if (Obj.Motion.x+StoredMotion[i].x<0) {AddX = -1;}
      if (Obj.Motion.y+StoredMotion[i].y>0) {AddY = 1;} if (Obj.Motion.y+StoredMotion[i].y<0) {AddY = -1;}

      //Check if object is inside other object.
      var IsInsideElem = Powder.Api.Elements.IsInsideElement(Obj.Position.x+AddX,Obj.Position.y+AddY);

      if (!IsInsideElem) {Obj.Position.x += AddX;Obj.Position.y += AddY;StoredMotion[i].x -= AddX;StoredMotion[i].y -= AddY;} else {Obj.Motion.x = 0;Obj.Motion.y = 0;}
    }
  });
  if (!ParticleHasMotion) {Active = false;}
  Calls++;
  if (Calls>=MaxCalls) {Active = false;}
}*/
var sendToVideo = false;//This does nothing (:

Powder.Control = function () {
  var se = SelectedElement.value;//Selected Element
  var z = 1-Powder.Render.Zoom;
  var incW = Powder.Width/(Powder.AreaWidth*z);
  var incH = Powder.Height/(Powder.AreaHeight*z);
  var f = Math.floor;
  var off = Powder.Render.Offset;
  var x = f(Powder.Mouse.offsetX/incW)-off.x;
  var y = f(Powder.Mouse.offsetY/incH)-off.y;
  //Draw.fillRect(Math.floor(Powder.Mouse.offsetX/incW)*incW,Math.floor(Powder.Mouse.offsetY/incH)*incH,incW,incH);
  var isInside = Powder.Api.Elements.IsInsideElement(x,y);
  if (!isInside&&Powder.Mouse.buttons&&se!="Remove") {
    var e = Powder.Api.Elements.Type.GetElement(se);
    if (e) {
      var n = new e(x,y);
      Powder.Objects = Powder.Objects.concat(n);
    }
  }

  if (isInside&&Powder.Mouse.buttons&&se=="Remove") {
    var e = Powder.Api.Elements.GetElement(x,y);
    if (e) {
      Powder.Objects.splice(e.Index,1);
    }

  }
}

//Better motion function (it's faster)







Powder.Motion = function () {
  //Apply gravity



  Powder.Objects.forEach((Obj, i) => {
    if (Obj.constructor.MaxGravity>Obj.Motion.y) {
    Obj.Motion.y += Powder.Options.Gravity;
    }
  });


  var MotionParts = [];
  Powder.Objects.forEach((Obj, i) => {
    if (Vector.HasMotion(Obj.Motion) ) {MotionParts = MotionParts.concat(i);}
  });

  if (MotionParts.length<=0) {return;}
  MotionParts.forEach((ObjI, i) => {
    var Obj = Powder.Objects[ObjI];
    var AddX = 0;
    var AddY = 0;
    var mX = Obj.Motion.x;
    var mY = Obj.Motion.y;
    var pX = Obj.Position.x;
    var pY = Obj.Position.y;
    var Active = true;
    while (Active) {
      if (mX>0) {AddX += 1;}
      if (mX<0) {AddX -= 1;}
      if (mY>0) {AddY += 1;}
      if (mY<0) {AddY -= 1;}
      //Collision
      var Inside = Powder.Api.Elements.IsInsideElement(pX+AddX,pY+AddY);

      var HasMotion = Vector.HasMotion( new Vector(mX - AddX,mY - AddY) );

      if (!HasMotion&&!Inside) {Obj.Position.x = pX+AddX;Obj.Position.y = pY+AddY;Active = false;}

      if (Inside) {
        if (mX>0) {AddX -= 1;}
        if (mX<0) {AddX += 1;}
        if (mY>0) {AddY -= 1;}
        if (mY<0) {AddY += 1;}
        Obj.Position.x = pX+AddX;Obj.Position.y = pY+AddY;Obj.Motion.x = 0;Obj.Motion.y = 0;Active = false;

      }
      //end while
    }
  });

  return;
  Powder.Objects.forEach((Obj, i) => {
    /*if (Obj.Position.x<0) {Obj.Position.x = 0;}
    if (Obj.Position.x>500) {Obj.Position.x = 500;}
    if (Obj.Position.y<0) {Obj.Position.y = 0;}
    if (Obj.Position.y>50) {Obj.Position.y = 50;}*/
    if (Powder.Api.Elements.IsInvalidPosition(Obj.Position) ) {Powder.Objects.pop(i);}//Remove object.
  });
}




Powder.Density = function () {
  Powder.Objects.forEach((Obj, i) => {
    if (Obj.constructor.Density!=NaN) {
      /*
      var e = Powder.Api.Elements.GetElement(Obj.Position.x,Obj.Position.y+1);
      if (e&&e.Object.constructor.Density<Obj.constructor.Density) {
        Obj.Position.y += 1;
        e.Object.Position.y -= 1;
      }
*/
      var Near = [new Vector(1,1),new Vector(0,1),new Vector(-1,1)];
      Near = Powder.Api.Elements.GetElementArray(Obj.Position,Near);
      if (Near[1]) {
        if (Near[1].Object.constructor.Density<Obj.constructor.Density) {
          Near[1].Object.Position.y -= 1;
          Obj.Position.y += 1;
        }

      } else {
        var flowLeft = Math.random()>=0.5;
        if (flowLeft) {
          if (Near[0]) {
            if (Near[0].Object.constructor.Density<Obj.constructor.Density) {
              Near[0].Object.Position.y -= 1;
              Near[0].Object.Position.x += 1;
              Obj.Position.y += 1;
              Obj.Position.x -= 1;
            }


          } else if (Near[2]) {
            if (Near[2].Object.constructor.Density<Obj.constructor.Density) {
              Near[2].Object.Position.y -= 1;
              Near[2].Object.Position.x -= 1;
              Obj.Position.y += 1;
              Obj.Position.x += 1;
            }
          }

        } else {
          if (Near[2]) {
            if (Near[2].Object.constructor.Density<Obj.constructor.Density) {
              Near[2].Object.Position.y -= 1;
              Near[2].Object.Position.x -= 1;
              Obj.Position.y += 1;
              Obj.Position.x += 1;
            }
          } else if (Near[0]) {
            if (Near[0].Object.constructor.Density<Obj.constructor.Density) {
              Near[0].Object.Position.y -= 1;
              Near[0].Object.Position.x += 1;
              Obj.Position.y += 1;
              Obj.Position.x -= 1;
            }


          }

        }

      }
    //End if
    }

  });

}
// NOTE: UPDATE: Make gravity directional, for exmaple blocks can fall up or diagnal

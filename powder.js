//Api
var Powder = {};
Powder.Paused = false;
Powder.Step = false;
Powder.Api = {};

Canvas.onpointermove = function (e) {
  Powder.Mouse = e;
  if (Powder.MouseLock) {
    console.info(Powder.MouseX);
    Powder.MouseX += e.movementX;
    Powder.MouseY += e.movementY;
  } else {
    Powder.MouseX = e.offsetX;
    Powder.MouseY = e.offsetY;
  }
}
Canvas.onpointerdown = Canvas.onpointermove;
Canvas.onpointerup = Canvas.onpointermove;
Canvas.onwheel = function (e) {Powder.Wheel = e;Powder.Wheel.HasUpdated = true;e.preventDefault();}
document.onpointerlockchange = function (e) {if (document.pointerLockElement) {Powder.MouseLock = true} else {Powder.MouseLock = false;}}
Powder.Mouse = {};
Powder.Wheel = {};
Powder.MouseLock = false;

Powder.MouseX = 0;
Powder.MouseY = 0;


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
  if (SelectedElement.value=="Remove") {Draw.fillStyle = "red";} else {Draw.fillStyle = "blue";}
  Draw.globalAlpha = 0.5;
  Draw.fillRect(Math.floor(Powder.MouseX/incW)*incW-incW*Powder.Cursor.Size,Math.floor(Powder.MouseY/incH)*incH-incH*Powder.Cursor.Size,incW*(Powder.Cursor.Size*2+1),incH*(Powder.Cursor.Size*2+1) );
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
  var f = Math.floor;
  var a = Math.abs;
  if (false) {
  var al = 50

  Powder.Air.forEach((Obj2, x) => {
    Obj2.forEach((Obj, y) => {
      var p = Obj.Pressure;
      if (p>0) {
        if (p>255) {p = 255;}
        Draw.fillStyle = "rgba("+f(p)+",0,0,"+al+")";
      } else if (p<0) {
        if (p<-255) {p = -255;}
        Draw.fillStyle = "rgba(0,0,"+a(f(p))+","+al+")";
      } else {Draw.fillStyle = "rgba(255,255,255,"+al+")";}
      Draw.fillRect(x*incW+o.x*incW,y*incH+o.y*incH,incW,incH);
    });

  });

  }


}



Powder.Render.Zoom = 0.90;
Powder.Render.Offset = new Vector(0,0);


Powder.Update = function () {
  Powder.Control();
  if (!Powder.Paused|Powder.Step) {
    Powder.Api.Air.Update();
    Powder.Motion();
    //Powder.Density();
    Powder.PartUpdate();
    Powder.Objects.forEach((Obj, i) => {
      /*if (Obj.Position.x<0) {Obj.Position.x = 0;}
      if (Obj.Position.x>500) {Obj.Position.x = 500;}
      if (Obj.Position.y<0) {Obj.Position.y = 0;}
      if (Obj.Position.y>50) {Obj.Position.y = 50;}*/
      //if (Powder.Api.Elements.IsInvalidPosition(Obj.Position) ) {Powder.Objects.splice(i,1);}//Remove object.
    });
    Powder.Step = false;
  }
  Powder.Render();
}
Powder.Config = {
  UpdateAir:true
};




Powder.PartUpdate = function () {
  Powder.Objects.forEach((Obj, i) => {
    Obj.constructor.Update(Obj);
  });

}




var sendToVideo = false;//This does nothing (:
Powder.Cursor = {Type:"Square",Size:1};
Powder.Control = function () {
  if (Powder.Wheel.HasUpdated&&!Keyboard.z) {
    if (Powder.Wheel.deltaY>0) {Powder.Cursor.Size--;} else {Powder.Cursor.Size++;}
    if (Powder.Cursor.Size<0) {Powder.Cursor.Size = 0;}
  }
  if (Keyboard.z&&Powder.Wheel.HasUpdated) {
    if (Powder.Wheel.deltaY>0) {
      Powder.Render.Zoom -= 0.01;
    } else {Powder.Render.Zoom += 0.01;}
  }
  Powder.Wheel.HasUpdated = false;
  var se = SelectedElement.value;//Selected Element
  var z = 1-Powder.Render.Zoom;
  var incW = Powder.Width/(Powder.AreaWidth*z);
  var incH = Powder.Height/(Powder.AreaHeight*z);
  var f = Math.floor;
  var off = Powder.Render.Offset;
  var x = f(Powder.MouseX/incW)-off.x;
  var y = f(Powder.MouseY/incH)-off.y;
  //Draw.fillRect(Math.floor(Powder.MouseX/incW)*incW,Math.floor(Powder.MouseY/incH)*incH,incW,incH);
  //var isInside = Powder.Api.Elements.IsInsideElement(x,y);
  //var invalid = Powder.Api.Elements.IsInvalidPosition(x,y);
  //if (invalid) {return;}
  if (Powder.Mouse.buttons==1&&se!="Remove") {
    var e = Powder.Api.Elements.Type.GetElement(se);
    if (e) {
      var Objs = [];
      var Size = Powder.Cursor.Size;
      for (var x2 = -Size;x2 < Size+1;x2++) {
        for (var y2 = -Size;y2 < Size+1;y2++) {
          var isInside = Powder.Api.Elements.IsInsideElement(x+x2,y+y2);
          var invalid = Powder.Api.Elements.IsInvalidPosition(x+x2,y+y2);
          if (!isInside&&!invalid) {
            Objs = Objs.concat(new e(x+x2,y+y2) );
          }

        }
      }
      //var n = new e(x,y);
      Powder.Objects = Powder.Objects.concat(Objs);
    }
  }

  if (Powder.Mouse.buttons==1&&se=="Remove") {
    var Size = Powder.Cursor.Size;
    for (var x2 = -Size;x2 < Size+1;x2++) {
      for (var y2 = -Size;y2 < Size+1;y2++) {
        var element = Powder.Api.Elements.GetElement(x+x2,y+y2);
        var invalid = Powder.Api.Elements.IsInvalidPosition(x+x2,y+y2);
        if (element&&!invalid) {
          Powder.Objects.splice(element.Index,1);
        }

      }
    }

  }
}

//Better motion function (it's faster)







Powder.Motion = function () {
  //Apply gravity
  Powder.Air.forEach((Obj2, x) => {
    Obj2.forEach((Obj, y) => {
      var e = Powder.Api.Elements.GetElement(x,y);
      if (e) {
        e.Object.Motion.x += Obj.Motion.x;
        e.Object.Motion.y += Obj.Motion.y;
      }
    });

  });



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
      var Invalid = Powder.Api.Elements.IsInvalidPosition(pX+AddX,pY+AddY);

      var HasMotion = Vector.HasMotion( new Vector(mX - AddX,mY - AddY) );

      if (!HasMotion&&!Inside&&!Invalid) {Obj.Position.x = pX+AddX;Obj.Position.y = pY+AddY;Active = false;}


      if (Inside||Invalid) {
        if (mX>0) {AddX -= 1;}
        if (mX<0) {AddX += 1;}
        if (mY>0) {AddY -= 1;}
        if (mY<0) {AddY += 1;}
        Obj.Position.x = pX+AddX;Obj.Position.y = pY+AddY;Obj.Motion.x = 0;Obj.Motion.y = 0;Active = false;

      }
      //end while
    }
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

//Fast element inside glitch checker:
/*
Powder.Objects.forEach(function (o) {
Powder.Objects.forEach(function (e) {
if (o.Position.x==e.Position.x&&o.Position.y==e.Position.y) {console.info("ohno");}
});

});
*/

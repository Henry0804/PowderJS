Powder.Api.Air = class Air {
  constructor() {
    this.Motion = new Vector(0,0);
    this.Pressure = 0;
  }
  static DissapationMultiplier = 1;
  static PressureMultiplier = 0.5;
  static VelocityTransfer = 0.5;
  static CornerMultiplier = (1/2)*(1/4);
  static Update() {
    //Four ajacnet cells.
    for (var x = 1;x < Powder.AreaWidth-1;x++) {
      for (var y = 1;y < Powder.AreaHeight-1;y++) {
        //For each particle
        var Obj = Powder.Air[x][y];
        var ObjB = Powder.AirBuffer[x][y];
        var a = Powder.Air;
        var b = Powder.AirBuffer;
        var Neara = [
          a[x][y-1],
          a[x-1][y],
          a[x+1][y],
          a[x][y+1]
        ];
        var Nearb = [
          b[x][y-1],
          b[x-1][y],
          b[x+1][y],
          b[x][y+1]
        ];

        var PressureDiff = [
          Obj.Pressure-Neara[0].Pressure,
          Obj.Pressure-Neara[1].Pressure,
          Obj.Pressure-Neara[2].Pressure,
          Obj.Pressure-Neara[3].Pressure
        ];

        var allP = PressureDiff[0] + PressureDiff[1] + PressureDiff[2] + PressureDiff[3];

        var p = this.PressureMultiplier;
        var c = this.CornerMultiplier;
        //up 1
        /*
        Nearb[0].Motion.x = Nearb[0].Motion.x + PressureDiff[0]*p;
        Nearb[0].Motion.y = Nearb[0].Motion.y + PressureDiff[0]*p;
        //Left 1
        Nearb[1].Motion.x = Nearb[1].Motion.x + PressureDiff[1]*p;
        Nearb[1].Motion.y = Nearb[1].Motion.y + PressureDiff[1]*p;
        //Right 1
        Nearb[2].Motion.x = Nearb[2].Motion.x + PressureDiff[2]*p;
        Nearb[2].Motion.y = Nearb[2].Motion.y + PressureDiff[2]*p;
        //Down 1
        Nearb[3].Motion.x = Nearb[3].Motion.x + PressureDiff[3]*p;
        Nearb[3].Motion.y = Nearb[3].Motion.y + PressureDiff[3]*p;
*/
        var f = Math.floor;
        //Calc pressure.
        var Value = Obj.Pressure;
        var Split = (Value*p)/4;
        //Split += Obj.Motion.y/50;
        //Split += Obj.Motion.x/50;
        Nearb[0].Pressure += Split;
        Nearb[1].Pressure += Split;
        Nearb[2].Pressure += Split;
        Nearb[3].Pressure += Split;
        ObjB.Pressure -= Split*4;

        var Value2 = Obj.Pressure;
        Split = (Value2/4);
        var lx = Math.round(Obj.Motion.x)+x;
        var ly = Math.round(Obj.Motion.y)+x;
        if (lx<0||ly<0||ly>200||lx>200) {} else {
          b[lx][ly].Pressure += Split;
        }

        //ObjB.Pressure = -ObjB.Pressure;
        //Use existing velocity to move the air particle's pressure:
        //currentPressure * VelocityTransferConstant is added to cell realative to some vector.

        //Calc motion.
        ObjB.Motion.x = 0;
        ObjB.Motion.y = 0;

        function clamp(a,Max,Min) {
          var o = 0;
          if (a>Max) {o = Max;}
          if (a<Min) {o = Min;}
          if (o==0) {return a;} else {return o;}
        }
        ObjB.Motion.y += Obj.Pressure-Neara[0].Pressure;
        ObjB.Motion.y += Obj.Pressure-Neara[3].Pressure;
        ObjB.Motion.x += Obj.Pressure-Neara[1].Pressure;
        ObjB.Motion.x += Obj.Pressure-Neara[2].Pressure;
        }

    }
    //Pressure stuff calc.
    /*for (var x = 1;x < Powder.AreaWidth-1;x++) {
      for (var y = 1;y < Powder.AreaHeight-1;y++) {

        var a = Math.abs;
        var Obj = Powder.Air[x][y];
        var ObjB = Powder.AirBuffer[x][y];
        //Vector calculation

      }
    }*/
    Powder.Air = Powder.Api.Air.Clone(Powder.AirBuffer);
    //end
  }
}
Powder.Air = [];
Powder.AirBuffer = [];//Written to from Powder.Air, eventually Powder.Air = Powder.AirBuffer
for (var i = 0; i < Powder.AreaWidth; i++) {
  var Objects = [];
  for (var i2 = 0; i2 < Powder.AreaHeight; i2++) {
    Objects[i2] = new Powder.Api.Air();
  }
  Powder.Air[i] = Objects;
  Powder.AirBuffer[i] = Objects;
}


Powder.Api.Air.Clone = function Clone(Buffer) {
  var Out = [];
  for (var i = 0; i < Powder.AreaWidth; i++) {
    Out[i] = [];
  }
  for (var i = 0; i < Powder.AreaWidth; i++) {
    for (var i2 = 0; i2 < Powder.AreaHeight; i2++) {
      var Obj = Buffer[i][i2];
      Out[i][i2] = new Powder.Api.Air();
      Out[i][i2].Motion = Obj.Motion;
      Out[i][i2].Pressure = Obj.Pressure;
    }

  }
  return Out;
}


function AirRender() {
  Powder.Api.Air.Update();
  var val = 1000/200
  Draw.fillStyle = "white";
  Draw.fillRect(0,0,1000,1000);
  Draw.fillStyle = "red";
  for (var x = 1;x < Powder.AreaWidth-1;x++) {
    for (var y = 1;y < Powder.AreaHeight-1;y++) {
      Draw.fillStyle = "black";
      var o = Powder.Air[x][y];
      var f = Math.floor;
      var m = 50;
      var a = Math.abs;
      if (o.Pressure>0) {
        Draw.fillStyle = "rgb("+a(f(o.Pressure*m))+",0,0)";
      } else {
        Draw.fillStyle = "rgb(0,0,"+a(f(o.Pressure*m))+")";
      }
      Draw.fillRect(x*val,y*val,val,val);
      Draw.fillStyle = "white";
      if (!(o.Motion.x==0&&o.Motion.y==0)) {
        Draw.fillRect((o.Motion.x+x)*val,(o.Motion.y+y)*val,val,val);
      }
    }
  }
}


/*
Air sim:
Fist implement smoothing function and store that in pressure.
A direction vector is generated based on adding the direction of cells too vectors as well as the cell's vectors themselves.
Then allow air cells to transfer pressure away using the vector they have


*/


/*
ObjB.Motion.y -= f(Obj.Pressure-Neara[0].Pressure);
ObjB.Motion.y += f(Obj.Pressure-Neara[3].Pressure);
ObjB.Motion.x -= f(Obj.Pressure-Neara[1].Pressure);
ObjB.Motion.x += f(Obj.Pressure-Neara[2].Pressure);
*/

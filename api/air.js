Powder.Api.Air = class Air {
  constructor() {
    this.Motion = new Vector(0,0);
    this.Pressure = 0;
  }
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
        var Nearbs = [
          b[x-1][y-1],
          b[x][y-1],
          b[x+1][y-1],
          b[x-1][y],
          b[x][y],
          b[x+1][y],
          b[x-1][y-1],
          b[x][y-1],
          b[x+1][y-1]
        ]
        var Nearas = [
          a[x-1][y-1],
          a[x][y-1],
          a[x+1][y-1],
          a[x-1][y],
          a[x][y],
          a[x+1][y],
          a[x-1][y-1],
          a[x][y-1],
          a[x+1][y-1]
        ]
        var PressureDif = [
          Obj.Pressure-Neara[0].Pressure,
          Obj.Pressure-Neara[1].Pressure,
          Obj.Pressure-Neara[2].Pressure,
          Obj.Pressure-Neara[3].Pressure
        ];
        var PressureDifs = [
          Obj.Pressure-Nearas[0].Pressure,
          Obj.Pressure-Nearas[1].Pressure,
          Obj.Pressure-Nearas[2].Pressure,
          Obj.Pressure-Nearas[3].Pressure,
          Obj.Pressure-Nearas[4].Pressure,//no
          Obj.Pressure-Nearas[5].Pressure,
          Obj.Pressure-Nearas[6].Pressure,
          Obj.Pressure-Nearas[7].Pressure,
          Obj.Pressure-Nearas[8].Pressure,
        ]
        //Up 1
        var m = 16;
        var allP = PressureDif[0] + PressureDif[1] + PressureDif[2] + PressureDif[3];
        //ObjB.Motion.x = ObjB.Motion.x + PressureDif[3];
        //ObjB.Motion.y = ObjB.Motion.y + PressureDif[2];

        //up 1
        Nearb[0].Motion.x = Nearb[0].Motion.x + PressureDif[0]/m;
        Nearb[0].Motion.y = Nearb[0].Motion.y + PressureDif[0]/m;
        //Left 1
        Nearb[1].Motion.x = Nearb[1].Motion.x + PressureDif[1]/m;
        Nearb[1].Motion.y = Nearb[1].Motion.y + PressureDif[1]/m;
        //Right 1
        Nearb[2].Motion.x = Nearb[2].Motion.x + PressureDif[2]/m;
        Nearb[2].Motion.y = Nearb[2].Motion.y + PressureDif[2]/m;
        //Down 1
        Nearb[3].Motion.x = Nearb[3].Motion.x + PressureDif[3]/m;
        Nearb[3].Motion.y = Nearb[3].Motion.y + PressureDif[3]/m;


      }

    }

    //Pressure stuff calc.
    for (var x = 1;x < Powder.AreaWidth-1;x++) {
      for (var y = 1;y < Powder.AreaHeight-1;y++) {
        //Pressure Calc.
        //Pressure = Pressure - vector stuff
        var Obj = Powder.Air[x][y];
        var Value = Obj.Motion.x;
        Value += Obj.Motion.y;
        Value += Obj.Pressure;

        Powder.AirBuffer[x][y].Pressure = Value;
      }
    }
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
    }
  }
}

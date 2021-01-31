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
        var a = Powder.Air;
        var b = Powder.AirBuffer;
        var Neara = [
          a[x][y+1],
          a[x-1][y],
          a[x+1][y],
          a[x][y-1]
        ];
        var Nearb = [
          b[x][y+1],
          b[x-1][y],
          b[x+1][y],
          b[x][y-1]
        ];
        var PressureDif = [
          Obj.Pressure-Neara[0].Pressure,
          Obj.Pressure-Neara[1].Pressure,
          Obj.Pressure-Neara[2].Pressure,
          Obj.Pressure-Neara[3].Pressure,
        ];
        //Up 1
        Nearb[0].Motion.x = Nearb[0].Motion.x + PressureDif[0] + Neara[0].Motion.x;
        Nearb[0].Motion.y = Nearb[0].Motion.y + PressureDif[0] + Neara[0].Motion.y;
        //Left 1
        Nearb[1].Motion.x = Nearb[1].Motion.x + PressureDif[1] + Neara[1].Motion.x;
        Nearb[1].Motion.y = Nearb[1].Motion.y + PressureDif[1] + Neara[1].Motion.y;
        //Right 1
        Nearb[2].Motion.x = Nearb[2].Motion.x + PressureDif[2] + Neara[2].Motion.x;
        Nearb[2].Motion.y = Nearb[2].Motion.y + PressureDif[2] + Neara[2].Motion.y;
        //Down 1
        Nearb[3].Motion.x = Nearb[3].Motion.x + PressureDif[3] + Neara[3].Motion.x;
        Nearb[3].Motion.y = Nearb[3].Motion.y + PressureDif[3] + Neara[3].Motion.y;


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
      var Obj = Buffer[i,i2];
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
      if (o.Pressure!=0) {Draw.fillStyle = "blue";}
      Draw.fillRect(x*val,y*val,val,val);
    }
  }
}

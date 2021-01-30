//Elements api
Powder.Api.Elements = {};

Powder.Api.Elements.IsInsideElement = function (x,y) {
  //var Out = false;
  //var invalid = Powder.Api.Elements.IsInvalidPosition(new Vector(x,y));
  //if (invalid) {return true;}
  //Powder.Objects.forEach((Obj, i) => {
    //var equal = Obj.Position.x==x&&Obj.Position.y==y;
    //if (equal) {return true;}
  //});
  for (var i = 0;i < Powder.Objects.length;i++) {
    var Obj = Powder.Objects[i];
    var equal = Obj.Position.x==x&&Obj.Position.y==y;
    if (equal) {return true;}
  }
  //return Out;
  return false;
}
Powder.Api.Elements.IsInvalidPosition = function (x,y) {//returns true if an invalid position is found.
  if (Pos.x<0) {return true;}
  if (Pos.x>Powder.AreaWidth) {return true;}
  if (Pos.y<0) {return true;}
  if (Pos.y>Powder.AreaHeight) {return true;}
  return false;
}
Powder.Api.Elements.GetElement = function (x,y) {
  var Out = false;
  for (var i = 0; i < Powder.Objects.length; i++) {
    var Obj = Powder.Objects[i];
    if (Obj.Position.x==x&&Obj.Position.y==y) {/*Out = {Object:Obj,Index:i};break;*/return {Object:Obj,Index:i};}
  }
  return Out;
}


Powder.Api.Elements.Type = {};
Powder.Api.Elements.Type.GetElement = function (Str) {
  var t = Powder.Api.Elements.Type;
  return t[Str];
}


//Here is functions for moving and checking particles.
Powder.Api.Elements.IsInsideElementArray = function (Pos,Relative) {
  var Out = [];
  Relative.forEach((Obj, i) => {
    Out[i] = Powder.Api.Elements.IsInsideElement(Pos.x+Obj.x,Pos.y+Obj.y);
  });
  return Out;
}


Powder.Api.Elements.GetElementArray = function (Pos,Relative) {
  var Out = [];
  Relative.forEach((Obj, i) => {
    Out[i] = Powder.Api.Elements.GetElement(Pos.x+Obj.x,Pos.y+Obj.y);
  });
  return Out;
}


Powder.Api.Elements.MoveElementByDensity = function (Pos,Density,Relative) {
  for (var i = 0; i < Relative.length; i++) {
    var Obj = Relative[i];
    var x = Powder.Api.Elements.GetElement(Pos.x+Obj.x,Pos.y+Obj.y);
    if (x) {
      if (x.Object.constructor.Density<Density) {
        if (Powder.Api.Elements.IsInvalidPosition(Pos.x+Obj.x,Pos.y+Obj.y) ) {break;}
        Pos.x += Obj.x;
        Pos.y += Obj.y;

        x.Object.Position.x -= Obj.x;
        x.Object.Position.y -= Obj.y;
        x.LoopIndex = i;
        return x;

      }
    }

  }
  return false;
}

Powder.Api.Elements.MoveElementByAir = function (Pos,Relative) {
  for (var i = 0; i < Relative.length; i++) {
    var Obj = Relative[i];
    var x = Powder.Api.Elements.IsInsideElement(Pos.x+Obj.x,Pos.y+Obj.y);
    if (!x) {
      var invalid = Powder.Api.Elements.IsInvalidPosition(Pos.x+Obj.x,Pos.y+Obj.y);
      if (invalid) {break;}
      Pos.x += Obj.x;
      Pos.y += Obj.y;
      return true;
    }

  }
  return false;
}

//Elements
/*
Allowed properties:
unstatic int State

*/

//ELEM=Powder
Powder.Api.Elements.Type.Powder = class Powder {//Average Powder element PROBLEM: What order should elements update?
  constructor(x,y) {
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
  }
  static Name = "Powder";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";//Menu data

  static Density = 0.72;//0.72, this is very light Powder
  static MaxGravity = 4;
  static Color = ["brown"];
  static UpdatePowder(This) {
    var NoMotion = !Vector.HasMotion(This.Motion);
    var Block = Powder.Api.Elements.IsInsideElement(This.Position.x,This.Position.y+1);
    if (NoMotion&&Block) {
      var flowLeft = Math.random()>0.5;
      if (flowLeft) {
        var Relative = [new Vector(-1,1),new Vector(1,1)];
      } else {
        var Relative = [new Vector(1,1),new Vector(-1,1)];
      }
      var MovedToAir = false;
      MovedToAir = Powder.Api.Elements.MoveElementByAir(This.Position,Relative);
      var MovedToParticle = false;
      if (!MovedToAir) {
        Relative.unshift(new Vector(0,1));
        MovedToParticle = Powder.Api.Elements.MoveElementByDensity(This.Position,This.constructor.Density,Relative);
      }
      if (MovedToAir||MovedToParticle) {return true;}
      return false;
    }
    return false;
  }
  static Update(This) {
    this.UpdatePowder(This);
  }




}


//ELEM=Powder
Powder.Api.Elements.Type.Solid = class Solid {//Average Powder element PROBLEM: What order should elements update?
  constructor(x,y) {
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
  }
  static Density = NaN;//1.49
  static MaxGravity = 0;
  static Update(This) {

  }
  static Color = ["black"];
  static Name = "Solid";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";//Menu data
}



//ELEM=Liquid
Powder.Api.Elements.Type.Liquid = class Liquid extends Powder.Api.Elements.Type.Powder{//Average water element
  Density = 1;//1
  constructor(x,y) {
    super(x,y);
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
  }
  static Name = "Liquid";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";//Menu data

  static Properties = {ExtraFlow:false,Flow:2};
  static Density = 1;//1 for 1 CM 3 of water

  static MaxGravity = 4;
  static Color = ["aqua"];
  static UpdateLiquid(This) {
    var NoMotion = !Vector.HasMotion(This.Motion);
    var Block = Powder.Api.Elements.IsInsideElement(This.Position.x,This.Position.y+1);
    if ( !(NoMotion&&Block) ) {return false;}
    var flowLeft = Math.random()>0.5;
    var Relative = [new Vector(1,0),new Vector(-1,0)];
    if (flowLeft) {Relative = [new Vector(-1,0),new Vector(1,0)];}
    var Obj2;
    var Obj = Powder.Api.Elements.MoveElementByAir(This.Position,Relative);
    if (!Obj) {
      Obj2 = Powder.Api.Elements.MoveElementByDensity(This.Position,This.constructor.Density,Relative);
    }

    if (Obj2||Obj) {return true;}
    return false;
  }
  static Update(This) {
    var hasMoved = this.UpdatePowder(This);
    if (!hasMoved) {this.UpdateLiquid(This);}
  }




}

/*
else if ( !Powder.Api.Elements.IsInsideElement(This.Position.x-1,This.Position.y) ) {//Left-Right behavior
  if (!This.constructor.Properties.ExtraFlow) {
    This.Position.x -= 1;
  } else {
    This.Motion.x = -This.constructor.Properties.Flow;
  }

} else if ( !Powder.Api.Elements.IsInsideElement(This.Position.x+1,This.Position.y) ) {
  if (!This.constructor.Properties.ExtraFlow) {
    This.Position.x += 1;
  } else {
    This.Motion.x = This.constructor.Properties.Flow;
  }

}
*/


//ELEM=Wire
Powder.Api.Elements.Type.Wire = class Wire {
  constructor(x,y) {
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
  }
  static Name = "Wire";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";

  static Density = NaN;
  static MaxGravity = 0;
  static Color = ["lightgray"];
  static Update(This) {
    var NoMotion = !Vector.HasMotion(This.Motion);
    var Block = Powder.Api.Elements.IsInsideElement(This.Position.x,This.Position.y+1);
    if (NoMotion&&Block) {
    }

  }

}
//Powder.Api.Elements.Type.GetElement

//ELEM=Spark

Powder.Api.Elements.Type.Spark = class Spark {
  constructor(x,y) {
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
    this.Life = 30;
    this.CType = "Remove";
  }
  static Name = "Spark";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";

  static Density = NaN;
  static MaxGravity = 0;
  static Color = ["yellow","blue"];
  static Update(This) {
    for (var x = -1; x < 1; x++) {
      for (var y = -1; y < 1; y++) {
        var e = Powder.Api.Elements.Type.GetElement(This.Position.x+x,This.Position.y+y);
        if (e) {
          if(e.Object.constructor.Name=="Wire") {
            Powder.Objects[e.Index] = new Powder.Api.Elements.Type.Spark(x,y);
            Powder.Objects[e.Index].CType = "Wire";
          }

        }

      }
    }
    if (This.Life>=1) {
      This.Life--;
    } else {
      if (This.CType=="Remove") {var e = Powder.Api.Elements.GetElement(This.Position.x,This.Position.y);Powder.Objects.pop(e.Index);} else {
        //var e = Powder.Api.Elements.GetElement(This.Position.x,This.Position.y);
        var e = Powder.Api.Elements.Type.GetElement(This.CType);
        Powder.Objects[e.Index] = new e();
      }



    }

  }

}






//Custom elements:
//These will be moved elsewhere someday

Powder.Api.Elements.Type.Sand = class Sand extends Powder.Api.Elements.Type.Powder {//Average Powder element PROBLEM: What order should elements update?
  constructor(x,y) {
    super(x,y);
    this.Position = new Vector(x,y);
    this.Motion = new Vector(0,0);
    this.CurrentMotion = new Vector(0,0);
    this.CurrentColor = 0;
  }
  static Name = "Sand";//Just the name
  static Type = "Default";//Type for scripts, ex, CUSTOM, NORMAL bla.
  static Group = "";//Menu data

  static Density = 1.20;
  static MaxGravity = 4;
  static Color = ["#DEB887"];
  static Update(This) {
    //this.UpdatePowder(This);
  }




}



///FOR PRESSURE SIM:
/*
REd tile disperses to other tiles around it.
then bla bla bla.
Red becomes blue
Tiles around blue become red.
easy.

*/

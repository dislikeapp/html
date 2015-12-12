var sphere = scene.addObject(new OE.Sphere());
sphere.setMaterial("DefaultWhite");

var plane = scene.addObject(new OE.Plane(10,10));
plane.setMaterial("DefaultWhite");
plane.setPosf(0,-1,0);
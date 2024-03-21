
let pixelShader;
let pg;

function preload(){
  pixelShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  // shaders require WEBGL mode to work
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  pg = createGraphics(windowWidth, windowHeight, WEBGL);
}

function draw() {
  shader(pixelShader);

  // set uniforms
  if (windowWidth > windowHeight) {
    pixelShader.setUniform('uResolution', [width / height, 1]);
  } else {
    pixelShader.setUniform('uResolution', [1, height / width]);
  }
  pixelShader.setUniform('tex', pg);
  pixelShader.setUniform('pixelSize', 6.0 / min(width, height));

  let locX = mouseX - width / 2;
  let locY = mouseY - height / 2;

  pg.background(10);

  // lighting
  pg.noLights();
  pg.ambientLight(30);
  pg.pointLight(255, 255, 255, locX, locY, 500);

  // material
  pg.specularMaterial(10);
  pg.shininess(0);
  pg.noStroke();
  pg.fill(255);

  // transform
  pg.resetMatrix();
  pg.rotateX(frameCount * 0.02);
  pg.rotateY(frameCount * 0.02);

  // geometry
  pg.torus(min(width, height) / 5, min(width, height) / 10);
  // pg.box(min(width, height) / 3);

  // put some geometry on the screen
  fill(200, 0, 0)
  rect(-width/2, -height/2, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight, WEBGL);
}
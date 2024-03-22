
let pixelShader;
let pg;
let pixelSizeSlider;
let nextButton;
let previousButton;
let modelIndex = 0;
let numOfModels = 4

function preload(){
  pixelShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
  // shaders require WEBGL mode to work
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  pg = createGraphics(windowWidth, windowHeight, WEBGL);
  pixelSizeSlider = createSlider(2, 15, 6, 1);
  pixelSizeSlider.position(10, 10);
  pixelSizeSlider.size(120);
  pixelSizeSlider.style('-webkit-appearance', 'none');
  pixelSizeSlider.style('background', '#333333');
  pixelSizeSlider.style('border-radius', '5px');

  previousButton = createButton('<');
  nextButton = createButton('>');

  previousButton.position(140, 10);
  nextButton.position(170, 10);

  previousButton.mouseClicked(() => { modelIndex = (modelIndex + numOfModels - 1) % numOfModels })
  nextButton.mouseClicked(() => { modelIndex = (modelIndex + 1) % numOfModels })
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
  pixelShader.setUniform('pixelSize', pixelSizeSlider.value() / min(width, height));

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

  // geometry
  switch (modelIndex) {
    case 0:
      pg.rotateY(frameCount * 0.02);
      pg.torus(min(width, height) / 5, min(width, height) / 10);
      break;
    case 1:
      pg.rotateX(frameCount * 0.02);
      pg.rotateY(frameCount * 0.02);
      pg.box(min(width, height) / 3);
      break;
    case 2:
      pg.rotateX(frameCount * 0.02);
      pg.rotateZ(frameCount * 0.02);
      pg.cylinder(min(width, height) / 6, min(width, height) / 2);
      break;
    default:
      pg.rotateX(frameCount * 0.02);
      pg.rotateZ(frameCount * 0.02);
      pg.cone(min(width, height) / 5, min(width, height) / 2);
  }
  
  // put some geometry on the screen
  fill(200, 0, 0)
  rect(-width/2, -height/2, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight, WEBGL);
}
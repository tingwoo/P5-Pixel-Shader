let pixelShader;
let pg;
let pixelSizeSlider;
let nextButton;
let previousButton;
let modelIndex = 0;
let numOfModels = 6;

function sine3d(t, s) {
    return createVector(sin(2 * t) * s, sin(5 * t) * s, sin(3 * t) * s);
}

function hyperCubeUtilT(t) {
    let t1 = t % 4;
    if (t1 < 1) {
        return 0.54 + (2.6 - 0.54) * t1;
    } else if (t1 < 2) {
        return 2.6 + (4.27 - 2.6) * (t1 - 1);
    } else if (t1 < 3) {
        return 4.27 + (5.16 - 4.27) * (t1 - 2);
    } else {
        return 5.16 + (TWO_PI + 0.54 - 5.16) * (t1 - 3);
    }
}

function hyperCubeUtilZ(t) {
    let t1 = t % 4;
    if (t1 < 1) {
        return 2;
    } else if (t1 < 2) {
        return 2 + (1 - 2) * (t1 - 1);
    } else if (t1 < 3) {
        return 1;
    } else {
        return 1 + (2 - 1) * (t1 - 3);
    }
}

function hypercubeNodes(t, innerSize) {
    return [
        innerSize * (2.33 * cos(hyperCubeUtilT(t))),
        innerSize * (1.635 + 0.7 * sin(hyperCubeUtilT(t))),
        innerSize * hyperCubeUtilZ(t),
    ];
}

function cartesianToSpherical(x, y, z) {
    let r = Math.sqrt(x * x + y * y + z * z);
    let theta = Math.acos(z / r);
    let phi = Math.atan2(y, x);

    return { r: r, theta: theta, phi: phi };
}

p5.Graphics.prototype.cylinderAbsolute = function (x1, y1, z1, x2, y2, z2, r) {
    sphCoords = cartesianToSpherical(x2 - x1, y2 - y1, z2 - z1);

    this.translate((x2 + x1) / 2, (y2 + y1) / 2, (z2 + z1) / 2);
    this.rotateZ(sphCoords.phi + HALF_PI);
    this.rotateX(sphCoords.theta - HALF_PI);

    this.cylinder(r, sphCoords.r);

    this.rotateX(-sphCoords.theta + HALF_PI);
    this.rotateZ(-sphCoords.phi - HALF_PI);
    this.translate(-(x2 + x1) / 2, -(y2 + y1) / 2, -(z2 + z1) / 2);
};

p5.Graphics.prototype.hypercube = function (size, cylRadius) {
    let pos = [0, 1, 2, 3].map((v) => {
        return hypercubeNodes(frameCount / 100 + v, size / 2);
    });

    // initial frame
    let mirror = [
        [1, 1, 1],
        [1, -1, 1],
        [1, 1, -1],
        [1, -1, -1],
    ];
    mirror.forEach((mi) => {
        for (let i = 0; i < 4; i++) {
            this.cylinderAbsolute(
                mi[0] * pos[i][0],
                mi[1] * pos[i][1],
                mi[2] * pos[i][2],
                mi[0] * pos[(i + 1) % 4][0],
                mi[1] * pos[(i + 1) % 4][1],
                mi[2] * pos[(i + 1) % 4][2],
                cylRadius
            );
            this.translate(
                mi[0] * pos[i][0],
                mi[1] * pos[i][1],
                mi[2] * pos[i][2]
            );
            this.sphere(cylRadius);
            this.translate(
                -mi[0] * pos[i][0],
                -mi[1] * pos[i][1],
                -mi[2] * pos[i][2]
            );
        }
    });

    // vertical connection
    let tmp = [
        [1, 1, 1],
        [1, 1, -1],
    ];
    tmp.forEach((tm) => {
        for (let i = 0; i < 4; i++) {
            this.cylinderAbsolute(
                tm[0] * pos[i][0],
                tm[1] * pos[i][1],
                tm[2] * pos[i][2],
                tm[0] * pos[i][0],
                -tm[1] * pos[i][1],
                tm[2] * pos[i][2],
                cylRadius
            );
        }
    });

    // z-axis connection
    let tmp2 = [
        [1, 1, 1],
        [1, -1, 1],
    ];
    tmp2.forEach((tm) => {
        for (let i = 0; i < 4; i++) {
            this.cylinderAbsolute(
                tm[0] * pos[i][0],
                tm[1] * pos[i][1],
                tm[2] * pos[i][2],
                tm[0] * pos[i][0],
                tm[1] * pos[i][1],
                -tm[2] * pos[i][2],
                cylRadius
            );
        }
    });
};

function preload() {
    pixelShader = loadShader("shader.vert", "shader.frag");
}

function setup() {
    // shaders require WEBGL mode to work
    createCanvas(windowWidth, windowHeight, WEBGL);
    noStroke();

    pg = createGraphics(windowWidth, windowHeight, WEBGL);
    pixelSizeSlider = createSlider(2, 15, 6, 1);
    pixelSizeSlider.position(10, 10);
    pixelSizeSlider.size(120);
    pixelSizeSlider.style("-webkit-appearance", "none");
    pixelSizeSlider.style("background", "#333333");
    pixelSizeSlider.style("border-radius", "5px");

    previousButton = createButton("<");
    nextButton = createButton(">");

    previousButton.position(140, 10);
    nextButton.position(170, 10);

    previousButton.mouseClicked(() => {
        modelIndex = (modelIndex + numOfModels - 1) % numOfModels;
    });
    nextButton.mouseClicked(() => {
        modelIndex = (modelIndex + 1) % numOfModels;
    });
}

function draw() {
    shader(pixelShader);
    let minDim = min(width, height);

    // set uniforms
    if (windowWidth > windowHeight) {
        pixelShader.setUniform("uResolution", [width / height, 1]);
    } else {
        pixelShader.setUniform("uResolution", [1, height / width]);
    }
    pixelShader.setUniform("tex", pg);
    pixelShader.setUniform("pixelSize", pixelSizeSlider.value() / minDim);

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

    // pg.orbitControl();
    // https://stackoverflow.com/questions/68986225/orbitcontrol-in-creategraphics-webgl-on-a-2d-canvas

    // geometry
    switch (modelIndex) {
        case 0:
            pg.rotateY(frameCount * 0.02);
            pg.torus(minDim / 5, minDim / 10);
            break;
        case 1:
            pg.rotateX(frameCount * 0.02);
            pg.rotateY(frameCount * 0.02);
            pg.box(minDim / 3);
            break;
        case 2:
            pg.rotateY(frameCount * 0.007);
            pg.rotateX(-0.4);
            pg.hypercube(minDim / 5, minDim / 65);
            break;
        case 3:
            pg.rotateX(frameCount * 0.02);
            pg.rotateZ(frameCount * 0.02);
            pg.cylinder(minDim / 6, minDim / 2);
            break;
        case 4:
            let t = frameCount / 60;
            pg.rotateX(frameCount * 0.02);
            pg.rotateY(frameCount * 0.02);
            for (let i = 0 + t; i <= 3 + t; i += map(i, t, 3 + t, 0.01, 0.04)) {
                let pos = sine3d(i, minDim / 5);
                pg.translate(pos.x, pos.y, pos.z);
                pg.sphere(map(i, t, 3 + t, 10, 40));
                pg.translate(-pos.x, -pos.y, -pos.z);
            }
            break;
        default:
            pg.rotateX(frameCount * 0.02);
            pg.rotateZ(frameCount * 0.02);
            pg.cone(minDim / 5, minDim / 2);
    }

    // put some geometry on the screen
    fill(200, 0, 0);
    rect(-width / 2, -height / 2, width, height);
    // image(pg, -width / 2, -height / 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    pg = createGraphics(windowWidth, windowHeight, WEBGL);
}

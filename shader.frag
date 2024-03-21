#ifdef GL_ES
precision mediump float;
#endif

// get texcoords from vert shader
varying vec2 vTexCoord;

// texture and resolution from p5
uniform sampler2D tex;
uniform vec2 uResolution;
uniform float pixelSize;

bool isOnEvenSpot(float num, float ps) {
    return mod((floor(num / ps)), 2.0) == 0.0;
}

vec2 getRefPixel(vec2 pos) {
    vec2 ref = vec2(floor(pos.x / pixelSize), floor(pos.y / pixelSize)) * pixelSize / uResolution;
    return ref;
}

// single pattern
vec4 getColor(vec2 pos, vec4 tr, vec4 tl, vec4 bl, vec4 br) {
    if(isOnEvenSpot(pos.y, pixelSize)) {
        if(isOnEvenSpot(pos.x, pixelSize)) return tl;
        else return tr;
    } else {
        if(isOnEvenSpot(pos.x, pixelSize)) return bl;
        else return br;
    }
}

// mixed pattern
vec4 getColor(vec2 pos, vec4 tr1, vec4 tl1, vec4 bl1, vec4 br1, vec4 tr2, vec4 tl2, vec4 bl2, vec4 br2) {
    if(isOnEvenSpot(pos.x, pixelSize * 2.0) ^^ isOnEvenSpot(pos.y, pixelSize * 2.0)) {
        return getColor(pos, tr1, tl1, bl1, br1);
    } else {
        return getColor(pos, tr2, tl2, bl2, br2);
    }
}

void main() {
    vec2 uv = vTexCoord;

    // flip and transform texture
    uv.y = 1.0 - uv.y;
    uv = uv * uResolution;

    // get the original color to generate pattern from
    vec4 tex = texture2D(tex, getRefPixel(uv));
    float bri = (tex.r + tex.g + tex.b) / 3.0;

    // define colors
    vec4 whi = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 bla = vec4(0.0, 0.0, 0.0, 1.0);

    if (bri >= 8.0 / 9.0) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else if (bri >= 7.0 / 9.0) {
        gl_FragColor = getColor(uv, whi, whi, whi, whi, bla, whi, whi, whi);
    } else if (bri >= 6.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, whi, whi, whi);
    } else if (bri >= 5.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, whi, whi, whi, bla, whi, bla, whi);
    } else if (bri >= 4.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, whi, bla, whi);
    } else if (bri >= 3.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, whi, bla, whi, bla, bla, bla, whi);
    } else if (bri >= 2.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, bla, bla, whi);
    } else if (bri >= 1.0 / 9.0) {
        gl_FragColor = getColor(uv, bla, bla, bla, whi, bla, bla, bla, bla);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
class Vertex {
    constructor(x, y, z, grid) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.grid = grid;
    }

    interpolate(vertex, targetValue) {
        // return new vertex
        let v1 = this.value();
        let v2 = vertex.value();
        let newX = this.subInterpo(this.x, vertex.x, v1, v2, targetValue);
        let newY = this.subInterpo(this.y, vertex.y, v1, v2, targetValue);
        let newZ = this.subInterpo(this.z, vertex.z, v1, v2, targetValue);
        return new Vertex(newX, newY, newZ, this.grid);
    }

    subInterpo(x1, x2, v1, v2, t) {
        if (v2 == v1) return (x1 + x2) / 2;
        return ((v2 - t) * x1 - (v1 - t) * x2) / (v2 - v1);
    }

    value() {
        return this.grid[this.x][this.y][this.z];
    }
}

class Face {
    constructor(v1, v2, v3) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }
}

class Tetrahedron {
    constructor(v1, v2, v3, v4) {
        this.vertices = [v1, v2, v3, v4];
    }

    getFaces(targetValue) {
        // return marching tetrahedron faces
        let boolList = this.vertices.map((vert) => {
            return vert.value() < targetValue;
        });

        let sum = boolList.reduce((accu, currentVal) => {
            return accu + (currentVal ? 1 : 0);
        }, 0);

        if (sum == 0 || sum == 4) return [];

        if (sum == 1 || sum == 3) {
            if (sum == 3) boolList = boolList.map((v) => !v);

            let verts = [];
            let tipIndex = boolList.findIndex((b) => b);

            this.vertices.forEach((vert, vertIndex) => {
                if (tipIndex != vertIndex) {
                    verts.push(
                        this.vertices[tipIndex].interpolate(vert, targetValue)
                    );
                }
            });
            return [new Face(verts[0], verts[1], verts[2])];
        }

        // if sum == 2
        let indices1 = [];
        let indices2 = [];
        let verts = [];
        boolList.forEach((value, index) => {
            if (value) indices1.push(index);
            else indices2.push(index);
        });
        verts.push(
            this.vertices[indices1[0]].interpolate(
                this.vertices[indices2[0]],
                targetValue
            )
        );
        verts.push(
            this.vertices[indices1[0]].interpolate(
                this.vertices[indices2[1]],
                targetValue
            )
        );
        verts.push(
            this.vertices[indices1[1]].interpolate(
                this.vertices[indices2[0]],
                targetValue
            )
        );
        verts.push(
            this.vertices[indices1[1]].interpolate(
                this.vertices[indices2[1]],
                targetValue
            )
        );
        return [
            new Face(verts[0], verts[1], verts[2]),
            new Face(verts[1], verts[2], verts[3]),
        ];
    }
}

class Cube {
    constructor(x, y, z, grid) {
        this.basePoint = new Vertex(x, y, z, grid);
        this.grid = grid;
    }

    getVertex(dx, dy, dz) {
        return new Vertex(
            this.basePoint.x + dx,
            this.basePoint.y + dy,
            this.basePoint.z + dz,
            this.grid
        );
    }

    getTetrahedrons() {
        let verts = [];
        verts.push(this.getVertex(0, 0, 0));
        verts.push(this.getVertex(1, 0, 0));
        verts.push(this.getVertex(1, 1, 0));
        verts.push(this.getVertex(0, 1, 0));
        verts.push(this.getVertex(0, 0, 1));
        verts.push(this.getVertex(1, 0, 1));
        verts.push(this.getVertex(1, 1, 1));
        verts.push(this.getVertex(0, 1, 1));

        let tetras = [];
        tetras.push(new Tetrahedron(verts[0], verts[2], verts[1], verts[4]));
        tetras.push(new Tetrahedron(verts[0], verts[2], verts[3], verts[4]));
        tetras.push(new Tetrahedron(verts[4], verts[2], verts[3], verts[7]));
        tetras.push(new Tetrahedron(verts[4], verts[2], verts[1], verts[5]));
        tetras.push(new Tetrahedron(verts[4], verts[2], verts[6], verts[7]));
        tetras.push(new Tetrahedron(verts[4], verts[2], verts[6], verts[5]));
        return tetras;
        // return 6 tetrahedrons
    }
}

function getFacesFromCube(x, y, z, grid, targetValue) {
    let cube = new Cube(x, y, z, grid);
    let tetras = cube.getTetrahedrons();
    let faces = [];
    tetras.forEach((te) => {
        faces = faces.concat(te.getFaces(targetValue));
    });

    // return marching tetrahedron faces in this cube
    return faces;
}

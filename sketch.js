
const initialDst = 55;
let nodeCollection;

function setup() {
  // console.log("Setting up");
  createCanvas(400, 400);
  stroke(0);
  strokeWeight(4);
  nodeCollection = new NodeCollection();
  for (let i = 100; i < 300; i += initialDst) {
    nodeCollection.appendNode(new DFNode(i, 200));
  }
}

function draw() {
  background(220);
  nodeCollection.operate();
  nodeCollection.draw();
}

class NodeCollection {
  constructor() {
    this.nodes = [];
  }

  appendNode(node) {
    this.nodes.push(node);
  }

  operate() {
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      node.operate(this.nodes[this.getPrev(i)], this.nodes[this.getNext(i)]);
    }
  }

  getNext(index) {
    if (index == this.nodes.length - 1) {
      return 0;
    } else {
      return index + 1;
    }
  }

  getPrev(index) {
    if (index == 0) {
      return this.nodes.length - 1;
    } else {
      return index - 1;
    }
  }

  draw() {
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      strokeWeight(3);
      node.draw();
      let other;
      if (i == this.nodes.length - 1) {
        other = this.nodes[0];
      } else {
        other = this.nodes[i + 1];
      }
      strokeWeight(1);
      line(node.pos.x, node.pos.y, other.pos.x, other.pos.y);
    }
  }
}

class DFNode {
  neighborMaxDst = 3;

  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  operate(prev, next) {
    // attraction force
    let attractionForce = createVector(0, 0);
    if (this.distance(prev) > this.neighborMaxDst) {
      attractionForce.add(p5.Vector.sub(prev.pos, this.pos));
    }
    if (this.distance(next) > this.neighborMaxDst) {
      attractionForce.add(p5.Vector.sub(next.pos, this.pos));
    }
    // attractionForce.mult(0.00001);

    // repulsion force

    // alignment force

    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, attractionForce), 0.01);
  }

  draw() {
    point(this.pos);
  }

  distance(other) {
    return Math.sqrt((Math.pow(other.pos.x-this.pos.x,2))+(Math.pow(other.pos.y-this.pos.y,2)))
  }
}


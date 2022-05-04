
const initialDst = 10;
let nodeCollection;
let nodeIdCounter = 0;
const neighborMaxDst = 5;
const intruderMaxDst = 6

function setup() {
  // console.log("Setting up");
  createCanvas(400, 400);
  stroke(0);
  strokeWeight(4);
  nodeCollection = new NodeCollection();
  for (let i = 0; i < 400; i += initialDst) {
    nodeCollection.appendNode(new DFNode(nodeIdCounter++, i, 200));
  }
}

function draw() {
  background(220);
  nodeCollection.operate();
  nodeCollection.draw();
}

class NodeCollection {
  connected = false;
  neighborMap = {};

  constructor() {
    this.nodes = [];
  }

  appendNode(node) {
    this.nodes.push(node);
  }

  operate() {
    this.calculateNeighborMap()
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      node.operate(this.getPrev(i), this.getNext(i), this.nodes, this.neighborMap);
    }
  }

  calculateNeighborMap() {
    this.neighborMap = {};
    for (let i = 0; i < this.nodes.length - 1; i++) {
      let node1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        let node2 = this.nodes[j];
        let dst = this.distance(node1, node2) < intruderMaxDst;
        if (dst) {
          let first = Math.min(node1.id, node2.id);
          let second = Math.max(node1.id, node2.id);
          this.neighborMap[`${first}-${second}`] = dst;
        }
      }
    }
  }

  distance(node1, node2) {
    return Math.sqrt((Math.pow(node2.pos.x-node1.pos.x,2))+(Math.pow(node2.pos.y-node1.pos.y,2)))
  }

  getNext(index) {
    if (index == this.nodes.length - 1) {
      return this.connected ? this.nodes[0] : null;
    } else {
      return this.nodes[index + 1];
    }
  }

  getPrev(index) {
    if (index == 0) {
      return this.connected ? this.nodes[this.nodes.length - 1] : null;
    } else {
      return this.nodes[index - 1];
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

  constructor(id, x, y) {
    this.id = id;
    this.pos = createVector(x, y);
  }

  operate(prev, next, nodes, neighborMap) {
    // attraction force
    const attractionForce = createVector(0, 0);
    if (prev && this.distance(prev) > this.neighborMaxDst) {
      attractionForce.add(p5.Vector.sub(prev.pos, this.pos).normalize());
    }
    if (next && this.distance(next) > this.neighborMaxDst) {
      attractionForce.add(p5.Vector.sub(next.pos, this.pos).normalize());
    }
    // repulsion force
    const repulsionForce = createVector(0, 0);
    for (let i = 0; i < nodes.length; i++) {
      let neighbor = nodes[i];
      let first = Math.min(neighbor.id, this.id);
      let second = Math.max(neighbor.id, this.id);
      
      if (neighborMap[`${first}-${second}`]) {
        repulsionForce.add(p5.Vector.sub(this.pos, neighbor.pos).normalize());
      }
    }

    // alignment force
    const alignmentForce = createVector(0, 0);
    if (prev && next) {
      const midpoint = createVector((prev.pos.x + next.pos.x) / 2, (prev.pos.y + next.pos.y) / 2);
      alignmentForce.add(p5.Vector.sub(midpoint, this.pos));
    }

    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, attractionForce), 0.1); // normalize?
    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, repulsionForce), 0.1); // normalize?
    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, alignmentForce), 0.1); // normalize?
  }

  draw() {
    point(this.pos);
  }

  distance(other) {
    return Math.sqrt((Math.pow(other.pos.x-this.pos.x,2))+(Math.pow(other.pos.y-this.pos.y,2)))
  }
}


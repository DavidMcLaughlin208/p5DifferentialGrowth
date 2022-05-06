const initialDst = 3;
const spawnThresholdDistance = 6;
const chanceToSpawn = 0;
let nodeCollection;
let nodeIdCounter = 0;
const neighborMaxDst = 8;
const intruderMaxDst = 8;
let tree;
const rbushNodes = [];

class MyRBush extends RBush {
  toBBox([x, y]) { return {minX: x, minY: y, maxX: x, maxY: y}; }
  compareMinX(a, b) { return a.x - b.x; }
  compareMinY(a, b) { return a.y - b.y; }
}

console.log("After myrbush");


function setup() {
  console.log("Setting up");
  createCanvas(400, 400);
  stroke(0);
  strokeWeight(10);
  tree = new MyRBush();
  
  
  nodeCollection = new NodeCollection();
  nodeCollection.connected = true;
  const pointPairs = [];
  pointPairs.push([createVector(100, 100), createVector(300, 100)]);
  pointPairs.push([createVector(300, 100), createVector(200, 300)]);
  pointPairs.push([createVector(200, 300), createVector(100, 100)]);
  for (let p = 0; p < pointPairs.length; p++) {
    let point1 = pointPairs[p][0];
    let point2 = pointPairs[p][1];
    for (let i = 0; i < 100; i += initialDst) {
      let pos = p5.Vector.lerp(point1, point2, i / 100);
      rbushNodes.push([pos.x, pos.y]);
      nodeCollection.appendNode(new DFNode(nodeIdCounter++, pos.x, pos.y));
    }
  }
  tree.load(rbushNodes);
  console.log(tree);
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
    let spawnedLastLoop = false;
    for (let i = 0; i < this.nodes.length - 1; i++) {
      let node1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        let node2 = this.nodes[j];
        let dst = this.distance(node1, node2);
        if (j == i + 1 && dst > spawnThresholdDistance && Math.random() > chanceToSpawn && !spawnedLastLoop) {
          //console.log("Spawning");
          let midpoint = createVector((node1.pos.x + node2.pos.x) / 2, (node1.pos.y + node2.pos.y) / 2);
          let newNode = new DFNode(nodeIdCounter++, midpoint.x, midpoint.y);
          this.nodes.splice(j, 0, newNode);
          spawnedLastLoop = true;
          continue;
        }
        if (dst < intruderMaxDst) {
          let first = Math.min(node1.id, node2.id);
          let second = Math.max(node1.id, node2.id);
          this.neighborMap[`${first}-${second}`] = dst;
        }
        spawnedLastLoop = false;
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
      stroke(0);
      strokeWeight(3);
      node.draw();
      let other;
      if (i == this.nodes.length - 1) {
        other = this.nodes[0];
      } else {
        other = this.nodes[i + 1];
      }
      strokeWeight(2);
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
      alignmentForce.add(p5.Vector.sub(midpoint, this.pos).normalize());
    }

    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, alignmentForce), 0.1); // normalize?
    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, attractionForce), 0.1); // normalize?
    this.pos = p5.Vector.lerp(this.pos, p5.Vector.add(this.pos, repulsionForce), 0.3); // normalize?
  }

  draw() {
    //point(this.pos);
  }

  distance(other) {
    return Math.sqrt((Math.pow(other.pos.x-this.pos.x,2))+(Math.pow(other.pos.y-this.pos.y,2)))
  }
}

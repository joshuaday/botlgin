function BinaryHeap(){
  this.costs = [];
  this.nodes = [];
}

BinaryHeap.prototype = {
  push: function(element, cost) {
    this.costs.push(cost);
    this.nodes.push(element);
    this.bubbleUp(this.nodes.length - 1);
  },

  peek: function() {
    return this.nodes[0];
  },

  pop: function() {
    var top = this.nodes[0], bottom = this.nodes.pop(), bottomcost = this.costs.pop();

    if (this.nodes.length > 0) {
      this.nodes[0] = bottom;
      this.costs[0] = bottomcost;
      this.sinkDown(0);
    }
    return top;
  },

  // removal can be sped up mightily --
  remove: function(node) {
    var length = this.nodes.length;
    for (var i = 0; i < length; i++) {
      if (this.nodes[i] == node) {
        var bottom = this.nodes.pop(), bottomcost = this.costs.pop();
        if (i != length - 1) {
          // allow it to float or sink if needed
          this.nodes[i] = bottom;
          this.costs[i] = bottomcost;
          this.bubbleUp(i);
          this.sinkDown(i);
        }
        break;
      }
    }
  },

  size: function() {
    return this.nodes.length;
  },

  bubbleUp: function(n) {
    var element = this.nodes[n], score = this.costs[n];
    while (n > 0) {
      var
        parentN = ((n + 1) >> 1) - 1,
        parentCost = this.costs[parentN];

      if (score >= parentCost)
        break;

      // Otherwise, swap the parent with the current element and continue.
      this.nodes[n] = this.nodes[parentN];
      this.nodes[parentN] = element;
      this.costs[n] = parentCost;
      this.costs[parentN] = score;

      n = parentN;
    }
  },

  sinkDown: function(n) {
    var
      length = this.nodes.length,
      element = this.nodes[n],
      score = this.costs[n], curscore = score;

    while (true) {
      var
        rightchildN = (n + 1) * 2, leftchildN = rightchildN - 1, swap = null;

      if (leftchildN < length) {
        var
          leftchild = this.nodes[leftchildN],
          leftchildScore = this.costs[leftchildN];

        if (leftchildScore < score) {
          swap = leftchildN;
          curscore = leftchildScore; // so when we compare with the right child we use this score instead
        }

        if (rightchildN < length) {
          var
            rightchild = this.nodes[rightchildN],
            rightchildScore = this.costs[rightchildN];

          if (rightchildScore < curscore) {
            swap = rightchildN;
          }
        }
      }

      if (swap == null) break;

      // swap and keep sinking.
      this.nodes[n] = this.nodes[swap];
      this.costs[n] = this.costs[swap];
      this.nodes[swap] = element;
      this.costs[swap] = score; // not curscore

      n = swap;
    }
  }
};
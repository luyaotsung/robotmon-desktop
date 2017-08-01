var Graph = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();

var width = 1080;
var height = 1800;
var cropX = 0; // 0 // 140
var cropY = 400; // 400 // 700 
var cropW = 1080; // 1080 // 800
var cropH = 1080; // 1080 // 800
var resizeW = 172; // 172 // 128
var resizeH = 172; // 172 // 128

function convertPoint(p) {
  var nx = Math.floor(cropX + p.x * cropW / resizeW);
  var ny = Math.floor(cropY + p.y * cropH / resizeH);
  return {x: nx, y: ny}
}

function findMoveablePosition() {
  console.log('A');
  var x = random(100, 900);
  var y = random(600, 1200);
  // x = 980;
  // y = 1320;
  console.log(Date.now());
  var oriImg = getScreenshotModify(cropX, cropY, cropW, cropH, resizeW, resizeH, 80);
  tapDown(x, y, 50);
  sleep(100);
  var newImg = getScreenshotModify(cropX, cropY, cropW, cropH, resizeW, resizeH, 80);
  // tapUp(x, y, 20);
  console.log('B');
  smooth(oriImg, 1, 5);
  smooth(newImg, 1, 5);
  convertColor(oriImg, 40); // 52 = CV_BGR2HLS
  convertColor(newImg, 40); // 52 = CV_BGR2HLS
  console.log('C');
  saveImage(oriImg, getStoragePath() + "/tsum1.jpg");
  saveImage(newImg, getStoragePath() + "/tsum2.jpg");
  
  var diffImg = absDiff(oriImg, newImg);
  threshold(diffImg, 20, 200, 0);
  eroid(diffImg, 6, 6, 0, 0);
  console.log('D');
  saveImage(diffImg, getStoragePath() + "/tsum_eroid.jpg");

  var cannyImg = canny(diffImg, 100.0, 200.0, 3);
  saveImage(cannyImg, getStoragePath() + "/tsum_canny.jpg");
  console.log('E');
  var centers = findContours(cannyImg, 6, 100);
  releaseImage(oriImg);
  releaseImage(newImg);
  releaseImage(diffImg);
  releaseImage(cannyImg);
  if (centers == undefined) {
    return;
  }
  console.log('F');
  
  
  var counts = 0;
  for (var key in centers) {
    centers[key] = convertPoint(centers[key]);
    counts++;
  }
  console.log(JSON.stringify(centers));
  
  centers['c'] = {x: x, y: y};

  var map = {};
  for(var k1 in centers) {
    for(var k2 in centers) {
      if (k1 == k2) continue;
      var d = distance(centers[k1], centers[k2]);
      if (d < cropW/8 || d > cropW/16 ) {
        if (map[k1] == undefined) {
          map[k1] = {};
        }
        map[k1][k2] = d;
      }
    }
  }
  var longDis = 0;
  var lk1 = {};
  var lk2 = {};
  for(var k1 in centers) {
    for(var k2 in centers) {
      if (k1 == k2) continue;
      if (map[k1] == undefined) continue;
      if (map[k2] == undefined) continue;
      var d = distance(centers[k1], centers[k2]);
      if (d > longDis) {
        longDis = d;
        lk1 = k1;
        lk2 = k2;
      }
    }
  }
  console.log('aa', JSON.stringify(map));
  var graph = new Graph(map);
  var path = graph.findShortestPath(lk1, lk2);
  console.log('bb', JSON.stringify(path));

  var paths = movePoints(centers, {x: x, y: y});
  console.log('check', x, y, counts, paths.length);
  
  if (counts > 10 || counts < 2 || paths.length < 3) {
    console.log('give up', x, y, counts, paths.length);
    // findMoveablePosition();
    return;
  }
  console.log(JSON.stringify(paths));
  // tapDownPoint(paths[0]);
  for (var k in paths) {
    moveToPoint(paths[k]);
  }
  tapUpPoint(paths[paths.length - 1]);
  
  console.log('H');
  console.log(Date.now());
}

function tapDownPoint(fp) {
  console.log("down x", fp.x, "y", fp.y);
  tapDown(Math.floor(fp.x), Math.floor(fp.y), 30);
}
function tapUpPoint(fp) {
  console.log("up x", fp.x, "y", fp.y);
  tapUp(Math.floor(fp.x), Math.floor(fp.y), 30);
}
function moveToPoint(fp) {
  console.log("move x", fp.x, "y", fp.y);
  moveTo(Math.floor(fp.x), Math.floor(fp.y), 40);
}

function distance(p1, p2) {
  return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
}

function maxDistances(ps, p) {
  var maxDis = 0;
  var maxKey = "";
  for(var key in ps) {
    var p1 = ps[key];
    var dis = distance(p1, p);
    if (dis > maxDis) {
      maxDis = dis;
      maxKey = key;
    }
  }
  return maxDis;
}

function minDistances(ps, p) {
  var minDis = 9999;
  var minKey = "";
  for(var key in ps) {
    var p1 = ps[key];
    var dis = distance(p1, p);
    if (dis < minDis) {
      minDis = dis;
      minKey = key;
    }
  }
  return [minKey, minDis];
}

function shortPath(centers, k, d) {
  for (var k1 in centers) {
    if (k1 != k) {
      var dis = distance(centers[k], centers[k1]);
      if (dis < cropW/8) {
        var obj = shortPath(centers, k1, dis);
      }
    }
  }
  return {dis: dis + obj.dis, path: obj.path+k};
}

function movePoints(centers, p) {
  var paths = [];
  // var first = true;
  while(true) {
    var arr = minDistances(centers, p);
    var k = arr[0];
    var d = arr[1];
    if (k == "") {
      break;
    }
    p = centers[k];
    if (d < cropW/8 || d > cropW/16 ) {
      paths.push(p);
    }
    // if (first) {
      // first = false;
      // tapDownPoint(p);
    // }
    // moveToPoint(p);
    delete centers[k];
  }
  // tapUpPoint(p);
  return paths;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

tap(540, 1330, 100);
sleep(400);

for (var i = 0; i < 1; i++) {
  findMoveablePosition();
  sleep(300);
}



tap(920, 210, 50);
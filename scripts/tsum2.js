var IS_TSUM_LOAD;
var IS_PREPARED_TSUMS;

function refreshCode() {
  if (IS_TSUM_LOAD) {
    IS_TSUM_LOAD = false;
    if (IS_PREPARED_TSUMS) {
      // releaseTsum();
    }
  }
}

refreshCode();

if (IS_TSUM_LOAD === true) {
  console.log('plugin script alread load');
  // do nothing
} else {
  IS_TSUM_LOAD = true;

  // const parameters
  var tsumFiles=["P001","P002","P003","P004","P005","P006","P007","P008","P009","P010","P011","P012","P013","P014","P015","P016","P017","P018","P019","P020","P021","P022","P023","P024","P025","P026","P027","P028","P029","P030","P031","P032","P033","P034","P035","P036","P037","P038","P039","P040","P041","P042","P043","P044","P045","P046","P047","P048","P049","P050","P051","P052","P053","P054","P055","P056","P057","P058","P059","P060","P061","P062","P063","P064","P065","P066","P067","P068","P069","P072","P073","P074","P075","P076","P077","P078","P079","P080","P081","P082","P083","P084","P085","P086","P087","P088","P089","P090","P091","P092","P093","P094","P095","P096","P097","P098","P099","P100","P101","P102","P103","P104","P105","P106","P107","P108","P109","P110","P111","P112","P113","P114","P115","P116","P117","P118","P119","P120","P121","P122","h01","h02","h03","h04","h05","h06","h07","h08","h09","h10","h11","h12","h13","h14","h15"];
  var rotations = ['0', '45', '90', '135', '180', '225', '270', '315'];
  
  var colors = [[255,0,0], [0,255,0], [0,0,255], [0,255,255], [255,0,255]];

  var cropX = 0;
  var cropY = 400;
  var cropW = 1080;
  var cropH = 1080;
  var resizeW = 128;
  var resizeH = 128;
  var tsumBoundW = 9;
  var tsumBoundH = 9;

  var tsumImages;
  var tsumMaxScores;

  function printMaxScores(tsumMaxScores) {
    for (var i = 0; i < 10 && i < tsumMaxScores.length; i++) {
      console.log(i, tsumMaxScores[i].key, tsumMaxScores[i].score);
    }
  }

  function getEachTsumMaxScore(tsumImages, boardImg) {
    var tsumMaxScores = [];
    for (var k in tsumImages) {
      var tsumImage = tsumImages[k];
      var xyScore = findImage(boardImg, tsumImage);
      xyScore.img = tsumImage; 
      xyScore.key = k;
      tsumMaxScores.push(xyScore);
    }
    tsumMaxScores.sort(function(a, b){
      return a.score > b.score ? -1 : 1;
    });
    return tsumMaxScores;
  }

  function removeSameTsumImages(tsumMaxScores) {
    for (var i = 0; i < tsumMaxScores.length; i++) {
      var erase = [];
      for (var j = 0; j < tsumMaxScores.length; j++) {
        if (i == j) {
          continue;
        }
        var imgI = tsumMaxScores[i].img;
        var imgJ = tsumMaxScores[j].img;
        var score = getIdentityScore(imgI, imgJ);
        if (score > 0.7) {
          erase.push(j);
        }
      }
      for (var k = erase.length - 1; k >= 0; k--) {
        tsumMaxScores.splice(erase[k], 1);
      }
    }
    return tsumMaxScores;
  }

  function loadTsumRotationImages(tsumMaxScores) {
    var tsumPath = getStoragePath() + '/tsum_15';
    for (var i = 0; i < 5 && i < tsumMaxScores.length; i++) {
      tsumMaxScores[i].rotations = [];
      var maxScore = tsumMaxScores[i];
      for (var r in rotations) {
        var filename = tsumPath + '/' + maxScore.key + '_' + rotations[r] + '.png';
        tsumMaxScores[i].rotations.push(openImage(filename));
      }
    }
  }

  function loadTsumImages() {
    var tsumImages = {};
    var tsumPath = getStoragePath() + '/tsum_15';
    for (var i in tsumFiles) {
      var key = tsumFiles[i];
      var filename = tsumPath + '/' + key + '_0.png';
      tsumImages[key] = openImage(filename);
      // console.log('load', tsumImages[key], filename);
    }
    return tsumImages;
  }

  function releaseTsumRotationImages(tsumMaxScores) {
    for (var i = 0; i < 5 && i < tsumMaxScores.length; i++) {
      for (var r in tsumMaxScores[i].rotations) {
        releaseImage(tsumMaxScores[i][r]);
      }
    }
  }

  function releaseTsumImages(tsumImages) {
    for (var k in tsumImages) {
      releaseImage(tsumImages[k]);
    }
  }

  function usingTimeString(startTime) {
    return 'usingTime: ' + (Date.now() - startTime);
  }

  function run() {
    var startTime = Date.now();
    if (!IS_PREPARED_TSUMS) {
      console.log('prepare tsums...');
      prepareTsum();
      console.log('prepare tsums', usingTimeString(startTime));
    }

    var boardImg = getScreenshotModify(cropX, cropY, cropW, cropH, resizeW, resizeH, 90);
    var boardTsums = [];

    for (var i = 0; i < 5 && i < tsumMaxScores.length; i++) {
      for (var j = 0; j < rotations.length; j++) {
        var rotatedImage = tsumMaxScores[i].rotations[j];
        var scoreLimit = tsumMaxScores[i].score * 0.8;
        var results = findImages(boardImg, rotatedImage, scoreLimit, 12, true);
        // console.log(JSON.stringify(results));
        for (var k in results) {
          var result = results[k];
          boardTsums.push({
            tsumIdx: i,
            // tsum: tsumMaxScores[i],
            x: result.x,
            y: result.y,
            score: result.score,
          });
        }
      }
    }
    boardTsums.sort(function(a, b){return a.score > b.score ? -1 : 1;});
    console.log('finding all rotated tsum in board', boardTsums.length, usingTimeString(startTime));
    
    var board = [];
    for (var i in boardTsums) {
      var boardTsum = boardTsums[i];
      var isExist = false;
      for (var j in board) {
        var bt = board[j];
        if (boardTsum.x >= (bt.x - tsumBoundW) && boardTsum.x < (bt.x + tsumBoundW) && boardTsum.y >= (bt.y - tsumBoundH) && boardTsum.y < (bt.y + tsumBoundH)) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        board.push(boardTsum);
      }
    }
    console.log('find tsums in board', board.length, usingTimeString(startTime));
    
    for (var i = 0; i < board.length; i++) {
      var boardTsum = board[i];
      drawCircle(boardImg, boardTsum.x + 7, boardTsum.y + 7, 1, colors[boardTsum.tsumIdx][0], colors[boardTsum.tsumIdx][1], colors[boardTsum.tsumIdx][2], 0);
    }
    saveImage(boardImg, getStoragePath() + "/boardImg2.jpg");
    releaseImage(boardImg);
    return board;
  }

  function releaseTsum() {
    IS_PREPARED_TSUMS = false;
    releaseTsumRotationImages(tsumMaxScores);
    releaseTsumImages(tsumImages);
    tsumImages = {};
    tsumMaxScores = [];
  }

  function prepareTsum() {
    tsumImages = loadTsumImages();

    var boardImg = getScreenshotModify(cropX, cropY, cropW, cropH, resizeW, resizeH, 90);
    // saveImage(boardImg, getStoragePath() + "/boardImg.jpg");

    tsumMaxScores = getEachTsumMaxScore(tsumImages, boardImg);
    tsumMaxScores = tsumMaxScores.splice(0, 30);
    console.log('total tsums', tsumImages.length, 'using tsums', tsumMaxScores.length);
    
    removeSameTsumImages(tsumMaxScores);
    console.log('after remove same tsums', tsumMaxScores.length);
    // printMaxScores(tsumMaxScores);
    loadTsumRotationImages(tsumMaxScores); 
    releaseImage(boardImg);

    IS_PREPARED_TSUMS = true;
  }
}

// tap(540, 1330, 100);
// sleep(500);

run();
// console.log(tsumMaxScores);

// sleep(500);
// tap(920, 210, 50);

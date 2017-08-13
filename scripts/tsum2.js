var tsumFiles=["P001","P002","P003","P004","P005","P006","P007","P008","P009","P010","P011","P012","P013","P014","P015","P016","P017","P018","P019","P020","P021","P022","P023","P024","P025","P026","P027","P028","P029","P030","P031","P032","P033","P034","P035","P036","P037","P038","P039","P040","P041","P042","P043","P044","P045","P046","P047","P048","P049","P050","P051","P052","P053","P054","P055","P056","P057","P058","P059","P060","P061","P062","P063","P064","P065","P066","P067","P068","P069","P072","P073","P074","P075","P076","P077","P078","P079","P080","P081","P082","P083","P084","P085","P086","P087","P088","P089","P090","P091","P092","P093","P094","P095","P096","P097","P098","P099","P100","P101","P102","P103","P104","P105","P106","P107","P108","P109","P110","P111","P112","P113","P114","P115","P116","P117","P118","P119","P120","P121","P122","h01","h02","h03","h04","h05","h06","h07","h08","h09","h10","h11","h12","h13","h14","h15"];
var rotations = ['0', '45', '90', '135', '180', '225', '270', '315'];

var cropX = 0;
var cropY = 400;
var cropW = 1080;
var cropH = 1080;
var resizeW = 128;
var resizeH = 128;

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
  for (var i = 0; i < 10; i++) {
    console.log(i, tsumMaxScores[i].key, tsumMaxScores[i].score);
  }
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

function main() {
  var tsumImages = loadTsumImages();

  var boardImg = getScreenshotModify(cropX, cropY, cropW, cropH, resizeW, resizeH, 80);
  console.log(boardImg);
  saveImage(boardImg, getStoragePath() + "/boardImg.jpg");

  var tsumMaxScores = getEachTsumMaxScore(tsumImages, boardImg);
  tsumMaxScores = tsumMaxScores.splice(0, 25);
  console.log(tsumMaxScores.length);
  // printMaxScores(tsumMaxScores);
  removeSameTsumImages(tsumMaxScores);
  console.log(tsumMaxScores.length);
  printMaxScores(tsumMaxScores);

  loadTsumRotationImages(tsumMaxScores);
console.log(Date.now());
  for (var i = 0; i < 5 && i < tsumMaxScores.length; i++) {
    for (var j = 0; j < 8; j++) {
      var rotatedImage = tsumMaxScores[i].rotations[j];
      var scoreLimit = tsumMaxScores[i].score * 1;
      var results = findImages(boardImg, rotatedImage, scoreLimit, 10, true);
      for (var k in results) {
        var result = results[k];
        
        // drawCircle(boardImg, result.x + 7, result.y + 7, 2, 255, 0, 0, 0);
      }
      
      // console.log(JSON.stringify(results));
      // break;
    }
  }
  console.log(Date.now());

  saveImage(boardImg, getStoragePath() + "/boardImg2.jpg");
  releaseImage(boardImg);
  releaseTsumRotationImages(tsumMaxScores);
  releaseTsumImages(tsumImages);
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

tap(540, 1330, 100);
sleep(500);



main();


sleep(500);
tap(920, 210, 50);

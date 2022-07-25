// JavaScript
const ccxt = require("ccxt");
const log = require("./log");
const fs = require("fs");
const ohlcvs = require("./ohlcvs.json");

const ohlcvs_ = [
  [1657652400000, 0.0403, 0.0404, 0.0401, 0.0402, 41396.4],
  [1657653300000, 0.0403, 0.0403, 0.0401, 0.0401, 124476.3],
  [1657654200000, 0.0401, 0.0403, 0.0401, 0.0411, 70640.4],
  [1657655100000, 0.0401, 0.0406, 0.0401, 0.0403, 116042.5],
  [1657656000000, 0.0403, 0.0404, 0.0401, 0.0404, 48936.5],
  [1657656900000, 0.0404, 0.0404, 0.0403, 0.0413, 28672.1],
  [1657657800000, 0.0405, 0.0408, 0.0405, 0.0406, 49776.2],
  [1657658700000, 0.0405, 0.0405, 0.0402, 0.0405, 68214.8],
];
const ex = new ccxt.binance();

const symbol = "ASTRBUSD";
const period = "1m";
const back = 1440;

// 01m - 1440  
// 03m - 480  
// 05m - 288  
// 15m - 96  


async function ohlcvs_gen(params) {
  ohlcvs_json = await ex.fetchOHLCV(symbol, period, undefined, back);
  fs.writeFile('ohlcvs.json', JSON.stringify(ohlcvs_json), 'utf8', (err)=>{
    if (err) throw err;
    console.log('write to ohlcvs.json');
  });
}

// ohlcvs_gen()

1 &&
  (async () => {

    var config = {
      _percDiff: 1,
    };

    var totalPricePercDiffBuy = 0;
    var totalPricePercDiffSell = 0;
    var left = true; // left (buy), right (sell)
    var isShowBuy = false;
    var isShowSell = false;
    var lastBuySell = [0, 0];
    var buySell = [[], []];

    for (const key in []) {
      const kc = ohlcvs[key];
      const kcp = ohlcvs[key - 1] ? ohlcvs[key - 1] : ohlcvs[0];
      var isBull = kc[4] > kcp[4];

      // console.log(isBull);
      buySell[isBull ? 1 : 0].push(kc[4]);
    }

    for (const key in ohlcvs) {
      const kc = ohlcvs[key];
      // const kcp = ohlcvs[key - 1];
      const kcp = ohlcvs[key - 1] ? ohlcvs[key - 1] : ohlcvs[0];

      // buySell[0].push(kc[4])

      // if (key > 1) {
      var isBull = kc[4] > kcp[4];
      var pricePercDiff = percDiff(kc[4], kcp[4]).toFixed(1);
      var buyersSuppor = getBySelSupport(kc[1] ,kc[2], kc[3], kc[4])

      left = isBull;

      //  /////////////////////// %

      if (left) {
        totalPricePercDiffBuy += parseFloat(pricePercDiff);
      } else {
        totalPricePercDiffBuy = 0;
      }

      if (!left) {
        totalPricePercDiffSell += parseFloat(pricePercDiff);
      } else {
        totalPricePercDiffSell = 0;
      }
      // SELL
      
      if (left && !isShowBuy && lastBuySell[0] > config._percDiff) {


        // section price diff ///////////////////////////////////////////
        var t_sell = 0;
        var t_buy = 0;

        for (const idx in buySell[0]) {
          var t = buySell[0][idx - 1] - buySell[0][idx];
          t_sell = +t;
        }
        for (const idx in buySell[1]) {
          var t = buySell[1][idx - 1] - buySell[1][idx];
          t_buy = +t;
        }

        // log(
        //   "sell",
        //   t_sell.toFixed(5),
        //   "t_buy",
        //   t_buy.toFixed(5),
        //   "d--f",
        //   "~cyn",
        //   (Math.abs(t_sell) - Math.abs(t_buy))
        // );

        buySell = [[], []];
        // /////////////////////////////////////////// end section price diff

        log(
          "~b_bk",
          "                  ",
          "~b_bl",
          lastBuySell[0].toFixed(1) + "%",
          "~b_rd"
        );
      }
      isShowBuy = true;
      if (!left) isShowBuy = false;
      // BUY
      if (!left && !isShowSell && lastBuySell[1] > config._percDiff) {
        // console.log(buySell);
        // buySell=  [[],[]];

        log(
          "~b_bk",
          "                  ",
          "~b_bl",
          lastBuySell[1].toFixed(1) + "%",
          "~b_grn"
        );
      }
      isShowSell = true;
      if (left) isShowSell = false;

      lastBuySell[0] = isBull ? totalPricePercDiffBuy : totalPricePercDiffSell;
      lastBuySell[1] = isBull ? totalPricePercDiffBuy : totalPricePercDiffSell;

      buySell[left ? 0 : 1].push(kc[4]);

      // OUT
      log(
        "~grn",
        "close",
        kc[4],
        isBull ? "~b_grn" : "~b_rd",
        pricePercDiff + "%",
        "~reset",
        // "~wt",
        // "|",
        // isBull ? totalPricePercDiffBuy : totalPricePercDiffSell,
        buyersSuppor ? "~grn" : "~rd", "^"
      );

      // }
    }
  })();

log("~b_mgnta", ((ohlcvs.length * 15) / 60 / 24).toFixed(), "days kandles");

function percDiff(num1, num2) {
  var diff = num2 - num1;
  var avrg = (num1 + num2) / 2;
  // (Difference/Average) × 100%
  return Math.abs((diff / avrg) * 100);
}

function getBySelSupport(open ,close, high, low) {
  byrsPush = 0; 
  selrsPush = 0; 
  if(open < close)selrsPush = (high - close)
  else selrsPush = high - open; 

  if(close < open){ byrsPush = (close - low)}
  else byrsPush = open - low; 

  // console.log("sell", selrsPush, ' | buy',  byrsPush);
  return  byrsPush > selrsPush 
}


// getBySelSupport(5, 7, 9, 4)
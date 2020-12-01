//cma api that is imported by app.js and sent to cma.js
//data input is a 2D array

// goal is to iterate through data and get the summary statistics;

let objArr = [];
function getSummaryStatistics(data){
  let beds = [];
  let baths = [];
  let listprice = [];
  let soldprice = [];
  let sqft = [];
  let dom = [];
  let ppsf = [];
  let listings = data;

  //console.log("listings"+ listings);

  return new Promise(function(resolve, reject){

      resolve(listings);

  }).then(function(result){
    console.log("called!");


    for(let i=1; i<listings.length; i++){
      listing = listings[i];
      //console.log("listing"+listing);
      beds.push(listing[8]);
      baths.push(listing[9]);
      dom.push(listing[10]);
      sqft.push(listing[7]);
      soldprice.push(listing[5]);
      listprice.push(listing[6]);
      ppsf.push((listing[5]/listing[7]));
    }

  }).then(function(result){
    //at this point we have the data stored in the arrays
    beds.sort();
    baths.sort();
    listprice.sort();
    soldprice.sort();
    sqft.sort();
    dom.sort();
    ppsf.sort();


  }).then(function(result){
      //get summary statistics in obj arrays
      // order of array is bed, bath, listprice, soldprice, sqft, dom, ppsf

      objArr.push(getStats(beds));
      objArr.push(getStats(baths));
      objArr.push(getStats(listprice));
      objArr.push(getStats(soldprice));
      objArr.push(getStats(sqft));
      objArr.push(getStats(dom));
      objArr.push(getStats(ppsf));
      //console.log(objArr);

      //how do i get this objArr back??
      return objArr;

  });

}

function getStats(x){
  let result={};
  result.low=parseInt(x[0]);
  result.high=parseInt(x[x.length-1]);
  let med;
  if(x.length % 2 == 1){
    let med = parseInt(x[x.length/2]);

  }else{
    med = ((parseInt(x[x.length/2])+parseInt(x[x.length/2 + 1]) / 2));
  }
  result.median = med;
  let avg = 0;
  for(let i=0; i<x.length; i++){
    avg += parseInt(x[i]);
  }
  avg = avg/x.length;
  result.average = avg.toFixed(2);

  return result;
}






module.exports = {
  getSummaryStatistics: getSummaryStatistics,
  getStats: getStats,

}

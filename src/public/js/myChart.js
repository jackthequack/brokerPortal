
document.addEventListener("DOMContentLoaded", main);
function main(){

  var req = new XMLHttpRequest();
  var url = '/api/data';
  req.open('GET', url, true);
  req.addEventListener('load', handleData);
  req.send();

}



function handleData(){
    var cityListings = [];
    //unwrap the data from the
    var repos = JSON.parse(this.responseText);
    var listing = repos[0];
    var listings = listing.listings;

    new Promise(function(resolve, reject){

      resolve(listings);
    }).then(function(result){
      var cityListings = [];
      const averageAll = listings.reduce(function(total, curr){
        const add = parseInt(curr.listprice);
        if(Number.isNaN(add)===false && add>=0){
          return total += add;}
          else{ return total;}
        },0) / listings.length;

      const averageCity = listings.map(function(x){ //for each listing
        let check = 0;
        for(let i=0; i<cityListings.length; i++){

          if(cityListings[i].city == x.city){
            cityListings[i].num += 1;
            cityListings[i].price += parseInt(x.listprice);
            check = 1;
          }
        }//end for - iterate through cityListings to find if it's there
        if(check===0){
          let adder = {city:x.city, num: 1, price: parseInt(x.listprice)};
          cityListings.push(adder);
        }
      }); // end of the mapping

      return {average: averageAll, averageCity: cityListings};
    }).then(function(result){
        let byCity = result.averageCity;
        let average = result.averageAll;
        let data = [];
        let labels = [];

        for(let i=0; i<byCity.length; i++){
          data.push(byCity[i].price / byCity[i].num);
          labels.push(byCity[i].city);
        }

        renderChart(data, labels);
    });
  }//end of handleData




function renderChart(data, labels) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average listing price by city',
                data: data,
            }]
        },
    });
}

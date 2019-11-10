async function initMap() {
    console.log("initmap func enetered")
    let pos = await getUserPos();
    console.log(pos);
        
    renderMap(pos);

    // console.log("done");
    
    // await renderMap(pos);
    
    // message(position);
}

function renderMap(pos){
    console.log("render func enetered")
    let position = pos;
    console.log(position);
    const map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 15
    });

    const marker = new google.maps.Marker({position: position, map: map});  
};

async function getUserPos(){
  let pos;
  // Get user's location
  if ('geolocation' in navigator) {
    console.log("geo allowed");
    navigator.geolocation.getCurrentPosition(successFunc, errorFunc);

    function successFunc(currentPosition){
        console.log("entered success call back")
        pos = {lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude}
        console.log(pos)

        // if(pos){
        //   console.log("pos")
        //   initMap(pos);
        //   }
        
        return(pos);
      }

    function errorFunc(){
      alert(`Error (${err.code}): ${err.message}`);
    } 
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

function message(pos){
  if(pos.lat>40 ){
    document.getElementById('message').innerHTML = "<ul><li>im <li>at <li>ITP</ul>"
  } else {
    document.getElementById('message').innerHTML = "<ul><li>im <li>NOT <li>at <li>ITP</ul>"
  }
}

// function doubleAfter2Seconds(x) {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         resolve(x * 2);
//       }, 2000);
//     });
// }

// doubleAfter2Seconds(10).then((r) => {
//     console.log(r);
//   });


// async function hello() {
//     setTimeout(()=>{
//         console.log("clown");
//         return('Hello Alligator!');
//     },1000);
//   }
  
// hello().then((x) => console.log(x)); // Hello Alligator!

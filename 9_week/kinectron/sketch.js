let kinectron;

function setup(){
    createCanvas(400,400);

    kinectron = new Kinectron("10.18.220.67");
    kinectron.makeConnection();
}

function drawBody(body){

    let joints = body.joints;

    for (let i=0; i<joints.length; i++){
        let joints = joints[i];

        fill(255);
        ellipse(joint.depthX * width, joint.depthY * innerHeight, 15);
    }
}

function draw(){
    // background(222);

}

//python -m http.server 9000
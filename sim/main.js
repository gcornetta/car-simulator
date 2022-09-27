document.getElementById('carCount').value = localStorage.getItem('carCount') || 1
document.getElementById('mutationAmount').value = localStorage.getItem('mutationAmount') || '0.5'

const roadCanvas=document.getElementById('roadCanvas')          //get canvas reference from html document
roadCanvas.width=200                                            // set canvas width to 200px

const networkCanvas=document.getElementById('networkCanvas')    //get canvas reference from html document
networkCanvas.width=800                                         // set canvas width to 400px

const roadCtx = roadCanvas.getContext('2d')                     // get canvas 2D context to draw on canvas
const networkCtx = networkCanvas.getContext('2d')

// create road instance centered in half the width of the canvas
const road = new Road(roadCanvas.width/2,roadCanvas.width*0.9)

// create parked cars
const parked = [
    new Car(road.getLaneCenter(2),-60,30,50, 'DUMMY',2, getRandomColor()),
    new Car(road.getLaneCenter(2),-220,30,50, 'DUMMY',2, getRandomColor()),
    new Car(road.getLaneCenter(2),-320,30,50, 'DUMMY',2, getRandomColor()),
    new Car(road.getLaneCenter(2),-420,30,50, 'DUMMY',2, getRandomColor()),
    new Car(road.getLaneCenter(2),-500,30,50, 'DUMMY',2, getRandomColor())
]

const N = 300
const cars = generateCars(N)

let bestCar=cars[0]

if(!window.localStorage.getItem('alreadyLoaded')){
    window.localStorage.setItem('alreadyLoaded', 'true')
    window.localStorage.setItem('bestBrain','{"levels":[{"inputs":[0.4431371017445489,0,0,0.0580840897885031,0,0.6094825306348931,0.666199882745563,0.7048543767686639],"outputs":[0,0,0,1,1,0],"biases":[0.36968141006496724,0.3700942632166796,0.0682343263520252,-0.2313245374085312,-0.2500694682164774,-0.01968042665757383],"weights":[[-0.18575844801944896,-0.3270610296052422,-0.13425472143478986,-0.35504960100576655,-0.045036090667425865,-0.17141556870538674],[-0.2177614885694011,0.2772259826526733,-0.5068439376967369,0.2292125537366688,-0.23775329640004023,-0.47403073187088435],[-0.14553904995467498,-0.5375420527995296,-0.46336677281583016,-0.1950996870147854,-0.034037568330570034,0.7562130681069166],[-0.3120288192605308,-0.6924214927050603,-0.2793128618217196,0.13111875677634818,-0.07776690121970281,0.23606479686196255],[0.15604738625020023,0.009654457070998546,-0.05458327496767684,-0.009507581030659296,0.2688632931889497,0.31590484948348097],[-0.012076772778931932,0.02142899065431983,-0.3538942247995266,0.06411502580108219,0.3889778728410118,-0.5899694011768268],[0.08812667484501108,0.44287482944054013,-0.25026986837245424,0.3147283420973316,-0.46042420852417276,0.15937649649175517],[-0.2463906674815233,-0.12349751649254112,-0.38346640815182254,-0.45386243077018074,-0.1176750864989507,-0.43297005483225626]]},{"inputs":[0,0,0,1,1,0],"outputs":[0,1,1,0],"biases":[-0.050204039431389375,-0.054016087845635885,-0.01492886123387327,-0.1431004961966651],"weights":[[0.12672606828094063,0.17017623028719944,-0.13130547831230932,0.3406045124736712],[-0.41939637350529413,-0.11187650382008918,-0.032936253310792626,-0.10247701015469418],[0.42246415565227957,-0.3402862834554992,-0.338833930506762,0.6341150676723518],[-0.0503316939907848,0.03132306147624275,0.6400313670922215,0.11453032705033106],[-0.07236544782463453,0.18329808073435325,-0.23212028847365967,-0.33323188905439965],[-0.07852681215289387,-0.21823948618633973,-0.030883456132707765,0.08782300172209447]]}]}')
}

if(window.localStorage.getItem('bestBrain')){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            window.localStorage.getItem('bestBrain'))
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain, Number(document.getElementById('mutationAmount').value))
        }
    }
}

const start = Date.now()                            // time when animation starts
animate()                                           // animate the car

function save(){
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard(){
    localStorage.removeItem('bestBrain')
}

function generateCars (N) {
    const cars = []

    for (let i=1; i<=N; i++) {
        /** 
         * create car instance at (x, y, w, h)
         * (x, y): car position on canvas (x is the center of lane #1)
         * (w, h): car width and height in pixels
         */
        cars.push(new Car(road.getLaneCenter(1),100,30,50, 'AI'))
    }
    return cars
}

/**
 * function animate
 * animates the car
 * @param{ number } time -  timestamp used to animate the neural network interconneconnection
 */
function animate(time) {
    for (let i = 0; i < parked.length; i++) {
        parked[i].update(road.borders, [])          // the parked car cannot interact with itself
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, parked)
    }
    
    bestCar = cars.find(
        c => c.fitness === Math.max(...cars.map(c=>c.fitness))
    )
    
    roadCanvas.height = window.innerHeight                  // set canvas height to full window height
    networkCanvas.height = window.innerHeight
    
    roadCtx.save()
    roadCtx.translate(0,-bestCar.y+roadCanvas.height*0.7)   // implements camera effect. The road moves not the car
    
    road.draw(roadCtx)                                      // draw the road in the canvas context
    for (let i = 0; i < parked.length; i++) {               // draw parked cars
        parked[i].draw(roadCtx)
    }

    if (bestCar.spotCorners) {
        bestCar.drawSpot(roadCtx)
    }

    roadCtx.globalAlpha=0.2
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(roadCtx)                               // draw the car in the canvas context
    }
    roadCtx.globalAlpha=1
    bestCar.draw(roadCtx, true)
    roadCtx.restore()                                       // restore the canvas
        
    networkCtx.lineDashOffset=-time/50                      // animates dashes adding an offeset that depends on time
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    if((Date.now() - start) / 1000 < 30) {                  // run the animation during 30 seconds
        // The requestAnimationFrame calls the animate function to refresh car position 
        // and also passes one argument the callback (i. e. time). 
        // It’s a timestamp with how much milliseconds have passed since the document loaded
        requestAnimationFrame(animate) 
    } else {
        window.electronAPI.send(bestCar.brain)
    }
} 

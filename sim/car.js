/**
 * Class representing a car
 */
class Car {
    /**
     * Create a car
     * @param {number} x  - The x value in pixels.
     * @param {number} y  - The y value in pixels.
     * @param {number} width - The car width in pixels 
     * @param {number} height - The car height in pixels.
     * @param {String} controlType - KEYS | DUMMY | AI.
     * @param {number} maxSpeed - The car max speed (default = 3).  
     */
    constructor(x, y, width, height, controlType, maxSpeed = 3, color='blue') {
        this.x=x
        this.y=y
        this.width=width
        this.height=height

        // simple car physics
        this.speed=0
        this.acceleration=0.2
        this.maxSpeed= maxSpeed
        this.friction=0.05
        this.angle=0
        this.damaged= false
        this.fitness=0
        this.spotFound = false      // found parking spot

        this.useBrain = controlType === 'AI'

        // show sensor rays only for autonomous car
        if (controlType !== 'DUMMY') {
            this.sensor=new Sensor(this)                             // reference to car sensor
            this.brain=new NeuralNetwork(                            // creates the brain
                [this.sensor.rayCount,6,4]
            )
        }

        this.controls = new Controls(controlType)                   // reference to car controls
        this.img=new Image()
        this.img.src='assets/car.png'

        this.mask=document.createElement('canvas')
        this.mask.width=width
        this.mask.height=height

        const maskCtx=this.mask.getContext('2d')
        this.img.onload=()=>{
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height)
            maskCtx.fill()

            maskCtx.globalCompositeOperation='destination-atop'
            maskCtx.drawImage(this.img,0,0,this.width,this.height)
        }
 
    }
    
    update(roadBorders, parked) {
        let penalty 

        if(!this.damaged) {
            this.#move()                                            // update car position
            this.polygon=this.#createPolygon()                      // polygon attribute associated to car
            this.damaged=this.#assessDamage(roadBorders, parked)    // check if car is damaged
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, parked)                 // update sensor rays     
            const offsets = this.sensor.readings.map(
                s => s === null ? 0 : 1 - s.offset
            )
            const outputs=NeuralNetwork.feedForward(offsets,this.brain)

            if(this.useBrain && this.spotFound){
                this.controls.forward=outputs[0]
                this.controls.left=outputs[1]
                this.controls.right=outputs[2]
                this.controls.backward=outputs[3]
                if (this.loss && this.loss !== 0) {
                    const loss = this.loss
                    this.loss= this.#getLoss()
                    if (this.loss > loss) {
                        penalty = this.loss - loss
                    } else {
                        penalty = 0
                    }
                } else {
                    this.loss= this.#getLoss()
                    penalty = 0
                }

                this.fitness = (1 /(this.loss + 1)) - (penalty * 0.05)
            } else {
                this.controls.forward = true
                this.speed = 0.5
                this.spotFound = this.#findSpot()
            }
        }
    }


    #getLoss () {
        const spotCorners= []
        const distances = []
    
        spotCorners.push({                      // top right
            x: this.lastRead['x']+ this.width,
            y: this.lastRead['y'] + 10
        })

        spotCorners.push({                      // top left
            x: this.lastRead['x'],
            y: this.lastRead['y'] + 10
        })

        spotCorners.push({                      // bottom left
            x: this.lastRead['x'],
            y: this.lastRead['y'] + this.height + 10
        })
        
        spotCorners.push({                      // bottom right
            x: this.lastRead['x'] + this.width,
            y: this.lastRead['y'] + this.height + 10
        })



        this.spotCorners = spotCorners

        for (let i=0; i<this.polygon.length; i++) {
            distances.push(euclideanDistance(this.polygon[i], spotCorners[i]))
        }

        return distances.reduce((a, b) => a + b, 0)/this.polygon.length
    }

    #findSpot () {
        const FIFO_SIZE = 2     // sensor readings FIFO size
        const SPOT_SIZE = 60    // parking spot size in pixels

        if (typeof this.startSpot === 'undefined' ) {
            this.startSpot = false
        }

        if (typeof this.fifo === 'undefined' ) {
            this.fifo = []
        }

        if (this.fifo.length < FIFO_SIZE) {
            this.fifo.push(this.sensor.readings[6].offset)
        } else {
            if ((this.fifo[1] > this.fifo[0]) && !this.startSpot) {
                this.y2 = this.sensor.readings[6].y
                this.startSpot = true
            } else if (this.fifo[1] < this.fifo[0] && this.startSpot) {
                    this.y1 = this.sensor.readings[6].y
                    this.lastRead = { ...this.sensor.readings[6]}   // save (x, y) of the beginning of the spot
                    delete this.lastRead['offset']
                    if(this.y2 - this.y1 > SPOT_SIZE) {
                        this.startSpot = false 
                        return true
                    }
            } else {
                this.fifo.shift()
                this.fifo.push(this.sensor.readings[6].offset)
            }
        }
        return false   
    }

    /**
     * check if car touches road border
     * @param {Array} roadBorders - The array with (x, y) coordinates of row border segment
     * @returns {Boolean} - True if collision, otherways false
     */
    #assessDamage(roadBorders, parked){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true
            }
        }
        for(let i=0;i<parked.length;i++){
            if(polysIntersect(this.polygon,parked[i].polygon)){
                return true
            }
        }
        return false
    }

    /**
     * Create a polygon that represents the car
     * @returns {Array} - The array with the (x, y) coordinates of the four corners of the car
     */
    #createPolygon(){
        const points=[]                                     // array of points with the four corners of the car
        const rad=Math.hypot(this.width,this.height)/2      // (hypotenuse/2) from the center of gravity of the car to one of the corners of the car
        const alpha=Math.atan2(this.width,this.height)      // angle of the hypotenuse
        points.push({                                       // computes the (x, y) coordinates of the four corners of the car
            x:this.x-Math.sin(this.angle-alpha)*rad,        // top right
            y:this.y-Math.cos(this.angle-alpha)*rad
        })
        points.push({                                       // top left
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({                                       // bottom left
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad, 
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        })
        points.push({                                       // bottom right
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,  
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        })
        return points                                       // return the array with the points
    }

    /**
     * move the cars in the direction specified 
     * by the controls
     */
    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration
        }
        if(this.controls.backward){
            this.speed-=this.acceleration
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed
        }
        // car must be slower when going backward. Hence maximum speed is set to maxSpeed/2
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2
        }

        if(this.speed>0){
            this.speed-=this.friction
        }
        if(this.speed<0){
            this.speed+=this.friction
        }
        // the code above may make the car bounce
        // when adding and subtracting friction doesn't 
        // make the speed exactely 0.
        // This check fixes this issue
        if(Math.abs(this.speed)<this.friction){
            this.speed = 0
        }

        // makes turn correctly left and right the car when going backward
        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip
            }
            if(this.controls.right){
                this.angle-=0.03*flip
            }
        }

        this.x-=Math.sin(this.angle)*this.speed // makes the car move in the direction of the rotation
        this.y-=Math.cos(this.angle)*this.speed
    }

    drawSpot(ctx) {
        ctx.lineWidth=2
        ctx.strokeStyle='white'

        ctx.beginPath()
        ctx.rect(this.spotCorners[1].x, this.spotCorners[1].y, this.width, this.height)
        ctx.stroke()
    }

    /**
     * Draw the car in the specified context
     * @param {Object} ctx - The canvas context.
     */
    draw(ctx, drawSensor=false){
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx)   // draw sensor rays
        }
        ctx.save()
        ctx.translate(this.x,this.y)
        ctx.rotate(-this.angle)
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height)
            ctx.globalCompositeOperation='multiply'
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height)
        ctx.restore()

    }
}
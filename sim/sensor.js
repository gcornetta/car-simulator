/**
 * Class representing sensor rays
 */
class Sensor{
    /**
     * Create sensor rays
     * @param {Object} car - The car object 
     */
    constructor(car){
        this.car=car
        this.rayCount=8            // number of sensor rays
        this.rayLength=150          // length of sensor rays in pixels
        this.raySpread=2*Math.PI    

        this.rays=[]                // array that keeps each individual ray once we created them
        this.readings=[]
    }

    /**
     * update sensor readings
     * @param {Array} roadBorders - The
     */
    update(roadBorders, parked){        //roadBorders is necessary to detect if road borders are close to the car
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(this.rays[i],roadBorders, parked)
            );
        }
    }

    /**
     * sensor reading to detect if borders are close to car
     * @param {Array} ray - The array with the ray start and end position
     * @param {Array} roadBorders - The array with the road start and end positions
     * @returns 
     */
    #getReading(ray,roadBorders, parked){
        let touches=[]      // keeps the points in which the ray touches an object of road border

        for(let i=0;i<roadBorders.length;i++){
            // utility function getIntersections returs (x, y) coordinates of the
            // ray intersection point and an offset (i.e., the distance of the 
            // intersection point from the centre of gravity of the car
            const touch = getIntersection(
                ray[0],             // ray segment (start - end)
                ray[1],
                roadBorders[i][0],  // road border segment (start - end)
                roadBorders[i][1]
            )
            if(touch){              // if there is a touch add to touches
                touches.push(touch)
            }
        }
        // do the same for parked cars
        for(let i=0;i<parked.length;i++){
            const poly = parked[i].polygon
            for (let j=0; j<poly.length; j++) {
                const value = getIntersection(
                    ray[0],             
                    ray[1],
                    poly[j],  
                    poly[(j+1)%poly.length]
                )
                if (value) {
                    touches.push(value)
                }
            }
        }

        if(touches.length==0){          // if no readings (i.e., no touches)
            return null                 // return null
        } else {
            const offsets=touches.map(e=>e.offset)      // extracts the offsets from the object 
            const minOffset=Math.min(...offsets)        // gets the minimum offset (a ray may touch multiple objects)
            return touches.find(e=>e.offset==minOffset) // returns the object with minimum offset
        }
    }

    /**
     * Casts rays from car center of gravity
     */
    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount === 1 ? 0.5 : i/(this.rayCount) // handles the case with one ray. If one then angle is 0.5 radians
            ) + this.car.angle                                // this is needed to make sensor rays turn with car

            // (x, y) coordinates of the start of ray
            const start = {
                x: this.car.x, 
                y :this.car.y
            }

            // (x, y) coordinates of the end of ray
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            }

            // save the ray segment into the array
            this.rays.push([start,end])
        }
    }

    /**
     * Draw a sensor ray segment
     * @param {Object} ctx - The canvas context where drawing the rays 
     */
    draw(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1]
            if(this.readings[i]){
                end=this.readings[i]
            }

            ctx.beginPath()             // draws the ray segments from start to end
            ctx.lineWidth=2
            ctx.strokeStyle = 'yellow'
            ctx.moveTo(                 // sets start location
                this.rays[i][0].x,
                this.rays[i][0].y
            )
            ctx.lineTo(                 // draw from start to end location
                end.x,                  // end is fixed by sensor reading and
                end.y                   // is the (x, y) where the ray touches an object
            )
            ctx.stroke()

            ctx.beginPath()             // draws the rest of the line in black
            ctx.lineWidth=2
            ctx.strokeStyle = 'black'
            ctx.moveTo(                 // from the end of the ray
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(                 // until the ray touch point with an object
                end.x,                 
                end.y
            )
            ctx.stroke()
        }
    }        
}
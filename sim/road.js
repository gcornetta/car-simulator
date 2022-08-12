/** 
 * Class representing the road 
 */
class Road{
    /**
     * Create the road
     * @param {number} x - The x -value of the center of the road
     * @param {number} width - The width of the road in pixels
     * @param {number} laneCount - The number of lanes of the road (default is 3)
     */
    constructor(x,width,laneCount=3){
        this.x=x
        this.width=width
        this.laneCount=laneCount

        this.left=x-width/2     // left side of the road (x - half the width)
        this.right=x+width/2    // right side of the road (x + half the width)

        const infinity=1000000  // infinity (necessary to define top and bottom of the road) better not to use JS infty for drawing
        this.top=-infinity      // top of the road
        this.bottom=infinity    // bottom of the road

        // coordinates of the road corners
        const topLeft = {
            x:this.left,
            y:this.top
        }
        const topRight = {
            x:this.right,
            y:this.top
        }
        const bottomLeft = {
            x:this.left,
            y:this.bottom
        }
        const bottomRight = {
            x:this.right,
            y:this.bottom
        }
        this.borders=[
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ]
    }

    /**
     * Gets the x coord of the lane center for a given lane
     * @param {number} laneIndex - The lane number 
     * @returns {number} - The x coord of the center of the specified lane
     */
    getLaneCenter(laneIndex){
        const laneWidth=this.width/this.laneCount;
        return this.left+laneWidth/2+
            Math.min(laneIndex,this.laneCount-1)*laneWidth;
    }

    /**
     * Draw the road of the canvas context
     * @param {Object} ctx - The context
     */
    draw(ctx){
        ctx.lineWidth=5
        ctx.strokeStyle='white'

        for(let i=1;i<=this.laneCount-1;i++){
            // x-ccordinate of the lanes separators are computed
            // with linear interpolation from left to right sides
            // according to a percentage
            const x=lerp(
                this.left,
                this.right,
                i/this.laneCount
            );
            
            ctx.setLineDash([20,20]) // dashed line 20 pixels long with breaks of 20 pixels
            ctx.beginPath()
            ctx.moveTo(x,this.top)
            ctx.lineTo(x,this.bottom)
            ctx.stroke()
        }

        ctx.setLineDash([])
        this.borders.forEach(border=>{
            ctx.beginPath()
            ctx.moveTo(border[0].x,border[0].y)
            ctx.lineTo(border[1].x,border[1].y)
            ctx.stroke()
        });
    }
}
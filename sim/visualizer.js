/**
 * Class with the methods to draw the neural network
 */
class Visualizer{
    /**
     * 
     * @param { Object } ctx - the canvas context 
     * @param { Object } network - the neural network to be drawn
     */
    static drawNetwork(ctx,network){
        const margin=50
        const left=margin
        const top=margin
        const width=ctx.canvas.width-margin*2
        const height=ctx.canvas.height-margin*2

        const levelHeight=height/network.levels.length;

        for(let i=network.levels.length-1;i>=0;i--){
            const levelTop=top+
                lerp(
                    height-levelHeight,
                    0,
                    network.levels.length==1
                        ?0.5
                        :i/(network.levels.length-1)
                )

            ctx.setLineDash([7,3]);
            Visualizer.drawLevel(ctx,network.levels[i],
                left,levelTop,
                width,levelHeight,
                i==network.levels.length-1
                    ?['⬆','⬅','⮕','⬇']
                    :[]
            );
        }
    }
    /**
     * 
     * @param { Object } ctx - the context cnavas 
     * @param { Object } level - a network level (inputs, outputs, weights, and biases) 
     * @param { number } left - the left margin of the level in the canvas 
     * @param { number} top - the top margin of the level in the canvas 
     * @param { number } width - the level width in the canvas
     * @param { number } height - the level heigh in the canvas
     * @param {*} outputLabels 
     */
    static drawLevel(ctx,level,left,top,width,height,outputLabels){
        const right=left+width;
        const bottom=top+height;

        const {inputs,outputs,weights,biases}=level;

        for(let i=0;i<inputs.length;i++){
            for(let j=0;j<outputs.length;j++){
                ctx.beginPath()
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs,i,left,right),
                    bottom
                )
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs,j,left,right),
                    top
                )
                ctx.lineWidth=2;
                // assigns a colour to the connections according to the weight
                // transparent (if close to 0), yellow (if close to +1), blue (if close to -1) 
                ctx.strokeStyle=getRGBA(weights[i][j])
                ctx.stroke()
            }
        }

        const nodeRadius=18;
        for(let i=0;i<inputs.length;i++){
            const x=Visualizer.#getNodeX(inputs,i,left,right)
            ctx.beginPath()
            ctx.arc(x,bottom,nodeRadius,0,Math.PI*2)
            ctx.fillStyle='black'
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x,bottom,nodeRadius*0.6,0,Math.PI*2)
            ctx.fillStyle=getRGBA(inputs[i])
            ctx.fill()
        }
        
        for(let i=0;i<outputs.length;i++){
            const x=Visualizer.#getNodeX(outputs,i,left,right)
            ctx.beginPath()
            ctx.arc(x,top,nodeRadius,0,Math.PI*2)
            ctx.fillStyle='black'
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x,top,nodeRadius*0.6,0,Math.PI*2)
            ctx.fillStyle=getRGBA(outputs[i])
            ctx.fill()

            ctx.beginPath()
            ctx.lineWidth=2
            ctx.arc(x,top,nodeRadius*0.8,0,Math.PI*2)
            ctx.strokeStyle=getRGBA(biases[i])
            ctx.setLineDash([3,3])
            ctx.stroke()
            ctx.setLineDash([])

            if(outputLabels[i]){
                ctx.beginPath()
                ctx.textAlign='center'
                ctx.textBaseline='middle'
                ctx.fillStyle='black'
                ctx.strokeStyle='white'
                ctx.font=(nodeRadius*1.5)+'px Arial'
                ctx.fillText(outputLabels[i],x,top+nodeRadius*0.1)
                ctx.lineWidth=0.5
                ctx.strokeText(outputLabels[i],x,top+nodeRadius*0.1)
            }
        }
    }

    /**
     * 
     * @param { Array } nodes - array with network nodes for a given output level
     * @param { number } index - index of the array of the input level for the given output level
     * @param { number } left - left boundary of the network level
     * @param { number } right - right boundary of the network level
     * @returns { number } - the x coordinate of an element of a network level
     */
    static #getNodeX(nodes,index,left,right){
        return lerp(
            left,
            right,
            nodes.length === 1
                ? 0.5
                : index/(nodes.length - 1)
        )
    }
}
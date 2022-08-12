/**
 * Class representing a neural network
 */
class NeuralNetwork{
    /**
     * Create a neural network
     * @param {Array} neuronCounts - array of neuron counts (input and output) 
     */
    constructor(neuronCounts){
        this.levels=[]
        for(let i=0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ))
        }
    }

    /**
     * Builds a feedforward network
     * @param { Array } givenInputs - the array with the input neurons
     * @param { Object } network - The network
     * @returns { Object } outputs - The array with the output neurons of the given network level
     */
    static feedForward(givenInputs,network){
        let outputs=Level.feedForward(
            givenInputs,network.levels[0])        //network first level
        for(let i=1;i<network.levels.length;i++){ // loops through the remaining levels
            outputs=Level.feedForward(
                outputs,network.levels[i])
        }
        return outputs
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        })
    }
}

/**
 * Class representing a level of the neural network
 */
class Level{
    /**
     * Create a network level
     * @param {number} inputCount - The number of inputs neurons
     * @param {number} outputCount - The number of output neurons
     */
    constructor(inputCount,outputCount){
        this.inputs=new Array(inputCount)   // array of input neurons
        this.outputs=new Array(outputCount) // array of output neurons
        this.biases=new Array(outputCount)  // array for neuron biases (threshold above which it will fire)

        this.weights=[]                     // array with the weight of a connection between input and output neurons
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount) // each input neuron must be connected to all output neurons
        }

        Level.#randomize(this)              // initialize to random weights
    }

    /**
     * Computes random weights and biases for a level
     * @param {number} level - The level of the network 
     */
    static #randomize(level){
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=Math.random()*2-1 // sets the weight to a random value between -1 and +1
            }
        }

        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=Math.random()*2-1 // sets the bias to a random value between -1 and +1
        }
    }

    /**
     * Builds a feedforward neural network
     * @param {*} givenInputs - The inputs of the network 
     * @param {Object} level - The level of the neural network 
     * @returns {Array} - an array with the outputs of the activation functions 
     */
    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i]      // sets the inputs of the level equal to the inputs of the network
        }

        for(let i=0;i<level.outputs.length;i++){   // for each output neuron i
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i] //the output is the weighted sum of its j inputs
            }

            if(sum>level.biases[i]){ // activation funtion
                level.outputs[i]=1
            }else{
                level.outputs[i]=0
            } 
        }

        return level.outputs // return the outputs of the neurons activation functions
    }
}
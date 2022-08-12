/**
 * Class representing car controls
 */
class Controls{
    /**
     * Create control object
     * @param {String} type - control type KEYS | DUMMY 
     */
    constructor(type){
        this.forward = false            // car going forward
        this.left = false               // car going left
        this.right = false              // car going right
        this.backward = false           // car going backward

        switch (type) {
            case 'KEYS':
                this.#addKeyboardListeners()    // keyboard listener
                break
            case 'DUMMY':
                break
        }
    }

    /**
     * Keyboard listener.
     * Listen to onkeydown and onkeyup events
     */
    #addKeyboardListeners(){
        document.onkeydown=(event)=>{
            switch(event.key){
                case 'ArrowLeft':
                    this.left=true
                    break
                case 'ArrowRight':
                    this.right=true
                    break;
                case 'ArrowUp':
                    this.forward=true
                    break;
                case 'ArrowDown':
                    this.backward=true
                    break
            }
        }

        document.onkeyup=(event)=>{
            switch(event.key){
                case 'ArrowLeft':
                    this.left=false
                    break
                case 'ArrowRight':
                    this.right=false
                    break
                case 'ArrowUp':
                    this.forward=false
                    break
                case 'ArrowDown':
                    this.backward=false
                    break
            }
        }
    }
}
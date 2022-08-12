/**
 * functio lerp: perform linear interpolation
 * @param {number} A - The start value (left of the road)
 * @param {number} B - The final value (right of the road)
 * @param {number} t - The percentage
 * @returns {number} - the x-coord of the lane (left + percentage of the sroad width)
 */
function lerp(A,B,t){
    return A+(B-A)*t 
}

/**
 * Gets the intersection among a ray and objects in the canvas
 * @param {Object} A - segment AB start point (x, y) 
 * @param {Object} B - segment AB end point (x, y)
 * @param {Object} C - segment CD start point (x, y)
 * @param {Object} D - segment CD end point (x, y)
 * @returns 
 */
function getIntersection(A,B,C,D){ 
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x)  // t = tTop/bottom
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y)  // u = uTop/bottom
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    if(bottom!=0){
        const t=tTop/bottom
        const u=uTop/bottom
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t                // how far from the car the object intersecting the ray is
            }
        }
    }

    return null                         // if bottom = 0 (segments not intersecting) return null
}

/**
 * Check if two polygons intersect
 * @param {Array} poly1 - The first polygon object
 * @param {Array} poly2 - The second polygon object
 * @returns 
 */
function polysIntersect(poly1, poly2){
    for(let i=0;i<poly1.length;i++){
        for(let j=0;j<poly2.length;j++){ // compares each segment of the first polygon with all the segments of second polygon
            const touch=getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if(touch){
                return true // intersection
            }
        }
    }
    return false    // no intesection
}

/**
 * 
 * @param { number } value - the weight of a connection among neurons 
 * @returns { String } - the RGBA encoding of the colour assigned to the connection
 */
function getRGBA(value) {
    const alpha=Math.abs(value)     // 0 full transparency, 1 full opacity
    const R= value < 0 ? 0 : 255    // positive value? if yes R channel is maximum
    const G= R                      // set G channel equal to red  (R + G = Yellow)
    const B= value > 0 ? 0 : 255    // negative value? if yes B channel is maximum
    return 'rgba('+ R + ',' + G + ',' + B + ',' + alpha + ')'
}

/**
 * function getRandomColor
 * @returns { String } - random color encoded as Hue, Saturation and Lightness
 */
function getRandomColor(){
    const hue=290 + Math.random() * 260     // all the hue but blue
    return 'hsl(' + hue + ', 100%, 60%)'
}

/**
 * 
 * @param { Object } from - (x, y) coordinates of the starting point 
 * @param { Object } to  - (x, y) coordinates of the ending point
 * @returns { number } - the euclidean distance among the two points
 */
function euclideanDistance (from, to) {
    return Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2)
}
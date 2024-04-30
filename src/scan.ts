import fs from 'fs'


let vols = await fs.promises.readdir("/Volumes")
console.log("vols",vols)

if(vols.some(n => n === "CIRCUITPY")) {
    console.log("found the cp drive")
}

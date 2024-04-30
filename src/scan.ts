import fs from 'fs'
import path from 'path'
import * as process from "node:process";


let vols = await fs.promises.readdir("/Volumes")
console.log("vols",vols)

if(!vols.some(n => n === "CIRCUITPY")) {
    console.error("no circuit python device found");
    process.exit(1)
}

const cp_drive = '/Volumes/CIRCUITPY'

console.log("drive is",cp_drive)

let files = await fs.promises.readdir(cp_drive)
console.log("files are",files)

const boot_text = await fs.promises.readFile(path.join(cp_drive,'boot_out.txt'))
const boot_info = boot_text.toString().split('\n')
for(let line of boot_info) {
    console.log("boot line: ", line)
    let res = line.match(/^Board ID:(?<board_id>.*)/)
    if(res && res.groups) {
        console.log("found the board", res.groups['board_id'])
    }
    let UID_regex = line.match(/^UID:(?<uid>.*)/)
    if(UID_regex && UID_regex.groups) {
        console.log("found the uid", UID_regex.groups['uid'])
    }
    let CP_regex = line.match(/Adafruit CircuitPython (?<cp_version>[\w\.]*) on (?<build_date>\d\d\d\d-\d\d-\d\d)\;/)
    if(CP_regex && CP_regex.groups) {
        console.log("found the cp version", CP_regex.groups['cp_version'],'built on date', CP_regex.groups['build_date'])
    }
}



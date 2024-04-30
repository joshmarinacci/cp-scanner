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

let board_id = null
for(let line of boot_info) {
    console.log("boot line: ", line)
    let res = line.match(/^Board ID:(?<board_id>.*)/)
    if(res && res.groups) {
        console.log("found the board", res.groups['board_id'])
        board_id = res.groups['board_id']
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



let libs = await fs.promises.readdir(path.join(cp_drive,'lib'))
// console.log("libs",libs)
for(let lib_name of libs) {
    // console.log("parsing",lib_name)
    let lib_path =path.join(cp_drive,'lib',lib_name)
    let stats = await fs.promises.stat(lib_path)
    if(stats.isFile()) {
        console.log("library ",lib_name);
        let lib_raw = await fs.promises.readFile(lib_path)
        let mpy_version = String.fromCodePoint(lib_raw[0]);
        let sub_version = lib_raw[1]
        // console.log(`mpy_version ${mpy_version} . ${sub_version}`)
        if(mpy_version === 'C' && sub_version === 6) {
            // console.log("two byte mpy version 6")
            let compatibility = ["9.0.0-alpha.1","none"]
            let lib_str = lib_raw.toString("utf-8")
            let match = lib_str.match(/(?<lib_version>[\d]+\.[\d]+\.[\d]+)\x00/)
            if(match && match.groups) {
                console.log("library version number is", match.groups['lib_version']);
            }
        }
        // console.log("first bytes are",String.fromCodePoint(lib_raw[0]), lib_raw[1])
    }
}


const release_url = 'https://github.com/adafruit/circuitpython/releases/latest'
console.log("looking for the latest release")
let resp = await fetch(release_url)
let latest_cp_release = resp.url.split("/").at(-1)
console.log("the response is",latest_cp_release)

console.log(`a new version of CP for your board can be found at https://circuitpython.org/board/${board_id}`)

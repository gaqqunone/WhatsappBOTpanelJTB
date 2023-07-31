require('../cpsetting/cpsettings')
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const os = require('os');
const chalk = require("chalk");
const crypto = require("crypto");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const moment = require("moment-timezone");
const fetch = require("node-fetch");
const Jimp = require("jimp");
const util = require("util");
const { sizeFormatter} = require("human-readable")
const format = sizeFormatter()
const { tiktokdl } = require('./lib/tiktok')
const { color, bgcolor, mycolor } = require('./lib/color')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, formatp, tanggal, formatDate, getTime, isUrl, sleep, clockString, runtime, fetchJson, getBuffer, jsonformat, parseMention, getRandom } = require('./lib/functions')
const addusrp = JSON.parse(fs.readFileSync('./js/database/user.json'))

module.exports = pan = async (pan, m, chatUpdate, store) => {
try {
const body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
const budy = (typeof m.text == 'string' ? m.text : '')
const prefix = /^[°#*+,.?=''():√%!¢£¥€π¤ΠΦ_&`™©®Δ^βα¦|/\\©^]/.test(body) ? body.match(/^[°#*+,.?=''():√%¢£¥€π¤ΠΦ_&!`™©®Δ^βα¦|/\\©^]/gi) : '.'
const chath = (m.mtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.mtype == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (m.mtype == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (m.mtype == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == "listResponseMessage") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == "messageContextInfo") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : ''
const content = JSON.stringify(m.message)
const { type, quotedMsg, mentioned, now, fromMe } = m
const isCmd = body.startsWith(prefix)
const from = m.key.remoteJid
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const pushname = m.pushName || "No Name"
const botNumber = await pan.decodeJid(pan.user.id)
const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const itsMe = m.sender == botNumber ? true : false
const text = q = args.join(" ")
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const isMedia = /image|video|sticker|audio/.test(mime)
const { chats } = m

const tanggal = moment.tz('Asia/Jakarta').format('DD/MM/YY')

const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid
const groupMetadata = m.isGroup ? await pan.groupMetadata(m.chat).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const groupAdmins = m.isGroup ? await participants.filter(v => v.admin !== null).map(v => v.id) : ''
const groupOwner = m.isGroup ? groupMetadata.owner : ''
const groupMembers = m.isGroup ? groupMetadata.participants : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false


if (!pan.public) {
if (!m.key.fromMe) return
}

if (isCmd && m.isGroup) { console.log(chalk.bold.rgb(255, 178, 102)('\x1b[1;31m~\x1b[1;37m> [\x1b[1;32mCMD\x1b[1;37m]'), chalk.bold.rgb(153, 255, 153)(command), chalk.bold.rgb(204, 204, 0)("from"), chalk.bold.rgb(153, 255, 204)(pushname), chalk.bold.rgb(204, 204, 0)("in"), chalk.bold.rgb(255, 178, 102)("Group Chat"), chalk.bold('[' + args.length + ']')); }
if (isCmd && !m.isGroup) { console.log(chalk.bold.rgb(255, 178, 102)('\x1b[1;31m~\x1b[1;37m> [\x1b[1;32mCMD\x1b[1;37m]'), chalk.bold.rgb(153, 255, 153)(command), chalk.bold.rgb(204, 204, 0)("from"), chalk.bold.rgb(153, 255, 204)(pushname), chalk.bold.rgb(204, 204, 0)("in"), chalk.bold.rgb(255, 178, 102)("Private Chat"), chalk.bold('[' + args.length + ']')); }
		
try {
ppuser = await pan.profilePictureUrl(m.sender, 'image')
} catch (err) {
ppuser = 'https://th.bing.com/th/id/OIG.CO2sHWK_IEYIwzXsC2hX'
}
ppnyauser = await getBuffer(ppuser)

const generateProfilePicture = async(buffer) => {
const jimp_1 = await Jimp.read(buffer);
const resz = jimp_1.getWidth() > jimp_1.getHeight() ? jimp_1.resize(550, Jimp.AUTO) : jimp_1.resize(Jimp.AUTO, 650)
const jimp_2 = await Jimp.read(await resz.getBufferAsync(Jimp.MIME_JPEG));
return {
img: await resz.getBufferAsync(Jimp.MIME_JPEG)
}
}

const createSerial = (size) => {
return crypto.randomBytes(size).toString('hex').slice(0, size)
}

function randomNomor(min, max = null) {
if (max !== null) {
min = Math.ceil(min);
max = Math.floor(max);
return Math.floor(Math.random() * (max - min + 1)) + min;
} else {
return Math.floor(Math.random() * min) + 1
}
}
function monospace(string) {
return '```' + string + '```'
}

const pickRandom = (arr) => {
return arr[Math.floor(Math.random() * arr.length)]
}

const sendBug = async (target) => {
pan.sendMessage(target, {
text: '', 
templateButtons: [
{ callButton: { displayText: `Number Phone Owner`, phoneNumber: `62857085011429`}},
{ urlButton: { displayText: `OWNER`, url: `https://github.com/Pann09`}},
{ urlButton: { displayText: `ID GORUP`, url: `https://www.whatsapp.com/otp/copy/${from}`}},
{ callButton: { displayText: `Number Phone Owner`, phoneNumber: `62857085011429`}},
{ urlButton: { displayText: `OWNER`, url: `https://github.com/Pann09`}},
{ urlButton: { displayText: `ID GORUP`, url: `https://www.whatsapp.com/otp/copy/${from}`}},
{ callButton: { displayText: `Number Phone Owner`, phoneNumber: `62857085011429`}},
{ urlButton: { displayText: `OWNER`, url: `https://github.com/Pann09`}},
{ urlButton: { displayText: `ID GORUP`, url: `https://www.whatsapp.com/otp/copy/${from}`}},
{ quickReplyButton: { displayText: `ʀᴜʟᴇs`, id: `${prefix}rules`}},
{ quickReplyButton: { displayText: `ɪɴғᴏ ʙᴏᴛᴢ`, id: `${prefix}x`}},
{ quickReplyButton: { displayText: `sᴇᴡᴀ ʙᴏᴛᴢ`, id: `${prefix}sewa`}}]}
)
}

global.addUserPanel = (email, username, expired, _db) => {
var obj_add = {
email: email,
username: username,
expired: expired
}
_db.push(obj_add)
fs.writeFileSync('./js/database/user.json', JSON.stringify(_db, null, 3))
}

switch (command) {
// Pterodactyl Menu
case "listusr": {
if (!isCreator) return m.reply(`Owner Only Broo..`)
let page = args[0] ? args[0] : '1'
let f = await fetch(domain + "/api/application/users?page=" + page, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res = await f.json();
let users = res.data
let sections = []
for (let user of users) {
let u = user.attributes
let obj = {
title: "CPanCloud Ptero",
rows: [
{ title: `${u.id}. ${u.username}`, rowId: `${prefix}detusr ` + u.id, description: u.first_name + ' ' + u.last_name },
]
}
await sections.push(obj)
if (sections.length === 50) {
sections.push({
title: "CPanCloud Ptero",
rows: [
{ title: `⏩ NEXT`, rowId: `${prefix}listusr 2`, description: 'Page 2' },
{ title: `⏩ NEXT`, rowId: `${prefix}listusr 3`, description: 'Page 3' },
{ title: `⏩ NEXT`, rowId: `${prefix}listusr 4`, description: 'Page 4' },
{ title: `⏩ NEXT`, rowId: `${prefix}listusr 5`, description: 'Page 5' },
]
})
}
}
await pan.sendMessage(m.chat, {
text: "User List CPanCloud",
footer: `Page: ${res.meta.pagination.current_page}/${res.meta.pagination.total_pages}`,
title: "CPanCloud Ptero",
buttonText: `${res.meta.pagination.count} Users`,
sections
},{ quoted : m })
}
break
case "addusr": {

if (!isCreator) return m.reply(`Perintah ini hanya untuk PEMILIK`)
let t = text.split(',');
if (t.length < 3) return m.reply(`*mohon diperjelas lagi!*

Penggunaan:
${prefix + command} email ,username ,name ,lastname ,number/tag`);
let email = t[0];
let username = t[1];
let name = t[2];
let lastname = t[3];
let u = m.quoted ? m.quoted.sender : t[4] ? t[4].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.mentionedJid[0];
if (!u) return m.reply(`*mohon perjelas!*

Penggunaan:
${prefix + command} email ,username ,name ,lastname ,number/tag`);
let d = (await pan.onWhatsApp(u.split`@`[0]))[0] || {}
let password = d.exists ? crypto.randomBytes(5).toString('hex') : t[3]
let f = await fetch(domain + "/api/application/users", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
},
"body": JSON.stringify({
"email": email,
"username": username,
"first_name": name,
"last_name": lastname,
"language": "en",
"password": password.toString()
})
})
let data = await f.json();
if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
let user = data.attributes
let p = await pan.sendMessage(m.chat, { text: `
*SUCCESSFULLY ADD USER*

TYPE: user

ID: ${user.id}
UUID: ${user.uuid}
USERNAME: ${user.username}
EMAIL: ${user.email}
NAME: ${user.first_name} ${user.last_name}
LANGUAGE: ${user.language}
ADMIN: ${user.root_admin}
CREATED AT: ${user.created_at}

🖥️LOGIN: ${domain}

*Password telah dikirim di private chat @${u.split`@`[0]}*`, mentions:[u],
})
pan.sendMessage(u, { text: `*===[ Akun Pterodactyl Anda ]===*\n
LEVEL: user/member
ID: ${user.id}
EMAIL: ${user.email}
USERNAME: ${user.username}
PASSWORD: ${password.toString()}
Panel Ptero: ${domain}
==================================

        *☢️Announcement☢️*
Reff Only Down
==================================`,
})
}
break
case "delusr": {

if (!isCreator) return m.reply(`Owner Only Broo..`)
let usr = args[0]
if (!usr) return m.reply('ID nya mana?')
let f = await fetch(domain + "/api/application/users/" + usr, {
"method": "DELETE",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res = f.ok ? {
errors: null
} : await f.json()
if (res.errors) return m.reply('*USER NOT FOUND*')
m.reply('*SUCCESSFULLY DELETE THE USER*')
}
break
case "detusr": {
if (!isCreator) return m.reply(`Owner Only Broo..`)
let usr = args[0]
let f = await fetch(domain + "/api/application/users/" + usr, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res = await f.json()
if (res.errors) return m.reply('*USER NOT FOUND*')
let u = res.attributes
m.reply(`*${u.username.toUpperCase()} USER DETAILS*

\`\`\`ID: ${u.id}
UUID: ${u.uuid}
USERNAME: ${u.username}
EMAIL: ${u.email}
NAME: ${u.first_name} ${u.last_name}
LANGUAGE: ${u.language}
ADMIN: ${u.root_admin}
CREATED AT: ${u.created_at}\`\`\``)
}
break

case "addsrvpmmp": {

if (!isCreator) return m.reply(`Perintah ini hanya untuk PEMILIK`)
let s = text.split(',');
if (s.length < 7) return m.reply(`*Format Yang Benar*

PocketMine Only, Info: {
Location: 5
EggID: 21
}
Penggunaan:
${prefix + command} name ,desc ,userId ,21 ,5 ,memory/disk ,cpu`)
let name = s[0];
let desc = s[1] || ''
let usr_id = s[2];
let egg = s[3];
let loc = s[4];
let memo_disk = s[5].split`/`;
let cpu = s[6];

let f1 = await fetch(domain + "/api/application/nests/5/eggs/" + egg, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let data = await f1.json();
let startup_cmd = "./bin/php7/bin/php ./PocketMine-MP.phar --no-wizard --disable-ansi"

let f = await fetch(domain + "/api/application/servers", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey,
},
"body": JSON.stringify({
"name": name,
"description": desc,
"user": usr_id,
"egg": parseInt(egg),
"docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
"startup": startup_cmd,
"environment": {

"VERSION": "PM4"
},
"limits": {
"memory": memo_disk[0],
"swap": 0,
"disk": memo_disk[1],
"io": 500,
"cpu": cpu
},
"feature_limits": {
"databases": 0,
"backups": 5,
"allocations": 0
},
deploy: {
locations: [parseInt(loc)],
dedicated_ip: false,
port_range: ["19100-19200"],
},
})
})
let res = await f.json()
if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
let server = res.attributes
m.reply(`*Berhasil Menambahkan Server*

SOFTWARE: PHP-PocketMine
TYPE: ${res.object}

ID: ${server.id}
UUID: ${server.uuid}
NAME: ${server.name}
DESCRIPTION: ${server.description}
MEMORY: ${server.limits.memory === 0 ? 'Unlimited' : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? 'Unlimited' : server.limits.disk} MB
CPU: ${server.limits.cpu}%
CREATED AT: ${server.created_at}`)
}
break
case "addsrvpaper": {

if (!isCreator) return m.reply(`Owner Only Broo..`)
let s = text.split(',');
if (s.length < 7) return m.reply(`*Format Yang Benar*

Paper Only, Info: {
Location: 5
EggID: 5
}
Penggunaan:
${prefix + command} name ,desc ,userId ,5 ,5 ,memory/disk ,cpu`)
let name = s[0];
let desc = s[1] || ''
let usr_id = s[2];
let egg = s[3];
let loc = s[4];
let memo_disk = s[5].split`/`;
let cpu = s[6];

let f1 = await fetch(domain + "/api/application/nests/5/eggs/" + egg, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let data = await f1.json();
let startup_cmd = "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}"

let f = await fetch(domain + "/api/application/servers", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey,
},
"body": JSON.stringify({
"name": name,
"description": desc,
"user": usr_id,
"egg": parseInt(egg),
"docker_image": "ghcr.io/pterodactyl/yolks:java_17",
"startup": startup_cmd,
"environment": {

"SERVER_JARFILE": "server.jar",
"BUILD_NUMBER": "latest",
"MINECRAFT_VERSION": "latest"
},
"limits": {
"memory": memo_disk[0],
"swap": 0,
"disk": memo_disk[1],
"io": 500,
"cpu": cpu
},
"feature_limits": {
"databases": 0,
"backups": 5,
"allocations": 0
},
deploy: {
locations: [parseInt(loc)],
dedicated_ip: false,
port_range: ["25560-25570"],
},
})
})
let res = await f.json()
if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
let server = res.attributes
m.reply(`*Berhasil Menambahkan Server*

SOFTWARE: Java-Paper
TYPE: ${res.object}

ID: ${server.id}
UUID: ${server.uuid}
NAME: ${server.name}
DESCRIPTION: ${server.description}
MEMORY: ${server.limits.memory === 0 ? 'Unlimited' : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? 'Unlimited' : server.limits.disk} MB
CPU: ${server.limits.cpu}%
CREATED AT: ${server.created_at}`)
}
break
case "delsrv": {

if (!isCreator) return m.reply(`Maaf Command Tersebut Khusus Developer Bot WhatsApp`)
let srv = args[0]
if (!srv) return m.reply('ID nya mana?')
let f = await fetch(domain + "/api/application/servers/" + srv, {
"method": "DELETE",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey,
}
})
let res = f.ok ? {
errors: null
} : await f.json()
if (res.errors) return m.reply('*Server Tidak Ada*')
m.reply('*Berhasil menghapus server*')
}
break
case "detsrv": {

let srv = args[0]
let f = await fetch(domain + "/api/application/servers/" + srv, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res = await f.json();
if (res.errors) return m.reply('*Server Tidak Ada*')
let s = res.attributes
let f2 = await fetch(domain + "/api/client/servers/" + s.uuid.split`-`[0] + "/resources", {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + capikey
}
})
let data = await f2.json();
let t = data.attributes
m.reply(`*${s.name.toUpperCase()} SERVER DETAILS*

STATUS: ${t.current_state}

ID: ${s.id}
UUID: ${s.uuid}
NAME: ${s.name}
DESCRIPTION: ${s.description}
MEMORY: ${await (format(t.resources.memory_bytes)).toString()} / ${s.limits.memory === 0 ? 'Unlimited' : s.limits.memory + 'MB'}
DISK: ${await (format(t.resources.disk_bytes)).toString()} / ${s.limits.disk === 0 ? 'Unlimited' : s.limits.disk + 'MB'}
CPU: ${t.resources.cpu_absolute}% / ${s.limits.cpu === 0 ? 'Unlimited' : s.limits.cpu + '%'}
CREATED AT: ${s.created_at}`)
}
break
//case "sendmessage"
//	let d = (await pan.onWhatsApp(u.split`@`[0]))[0] || {}
//    m.reply('Fitur Sedang Maintenance
//            ')
//break
case "setppbot": {
if (!isCreator) return 
if (!quoted) return m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
if (!/image/.test(mime)) return m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
if (/webp/.test(mime)) return m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
var medis = await pan.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
if (args[0] == `/full`) {
var { img } = await generateProfilePicture(medis)
await pan.query({
tag: 'iq',
attrs: {
to: botNumber,
type:'set',
xmlns: 'w:profile:picture'
},
content: [
{
tag: 'picture',
attrs: { type: 'image' },
content: img
}
]
})
fs.unlinkSync(medis)
m.reply(`Sukses`)
} else {
var memeg = await pan.updateProfilePicture(botNumber, { url: medis })
fs.unlinkSync(medis)
m.reply(`Sukses`)
}
}
break

//End Pterodactyl Menu
        
case "menu" : {
m.reply(`   *Menu*
Menu yang tersedia secara *UMUM*
➤ hargacuci
➤ hargafreon
➤ hargabongpas
➤ hargamaterial
➤ hargawh
➤ Help
==========Info==========
➤ UpTime Bot:
*${runtime(process.uptime())}*
========================`
)}
break        
case "help" : {
m.reply(`   *Menu Bantuan*
==============================
Perlu bantuan ? silakan menghubungi 085604856093
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break

case "hargacuci" : {
m.reply(`   *Daftar harga Cuci*
==============================
Cuci AC rumah daerah Surabaya ½-1pk 65.000
1½-2pk 75.000

*Cuci AC meliputi indoor & Outdoor

Untuk apartemen +10.000

Pengerjaan Minggu / hari libur +5000
Pengerjaan diluar Surabaya +10.000

(Harga diatas tidak termasuk biaya parkir Kantor/Ruko/Apartemen)
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break        

case "hargafreon" : {
m.reply(`   *Harga Freon*
==============================
✓ Type freon R22 , AC ½-1pk Penambahan 220rb- isi full 275rb

✓ Type freon R32 & R410, AC ½-1pk Penambahan 275rb- Isi Full 330rb

✓ Type freon R22 , AC 1½-2pk Penambahan 330rb - Isi Full 385rb

✓ Type freon R32 & R410, AC 1½-2pk Penambahan 385rb- Isi Full 440rb

Penambahan freon / pengisian freon full bergaransi 1bulan.
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break          
        
case "hargabongpas" : {
m.reply(`   *Harga Bongkar Pasang*
==============================
💙Bongkar AC split ½-1pk 165.000
                                   1½-2pk 220.000

💙Pasang AC split ½-1pk 305.000
                                 1½-2pk 405.000

Harga pasang AC, Sudah termasuk biaya Vakum AC. 
Free jasa pemasangan instalasi pipa dan kabel 3meter. Selanjutnya dikenakan biaya 10.000/meter untuk instalasi Pemasangan.

Nb: harga bongkar dan pasang hanya untuk dinding tembok. Untuk dinding Gypsum harus dilakukan survey lokasi terlebih dahulu.
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break 
        
case "hargamaterial" : {
m.reply(`   *Harga material untuk pasang AC ½-1pk*
==============================
1. Pangkon/Breket outdoor 80.000/pasang
2. Pipa Tembaga merk Tetayama ukr 1/4-3/8 90.000/meter
3. Kabel ukr 2*1 1/2 17.500/meter
4. Kabel ukr 3*1 1/2 23.000/meter
5. Ducktape biasa 12.000/Roll
6. Ducktape lem 16.000/Roll
7. Pipa spiral/pipa pembuangan 17.500/meter
8. Clam pipa PVC 5500/pcs
9. Insuflek ukuran 1/4-3/8  90.000/Lonjor
10. L bow (knie) 5500/pcs
11. Pipa PVC 75.000/lonjor
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break                  
        
case "hargawh" : {
m.reply(`   *Price List Pemasangan / Bongkar Water Heater*
==============================
* Bongkar & Pasang Water Heater listrik 275.000
* Bongkar & Pasang Water Heater Gas 220.000
* Bongkar & Pasang Water Heater Diatas Genteng 660.000

*Bongkar Water Heater Listrik 110.000
*Bongkar Water Heater Gas 88.000
*Bongkar Diatas genteng 220.000

*Pasang Water Heater Listrik 193.000
*Pasang Water Heater Gas 155.000
*Pasang Diatas genteng 506.000
==============================
UpTime Bot:
*${runtime(process.uptime())}*
==============================`
)}
break           
        
// Antilink
if (db.data.chats[m.chat].antilink) {
  if (budy.match(`chat.whatsapp.com`)) {
     m.reply(`「 *ANTI LINK* 」\n\n*Kamu terdeteksi mengirim link group*, *maaf kamu akan di kick‼️,yang mau juga silahkan kirim link‼️*`)
     if (!isBotAdmins) return m.reply(mess.botAdmin)
     let gclink = (`https://chat.whatsapp.com/`+await rex.groupInviteCode(m.chat))
     let isLinkThisGc = new RegExp(gclink, 'i')
     let isgclink = isLinkThisGc.test(m.text)
     if (isgclink) return m.reply(`*Maaf Kamu Tidak Akan Dikick!. Kamu Mengirim Link Group Ini!*`)
     if (isAdmins) return m.reply(`*Maaf Kamu Tidak Akan Dikick!. Karena Kamu Admin!*`)
     if (isCreator) return m.reply(`*Maaf Kamu Owner Bot Ku!*`)
     pan.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  }
}


// Sticker
case 'toimage': case 'toimg': {
  if (!quoted) throw 'Reply Image'
  if (!/webp/.test(mime)) throw `Balas sticker dengan caption *${prefix + command}*`
  m.reply(mess.wait)
  let media = await pan.downloadAndSaveMediaMessage(quoted)
  let ran = await getRandom('.png')
  exec(`ffmpeg -i ${media} ${ran}`, (err) => {
     fs.unlinkSync(media)
     if (err) throw err
     let buffer = fs.readFileSync(ran)
     pan.sendMessage(m.chat, { image: buffer }, { quoted: m })
     fs.unlinkSync(ran)
  })
}
break
        
case 'sticker': case 's': case 'stickergif': case 'sgif': case 'stiker': {
  if (!quoted) throw `*Balas Video/Image Dengan Caption* ${prefix + command}`
  m.reply('mess.wait')
  if (/image/.test(mime)) {
     let media = await quoted.download()
     let encmedia = await pan.sendImageAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
     await fs.unlinkSync(encmedia)
  } else if (/video/.test(mime)) {
     if ((quoted.msg || quoted).seconds > 11) return m.reply('*Maksimal 10 detik!*')
     let media = await quoted.download()
     let encmedia = await pan.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
     await fs.unlinkSync(encmedia)
  } else {
     throw `*Kirim Gambar/Video Dengan Caption* ${prefix + command}\nDurasi *Video 1-9 Detik*`
  }
}
break
        
// -- [ Group Menu ] --- //

        case "menukhusus" : {
m.reply(`   *Menu Khusus*
Menu yang tersedia secara *KHUSUS*
➤ linkgroup / linkgc
➤ tagall
➤ hidetag
➤ setdesc / setdesk / setdescription
➤ setnamegc / setsubject
➤ sticker / stickergif / stiker
==========Info==========
➤ UpTime Bot:
*${runtime(process.uptime())}*
========================`
)}
break      
        
case 'setnamegc': case 'setsubject': {
  if (!m.isGroup) throw mess.group
  if (!isBotAdmins) throw mess.botAdmin
  if (!isAdmins) throw mess.admin
  if (!text) throw 'Text ?'
  await pan.groupUpdateSubject(m.chat, text).then((res) => m.reply(mess.done)).catch((err) => m.reply(jsonformat(err)))
}
break
case 'setdesc': case 'setdesk': case 'setdescription': {
  if (!m.isGroup) throw mess.group
  if (!isBotAdmins) throw mess.botAdmin
  if (!isAdmins) throw mess.admin
  if (!text) throw 'Text ?'
  await pan.groupUpdateDescription(m.chat, text).then((res) => m.reply(mess.done)).catch((err) => m.reply(jsonformat(err)))
}
break
case 'tagall': {
  if (!m.isGroup) throw mess.group
  if (!isBotAdmins) throw mess.botAdmin
  if (!isAdmins) throw mess.admin
let teks = `══✪〘 *Tag All* 〙✪══
 
 ➲ *Pesan : ${q ? q : 'kosong'}*\n\n`
  for (let mem of participants) {
     teks += `⭔ @${mem.id.split('@')[0]}\n`
  }
  pan.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) }, { quoted: m })
}
break
case 'hidetag': {
  if (!m.isGroup) throw mess.group
  if (!isBotAdmins) throw mess.botAdmin
  if (!isAdmins) throw mess.admin
  pan.sendMessage(m.chat, { text : q ? q : '' , mentions: participants.map(a => a.id)}, { quoted: m })
}
break
case 'linkgroup': case 'linkgc': {
  if (!m.isGroup) throw mess.group
  if (!isBotAdmins) throw mess.botAdmin
  let response = await pan.groupInviteCode(m.chat)
  pan.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\n👾Link Group : ${groupMetadata.subject}`, m, { detectLink: true })
}
break
//End Group
        
default:
}
if (budy.startsWith('>')) {
if (!isCreator) return m.reply(`Perintah ini hanya untuk PEMILIK`)
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
m.reply(String(err))
}
}
} catch (err) {
m.reply(util.format(err))
}
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.yellowBright(`Update File Terbaru ${__filename}`))
delete require.cache[file]
require(file)
})

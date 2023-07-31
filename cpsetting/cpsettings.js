const fs = require('fs')
const chalk = require('chalk')

global.domain = "https://srv.hamzz.com/" // Isi Domain mu, WEBSITE WAJIB ADA SSL
global.apikey = 'ptlc_lZ0XehpbrC2rRinV7t1rU6qwTaeuSSi2XpCtKDH1jYV' // Isi Apikey Pterodactyl mu
global.capikey = 'ptlc_lZ0XehpbrC2rRinV7t1rU6qwTaeuSSi2XpCtKDH1jYV' // Isi Apikey Pterodactyl mu
global.creAtor = "62857085011429@s.whatsapp.net"
global.owner = ['62857085011429']
global.ownerNumber = ["62857085011429@s.whatsapp.net"]
global.nomerOwner = "62857085011429"
global.namabotnya = 'Mijayanto'
global.namaownernya = 'Madyaa'
global.packname = 'Madyaa'
global.author = 'www.google.com'
global.sessionName = 'session'
global.email = 'admin@google.com' // Ganti dengan emailmu
global.group = 'https://chat.whatsapp.com/'
global.youtube = 'https://youtube.com/'
global.website = 'https://www.google.com'
global.github = 'https://github.com/Pann09'
global.nomorowner = 'https://wa.me/62857085011429'
global.region = 'Indonesia'
global.prefa = ['','!','.','#','-','•']
global.krmd = 
{
success: '```Sukses!```',
admin: '```Fitur Khusus Admin Group!!!```',
botAdmin: '```Bot Harus Menjadi Admin Terlebih Dahulu!!!```',
owner: '```Owner Only Broo...```',
group: '```Fitur Digunakan Hanya Untuk Group!!!```',
private: '```Fitur Digunakan Hanya Untuk Private Chat!!!```',
bot: '```Fitur Khusus Pengguna Nomor Bot!!!```',
error: '```Error Kak, Hubungi owner 62857085011429```',
wait: '```Waittt...```'
}

global.thumb = fs.readFileSync('./js/image/thumb.jpg')
global.imagekir = fs.readFileSync('./js/image/image.jpg')
global.videokir = fs.readFileSync('./js/image/video.mp4')

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.yellowBright(`Update File Terbaru ${__filename}`))
delete require.cache[file]
require(file)
})
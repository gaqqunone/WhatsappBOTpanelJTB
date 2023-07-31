require('./cpsettings')
const { default: panConnect, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require('@adiwajshing/baileys')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const figlet = require('figlet')
const FileType = require('file-type')
const path = require('path')
const PhoneNumber = require('awesome-phonenumber')

// ==> [ Lib ] 
const { color, bgcolor, mycolor } = require('../js/lib/color')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../js/lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('../js/lib/functions')
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

//startpan
const startpan = async() => {

	global.db = JSON.parse(fs.readFileSync('./js/database/database.json'))
	global.db.data = {
	users: {},
	chats: {},
	sticker: {},
	database: {},
	game: {},
	settings: {},
	others: {},
	...(global.db.data || {})
	}
	
	function title() {
	  console.clear()
	  console.log(chalk.bold.green(figlet.textSync('PteroCtrlBot', {
		font:'Standard',
		horizontalLayout: 'default',
		width: 80,
		whitespaceBreak: false
	  })))
	
		console.log(chalk.yellow(`\n${chalk.magentaBright('Desc')} : ${chalk.greenBright('Bot WhatsApp Multi Device with Pterodactyl Remote')}\n${chalk.magentaBright('Creator')} : ${chalk.cyanBright('+62 812-3482-4414 (WhatsApp)')}\n${chalk.cyanBright('https://google.com')}`))
	}
	
	const { state, saveCreds } = await useMultiFileAuthState(`./session`)
	const { version, isLatest } = await fetchLatestBaileysVersion()
	
	function nocache(module, cb = () => { }) {
	  fs.watchFile(require.resolve(module), async () => {
		 await uncache(require.resolve(module))
		  cb(module)
	  })
	}
	
	function uncache(module = '.') {
	  return new Promise((resolve, reject) => {
		 try {
		   delete require.cache[require.resolve(module)]
		   resolve()
		 } catch (e) {
		   reject(e)
		 }
	  })
	}
	
	const pan = panConnect({
	version: [2, 2323, 4],
	logger: pino({ level: 'silent' }),
	printQRInTerminal: true,
	/* patchMessageBeforeSending: (message) => {
	   const requiresPatch = !!(
		  message.buttonMessage ||
		  message.templateMessage ||
		  message.listMessage
	   );
	   if (requiresPatch) {
		  message = {
			 viewOnceMessage: {
				message: {
				   messageContextInfo: {
					  deviceListMetadataVersion: 2,
					  deviceListMetadata: []
				   },
			   ...message,
			   },
			 },
		  };
	   }
	   return message;
	}, */
	browser: ['Pterodactyl Panel Control','Opera','1.0.0'],
	auth: state
	})
	title()

store.bind(pan.ev)

pan.ev.on('messages.upsert', async chatUpdate => {
	//console.log(JSON.stringify(chatUpdate, undefined, 2))
	try {
	m = chatUpdate.messages[0]
	if (!m.message) return
	m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
	if (m.key && m.key.remoteJid === 'status@broadcast') return
	if (!pan.public && !m.key.fromMe && chatUpdate.type === 'notify') return
	if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
	if (m.key.id.startsWith('Pebri')) return
	m = smsg(pan, m, store)
	require("../js/bot")(pan, m, chatUpdate, store)
	} catch (err) {
		console.log(err)
	}
})
	  
// Setting
pan.decodeJid = (jid) => {
	if (!jid) return jid
	if (/:\d+@/gi.test(jid)) {
		let decode = jidDecode(jid) || {}
		return decode.user && decode.server && decode.user + '@' + decode.server || jid
	} else return jid
}

pan.ev.on('contacts.update', update => {
	for (let contact of update) {
		let id = pan.decodeJid(contact.id)
		if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
	}
})

pan.getName = (jid, withoutContact  = false) => {
	id = pan.decodeJid(jid)
	withoutContact = pan.withoutContact || withoutContact 
	let v
	if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
		v = store.contacts[id] || {}
		if (!(v.name || v.subject)) v = pan.groupMetadata(id) || {}
		resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
	})
	else v = id === '0@s.whatsapp.net' ? {
		id,
		name: 'WhatsApp'
	} : id === pan.decodeJid(pan.user.id) ?
		pan.user :
		(store.contacts[id] || {})
		return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

pan.sendContact = async (jid, kon, quoted = '', opts = {}) => {
let list = []
for (let i of kon) {
	list.push({
		displayName: await pan.getName(i + '@s.whatsapp.net'),
		vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await pan.getName(i + '@s.whatsapp.net')}\nFN:${await pan.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:okeae2410@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/cak_haho\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	})
}
pan.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
}

pan.public = true

pan.serializeM = (m) => smsg(pan, m, store)

pan.ev.on('connection.update', async (update) => {
	const { connection, lastDisconnect } = update	    
	if (connection === 'close') {
	let reason = new Boom(lastDisconnect?.error)?.output.statusCode
		if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); pan.logout(); }
		else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting"); startpan(); }
		else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting"); startpan(); }
		else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); pan.logout(); }
		else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); pan.logout(); }
		else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting"); startpan(); }
		else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting"); startpan(); }
		else if (reason === DisconnectReason.Multidevicemismatch) { console.log("Multi device mismatch, please scan again"); pan.logout(); }
		else pan.end(`Unknown DisconnectReason: ${reason}|${connection}`)
	}
	else if(connection === 'open') {pan.sendMessage("6282122300435@s.whatsapp.net", {text:`Bot Telah Online`})}
	console.log('Connected', update)
})

pan.ev.on('creds.update', saveCreds)

// Add Other
  
  /** Resize Image
  *
  * @param {Buffer} Buffer (Only Image)
  * @param {Numeric} Width
  * @param {Numeric} Height
  */

  pan.reSize = async (image, width, height) => {
   let jimp = require('jimp')
   var oyy = await jimp.read(image);
   var kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
   return kiyomasa
  }
  // Siapa yang cita-citanya pakai resize buat keliatan thumbnailnya
  
pan.ev.on('group-participants.update', async (m) => {
	console.log(m)
	try {
		let metadata = await pan.groupMetadata(m.id)
		let participants = m.participants
		for (let num of participants) {
			// Get Profile Picture User
			try {
				ppuser = await pan.profilePictureUrl(num, 'image')
			} catch {
				ppuser = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgaD3jz86K2EXpjOibx1lXDlqn9vagioTYs4Sa644lA9wd9sKhTEZVDO4hN9HzBUamI5h6LTRiPwZGYi9zFbZnCcLgMCdvS6cQH7A7iI4qGm-zHlBXbZ52rneNErGqM3iZ0PdlcR2JciGPvWdNxBfptUzkBuFaQMzKlkV1SvEBtT01AJPW3c0VpA_ky0w/s555/14.jpg'
			}

			// Get Profile Picture Group
			try {
				ppgroup = await pan.profilePictureUrl(m.id, 'image')
			} catch {
				ppgroup = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgaD3jz86K2EXpjOibx1lXDlqn9vagioTYs4Sa644lA9wd9sKhTEZVDO4hN9HzBUamI5h6LTRiPwZGYi9zFbZnCcLgMCdvS6cQH7A7iI4qGm-zHlBXbZ52rneNErGqM3iZ0PdlcR2JciGPvWdNxBfptUzkBuFaQMzKlkV1SvEBtT01AJPW3c0VpA_ky0w/s555/14.jpg'
			}
		   if (m.action == 'add') {
			 let a = `*Hai @${num.split("@")[0]}, Selamat datang di ${metadata.subject}*, Kami sangat senang memiliki Anda bergabung di sini. Semoga Anda merasa nyaman dan mendapatkan pengalaman yang menyenangkan dalam berinteraksi dengan semua anggota grup. \n Kami berharap Anda dapat berbagi pengetahuan, pengalaman, dan ide-ide inspiratif dengan kami semua. Jangan ragu untuk bertanya, berdiskusi, dan berkontribusi. Mari kita menjaga suasana grup ini tetap ramah, positif, dan saling menghormati. Semoga Anda dapat menjalin banyak hubungan yang baik dan bermanfaat di sini. \n Selamat bergabung dan selamat berinteraksi!`
				pan.sendMessage(m.id, {
 text: a, 
  contextInfo: {
	 externalAdReply: {
	 title: `Madyaa BOT`,
	 body: `©HabibiXz`,
	 thumbnailUrl: ppuser,
	 sourceUrl: "",
	 mediaType: 1,
	 renderLargerThumbnail: true
}}})
			} else if (m.action == 'remove') {
				let a = `Terima kasih yang sebesar-besarnya kepada @${num.split("@")[0]}, yang telah berkontribusi dan berpartisipasi aktif dalam kelompok ini. Meskipun kami sangat disayangkan dengan keputusan Anda untuk keluar dari grup, kami masih sangat menghargai peran yang telah Anda isi selama Anda menjadi bagian dari kami.`
  pan.sendMessage(m.id, {
 text: a, 
  contextInfo: {
	 externalAdReply: {
	 title: `Madyaa BOT`,
	 body: `©HabibiXz`,
	 thumbnailUrl: ppuser,
	 sourceUrl: "",
	 mediaType: 1,
	 renderLargerThumbnail: true
}}})
			} else if (m.action == 'promote') {
				let a = `Congratulations @${num.split("@")[0]}, on being promoted to admin of this group ${metadata.subject} 🎉`
				pan.sendMessage(m.id, {
 text: a, 
  contextInfo: {
	 externalAdReply: {
	 title: `RYU BOT`,
	 body: `©HabibiXz`,
	 thumbnailUrl: ppuser,
	 sourceUrl: "",
	 mediaType: 1,
	 renderLargerThumbnail: true
}}})
			} else if (m.action == 'demote') {
				let a = `nice try for the demotion to become an ordinary member`
				pan.sendMessage(m.id, {
 text: a, 
  contextInfo: {
	 externalAdReply: {
	 title: `RYU BOT`,
	 body: `©HabibiXz`,
	 thumbnailUrl: ppuser,
	 sourceUrl: "",
	 mediaType: 1,
	 renderLargerThumbnail: true
}}})
		  }
		}
	} catch (err) {
		console.log("Eror Di Bagian Welcome Group "+err)
	}
})

  
  
  /**
  *
  * @param {*} jid
  * @param {*} url
  * @param {*} caption
  * @param {*} quoted
  * @param {*} options
  */
pan.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
  let mime = '';
  let res = await axios.head(url)
  mime = res.headers['content-type']
  if (mime.split("/")[1] === "gif") {
 return pan.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
  }
  let type = mime.split("/")[0]+"Message"
  if(mime === "application/pdf"){
 return pan.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
  }
  if(mime.split("/")[0] === "image"){
 return pan.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
  }
  if(mime.split("/")[0] === "video"){
 return pan.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
  }
  if(mime.split("/")[0] === "audio"){
 return pan.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
  }
  }

/** Send List Messaage
  *
  *@param {*} jid
  *@param {*} text
  *@param {*} footer
  *@param {*} title
  *@param {*} butText
  *@param [*] sections
  *@param {*} quoted
  */
	pan.sendListMsg = (jid, text = '', footer = '', title = '' , butText = '', sects = [], quoted) => {
	let sections = sects
	var listMes = {
	text: text,
	footer: footer,
	title: title,
	buttonText: butText,
	sections
	}
	pan.sendMessage(jid, listMes, { quoted: quoted })
	}

/** Send Button 5 Message
 * 
 * @param {*} jid
 * @param {*} text
 * @param {*} footer
 * @param {*} button
 * @returns 
 */
	pan.send5ButMsg = (jid, text = '' , footer = '', but = []) =>{
	let templateButtons = but
	var templateMessage = {
	text: text,
	footer: footer,
	templateButtons: templateButtons
	}
	pan.sendMessage(jid, templateMessage)
	}

/** Send Button 5 Image
 *
 * @param {*} jid
 * @param {*} text
 * @param {*} footer
 * @param {*} image
 * @param [*] button
 * @param {*} options
 * @returns
 */
pan.send5ButImg = async (jid , text = '' , footer = '', img, but = [], buff, options = {}) =>{
pan.sendMessage(jid, { image: img, caption: text, footer: footer, templateButtons: but, ...options })
}

  /** Send Button 5 Location
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} footer
   * @param {*} location
   * @param [*] button
   * @param {*} options
   */
  pan.send5ButLoc = async (jid , text = '' , footer = '', lok, but = [], options = {}) =>{
  let bb = await pan.reSize(lok, 300, 150)
  pan.sendMessage(jid, { location: { jpegThumbnail: bb }, caption: text, footer: footer, templateButtons: but, ...options })
  }

/** Send Button 5 Video
 *
 * @param {*} jid
 * @param {*} text
 * @param {*} footer
 * @param {*} Video
 * @param [*] button
 * @param {*} options
 * @returns
 */
pan.send5ButVid = async (jid , text = '' , footer = '', vid, but = [], buff, options = {}) =>{
let lol = await pan.reSize(buf, 300, 150)
pan.sendMessage(jid, { video: vid, jpegThumbnail: lol, caption: text, footer: footer, templateButtons: but, ...options })
}

/** Send Button 5 Gif
 *
 * @param {*} jid
 * @param {*} text
 * @param {*} footer
 * @param {*} Gif
 * @param [*] button
 * @param {*} options
 * @returns
 */
pan.send5ButGif = async (jid , text = '' , footer = '', gif, but = [], buff, options = {}) =>{
let ahh = await pan.reSize(buf, 300, 150)
let a = [1,2]
let b = a[Math.floor(Math.random() * a.length)]
pan.sendMessage(jid, { video: gif, gifPlayback: true, gifAttribution: b, caption: text, footer: footer, jpegThumbnail: ahh, templateButtons: but, ...options })
}

/**
 * 
 * @param {*} jid 
 * @param {*} buttons 
 * @param {*} caption 
 * @param {*} footer 
 * @param {*} quoted 
 * @param {*} options 
 */
pan.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
	let buttonMessage = {
		text,
		footer,
		buttons,
		headerType: 2,
		...options
	}
	pan.sendMessage(jid, buttonMessage, { quoted, ...options })
}

/**
 * 
 * @param {*} jid 
 * @param {*} text 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendText = (jid, text, quoted = '', options) => pan.sendMessage(jid, { text: text, ...options }, { quoted, ...options })

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} caption 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
	return await pan.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} caption 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
	return await pan.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
}

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} quoted 
 * @param {*} mime 
 * @param {*} options 
 * @returns 
 */
pan.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
	return await pan.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
}

/**
 * 
 * @param {*} jid 
 * @param {*} text 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendTextWithMentions = async (jid, text, quoted, options = {}) => pan.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
	let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
	let buffer
	if (options && (options.packname || options.author)) {
		buffer = await writeExifImg(buff, options)
	} else {
		buffer = await imageToWebp(buff)
	}

	await pan.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
	return buffer
}

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
	let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
	let buffer
	if (options && (options.packname || options.author)) {
		buffer = await writeExifVid(buff, options)
	} else {
		buffer = await videoToWebp(buff)
	}

	await pan.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
	return buffer
}

/**
 * 
 * @param {*} message 
 * @param {*} filename 
 * @param {*} attachExtension 
 * @returns 
 */
pan.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
	let quoted = message.msg ? message.msg : message
	let mime = (message.msg || message).mimetype || ''
	let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
	const stream = await downloadContentFromMessage(quoted, messageType)
	let buffer = Buffer.from([])
	for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
	}
let type = await FileType.fromBuffer(buffer)
	trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
	// save to file
	await fs.writeFileSync(trueFileName, buffer)
	return trueFileName
}

pan.downloadMediaMessage = async (message) => {
	let mime = (message.msg || message).mimetype || ''
	let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
	const stream = await downloadContentFromMessage(message, messageType)
	let buffer = Buffer.from([])
	for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
}
	
return buffer
 } 

/**
 * 
 * @param {*} jid 
 * @param {*} path 
 * @param {*} filename
 * @param {*} caption
 * @param {*} quoted 
 * @param {*} options 
 * @returns 
 */
pan.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
	let types = await pan.getFile(path, true)
	   let { mime, ext, res, data, filename } = types
	   if (res && res.status !== 200 || file.length <= 65536) {
		   try { throw { json: JSON.parse(file.toString()) } }
		   catch (e) { if (e.json) throw e.json }
	   }
   let type = '', mimetype = mime, pathFile = filename
   if (options.asDocument) type = 'document'
   if (options.asSticker || /webp/.test(mime)) {
	let { writeExif } = require('./lib/exif')
	let media = { mimetype: mime, data }
	pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
	await fs.promises.unlink(filename)
	type = 'sticker'
	mimetype = 'image/webp'
	}
   else if (/image/.test(mime)) type = 'image'
   else if (/video/.test(mime)) type = 'video'
   else if (/audio/.test(mime)) type = 'audio'
   else type = 'document'
   await pan.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
   return fs.promises.unlink(pathFile)
   }

/**
 * 
 * @param {*} jid 
 * @param {*} message 
 * @param {*} forceForward 
 * @param {*} options 
 * @returns 
 */
pan.copyNForward = async (jid, message, forceForward = false, options = {}) => {
	let vtype
	if (options.readViewOnce) {
		message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
		vtype = Object.keys(message.message.viewOnceMessage.message)[0]
		delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
		delete message.message.viewOnceMessage.message[vtype].viewOnce
		message.message = {
			...message.message.viewOnceMessage.message
		}
	}

	let mtype = Object.keys(message.message)[0]
	let content = await generateForwardMessageContent(message, forceForward)
	let ctype = Object.keys(content)[0]
	let context = {}
	if (mtype != "conversation") context = message.message[mtype].contextInfo
	content[ctype].contextInfo = {
		...context,
		...content[ctype].contextInfo
	}
	const waMessage = await generateWAMessageFromContent(jid, content, options ? {
		...content[ctype],
		...options,
		...(options.contextInfo ? {
			contextInfo: {
				...content[ctype].contextInfo,
				...options.contextInfo
			}
		} : {})
	} : {})
	await pan.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
	return waMessage
}

pan.cMod = (jid, copy, text = '', sender = pan.user.id, options = {}) => {
	//let copy = message.toJSON()
	let mtype = Object.keys(copy.message)[0]
	let isEphemeral = mtype === 'ephemeralMessage'
	if (isEphemeral) {
		mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
	}
	let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
	let content = msg[mtype]
	if (typeof content === 'string') msg[mtype] = text || content
	else if (content.caption) content.caption = text || content.caption
	else if (content.text) content.text = text || content.text
	if (typeof content !== 'string') msg[mtype] = {
		...content,
		...options
	}
	if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
	else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
	if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
	else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
	copy.key.remoteJid = jid
	copy.key.fromMe = sender === pan.user.id

	return proto.WebMessageInfo.fromObject(copy)
}


/**
 * 
 * @param {*} path 
 * @returns 
 */
pan.getFile = async (PATH, save) => {
	let res
	let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
	//if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
	let type = await FileType.fromBuffer(data) || {
		mime: 'application/octet-stream',
		ext: '.bin'
	}
	filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
	if (data && save) fs.promises.writeFile(filename, data)
	return {
		res,
		filename,
	size: await getSizeMedia(data),
		...type,
		data
	}

}

return pan
}

startpan()


let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})
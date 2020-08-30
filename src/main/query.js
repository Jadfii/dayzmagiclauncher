let bp = require('bufferpack');
let client = require('dgram').createSocket('udp4');

function sendMessage(HOST, PORT, message, CODE, TIMEOUT = 2000)
{
	return new Promise((resolve, reject) =>
	{
		client.on('error', (e) => 
		{
			reject(e);
		});
	
		client.send(message, 0, message.length, PORT, HOST, (err, bytes) =>
		{
			if (err) return reject(typeof err == 'string' ? new Error(err) : err);
			//console.log('UDP message sent to ' + HOST +':'+ PORT);

			let response = (buffer, remote) =>
			{
				buffer = buffer.slice('4');
				if (bp.unpack('<s', buffer)[0] !== CODE) return;
				client.removeListener('message', response);
				if (timer) clearTimeout(timer);
				return resolve(buffer.slice('1'), remote);
			};

			let timer = setTimeout(() =>
			{
				client.removeListener('message', response);
				return reject('Timeout');
			}, TIMEOUT);
		
			client.on('message', response);
		});
	})
}

function GetKey(HOST, PORT, TYPE)
{
	return new Promise((resolve, reject) =>
	{
		sendMessage(HOST, PORT, bp.pack('<isi', [-1, TYPE, -1]), 'A').then((buffer, remote) => 
		{
			let key = bp.unpack('<i', buffer)[0];
			resolve(key);
		}).catch(reject);
	});
}

function GetMods(HOST, PORT)
{
	let TYPE = 'V';
	let start = new Date();
	return new Promise((resolve, reject) =>
	{
		GetKey(HOST, PORT, TYPE).then(key =>
		{
			let end = new Date();
			sendMessage(HOST, PORT, bp.pack('<isi', [-1, TYPE, key]), 'E').then((buffer, remote) => 
			{
				let buf = buffer;
				let offset = 0;

				let rules_count = bp.unpack('<h', buf)[0];
				offset += bp.calcLength('<h', rules_count);

				let keys = [];
				let offset_temp = offset;
				for (let i = 0; i < rules_count; i++)
				{
					let pair = bp.unpack('<SS', buf, offset_temp);
					offset_temp += bp.calcLength('<SS', pair);

					if (pair[0] == 'allowedBuild') break;
					else keys.push(`00${Buffer.from(pair[0]).toString('hex')}00`);
				}

				buf = Buffer.from(buf.toString('hex').replace(/0103/g, 'FF').replace(/0102/g, '00').replace(/0101/g, '01'), 'hex');

				buf = buf.toString('hex');
				for (let i = 0; i < keys.length; i++)
				{
					while (buf.indexOf(keys[i]) !== -1)
					{
						buf = buf.replace(keys[i], '');
					}
				}
				buf = Buffer.from(buf, 'hex');

				//console.log(buf);

				let version = bp.unpack('<B', buf, offset)[0];
				offset += bp.calcLength('<B', version);

				let overflow = bp.unpack('<B', buf, offset)[0];
				offset += bp.calcLength('<B', overflow);

				let dlc_1 = bp.unpack('<B', buf, offset)[0];
				offset += bp.calcLength('<B', dlc_1);

				let dlc_2 = bp.unpack('<B', buf, offset)[0];
				offset += bp.calcLength('<B', dlc_2);

				let o = bp.unpack('<B', buf, offset - 5)[0];
				if (o == 0) offset += 2;
				else offset -= 1;

				if (overflow !== 0) offset += 4;

				let mods_count = bp.unpack('<B', buf, offset)[0];
				offset += bp.calcLength('<B', mods_count);
				//mods_count = 50;

				//console.log(`${mods_count} MODS FOUND`);

				let mods = [];
				for (let i = 0; i < mods_count; i++)
				{
					// skip mod hash
					offset += 4;

					let mod_flags = bp.unpack('<B', buf, offset);
					if (!mod_flags) continue;
					else
					{
						offset += bp.calcLength('<B', mod_flags);
						mod_flags = mod_flags[0];
					}
					if (mod_flags == 13 || mod_flags == 19) offset += 15;
					if (mod_flags !== 4) continue;
					
					let mod_id = bp.unpack('<I', buf, offset)[0];
					offset += bp.calcLength('<I', mod_id);

					let mod_name_length = bp.unpack('<B', buf, offset)[0];
					offset += bp.calcLength('<B', mod_name_length);

					let s = `<${mod_name_length}s`;
					let mod_name = bp.unpack(s, buf, offset)[0];
					offset += bp.calcLength(s, mod_name);

					/*console.log(`Mod flags: ${mod_flags}`);
					console.log(`Mod file ID: ${mod_id}. Length: ${mod_id.toString().length}`);
					console.log(`Name length bytes: ${mod_name_length}`);
					console.log(`Mod name: ${mod_name}\n`);*/

					mods.push({
						id: mod_id,
						name: mod_name
					});
				}

				resolve({mods_count: mods_count - 1, mods: mods.reverse(), latency: end - start});
			}).catch(reject);
		}).catch(reject);
	});
}

module.exports = { GetMods };
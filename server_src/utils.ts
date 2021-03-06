import {spawn} from 'child_process';
import * as path from 'path';
import discordAPI, {DiscordUserJSON} from './discord_api';
var prompt = require('prompt-sync')();
import Config from './config';

var RCON_PASSWORD: string;

const Utils = {
	ISLANDS: 3,

	getArgument: function(name: string) {
		for(var arg of process.argv) {
			if(arg.startsWith(name))
				return arg.replace(name, '').substring(1);
		}

		try {//ask user to type password in console
			return prompt(name + ': ') || '';
		}
		catch(e) {
			console.error(`Argument ${name} not found. Closing program.`);
			process.exit();
			return '';
		}
	},
	RCON_CMD_BASE: function(port = 30120) {
		return path.join(__dirname, '..', 'tools', 'rcon') + ` ${Config.server_ip} ${port} ${RCON_PASSWORD} `
	},
	SERVER_CMDS: {
		'start': '~/start.sh',
		'stop': '~/stop.sh',
		'restart': '~/restart.sh'
	},
	SERVER_CMDS2: {
		'start': '~/start2.sh',
		'stop': '~/stop2.sh',
		'restart': '~/restart2.sh'
	},
	SERVER_CMDS3: {
		'start': '~/start3.sh',
		'stop': '~/stop3.sh',
		'restart': '~/restart3.sh'
	},
	getServerCMDS: function(isl_index: number) {
		switch (isl_index) {
			case 0:	return this.SERVER_CMDS;
			case 1:	return this.SERVER_CMDS2;
			case 2:	return this.SERVER_CMDS3;
		}
		throw new Error('No island with this index');
	},
	executeCommand: function(cmd: string): Promise<string> {
		return new Promise((resolve, reject) => {
			var stdout = '';
			var stderr = '';

			var expired = false;

			setTimeout(() => {
				expired = true;
				reject('Command timeout');
			}, 1000*60);//timeout after 1 minute

			try {
				let args = cmd.split(' ');
				let main_cmd = args.shift() || 'echo';
				const command = spawn(main_cmd, args, {shell: true});
				command.stdout.on('data', (data: string) => stdout += data);
				command.stderr.on('data', (data: string) => stderr += data);
				command.on('close', (code: number) => {
					if(expired) return;
				  	if(code === 0)
				  		resolve(stdout);
				  	else
				  		reject(stderr);
				});
				command.on('error', (err: any) => {
					if(!expired)
				  		reject(err);
				});
			}
			catch(e) {
				if(!expired)
					reject(e);
			}
		});
	},
	executeRconCommand: function(cmd: string, isl_index: number): Promise<string> {
		return this.executeCommand( this.RCON_CMD_BASE(30120+isl_index) + cmd );
	},

	testForAdmin: async function(req: any, res: any): Promise<false | DiscordUserJSON> {
		var response = await discordAPI.getDiscordUserData(req.body.token);

		if(response.code === 0) {
			res.json({ result: response.message });
			return false;
		}

		if(discordAPI.Admins.isAdmin(response.id) === false) {
			res.json({ result: 'INSUFICIENT_PERMISSIONS' });
			return false;
		}

		return response;
	},

	extractIP: function(req: any) {
		let forwards = req.headers['x-forwarded-for'];
		if(typeof forwards === 'object')//an array
			forwards = forwards[0];// forwards.join(',');
		if(typeof forwards === 'string')
			forwards = forwards.split(',')[0];
		return (forwards || req.connection.remoteAddress || '').replace(/::ffff:/, '');
	}
};

RCON_PASSWORD = Utils.getArgument('RCON');

export default Utils;
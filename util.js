let fs = require('fs'),
	childProcess = require("child_process"),
	path = require('path');

module.exports = {
	die: function (err) {
		console.log(err);
		process.exit(1);
	},

	exec_or_die: async function (cmd, args = [], from_dir = "./") {
		return new Promise((resolve, reject) => {
			var process = childProcess.execFile(cmd, args, {
				cwd: from_dir
			}, async (err, stdout, stderr) => {
				if (err) {
					reject(new Error(`Error executing script: ${cmd}: ${err}`));
				}
				resolve();
			});
		}).catch(this.die);
	},

	exec_dont_die: async function (cmd, args = [], from_dir = "./") {
		return new Promise((resolve, reject) => {
			var process = childProcess.execFile(cmd, args, {
				cwd: from_dir
			}, async (err, stdout, stderr) => {
				if (err) {
					// we never die
				}
				resolve();
			});
		}).catch(() => {
			resolve();
		});
	},

	copy_to_dir: async function (from, to_dir) {
		to = path.join(to_dir, from);
		return this.copy_to(from, to);
	},

	copy_to: async function (from, to) {
		const ncp = require('ncp').ncp;
		ncp.limit = 16;
		return new Promise((resolve, reject) => {
			ncp(from, to, async (err) => {
				if (err) {
					reject(new Error(`Copy failed: ${code}`));
				}
				resolve();
			});
		}).catch(this.die);
	},

	make_dir: async function (name) {
		const mkdirp = require('mkdirp');
		return new Promise((resolve, reject) => {
			mkdirp(name, async (err) => {
				if (err) {
					reject(new Error(err));
				}
				resolve();
			});
		}).catch(this.die);
	},

	writeFile: async function (filename, content) {
		return new Promise(function (resolve, reject) {
			fs.writeFile(filename, content, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

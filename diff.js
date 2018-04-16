let fs = require('fs'),
	PNG = require('pngjs').PNG,
	pixelmatch = require('pixelmatch'),
	rimraf = require('rimraf'),
	util = require('./util.js');

let outDirectory = '50';
let outOldDirectory = '49';
let outDiffDirectory = '49_50';

let html = `
	<!DOCTYPE html>
		<html>
			<style>
				body {
					font-family: Arial;
				}
				img {
					width: 400px;
				}
				th {
					padding: 10px;
				}
			</style>
			<body>
				<table style="width:100%">`;

async function check(dirname, filename) {
	const data1 = fs.readFileSync(`${outDirectory}/${dirname}/${filename}`);
	const img1 = PNG.sync.read(data1);
	const data2 = fs.readFileSync(`${outOldDirectory}/${dirname}/${filename}`);
	const img2 = PNG.sync.read(data2);

	const diff = new PNG({ width: img1.width, height: img1.height });
	const pixelsCount = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.5 });

	if (pixelsCount > 0) {
		await util.make_dir(`${outDiffDirectory}/${dirname}`);
		diff.pack().pipe(fs.createWriteStream(`${outDiffDirectory}/${dirname}/${filename}`));
		return true;
	} else {
		return false;
	}
}

async function run() {
	if (process.argv.length !== 5) {
		throw 'Missing command line parameters, there should be three: [old], [new] and [output directory]';
	}

	outOldDirectory = process.argv[2];
	outDirectory = process.argv[3];
	outDiffDirectory = process.argv[4];

	rimraf.sync(outDiffDirectory)
	await util.make_dir(outDiffDirectory);
	html += `
		<tr>
    		<th>${outOldDirectory}</th>
    		<th>${outDirectory}</th>
    		<th>Difference</th>
		</tr>`;

	const dirs = fs.readdirSync(outOldDirectory);
	for (let i = 0; i < dirs.length; i++) {
		const images = fs.readdirSync(`${outOldDirectory}/${dirs[i]}`);
		for (let j = 0; j < images.length; j++) {
			const hasDiff = await check(dirs[i], images[j]);
			if (hasDiff) {
				// Generate html report
				html += `
					<tr><th colspan="3" style="background-color: #646464; color: #efefef">${images[j]}</th></tr>
					<tr>
						<th><img src="../${outOldDirectory}/${dirs[i]}/${images[j]}"></th>
						<th><img src="../${outDirectory}/${dirs[i]}/${images[j]}"></th>
						<th><img src="${dirs[i]}/${images[j]}"></th>
					</tr>`;
			}
		}
	}

	html += '</table></body></html>';

	const outDiffHtml = `${outDiffDirectory}/index.html`;
	await util.writeFile(outDiffHtml, html);
}

process.on('unhandledRejection', error => {
	console.log(error);
	process.exit(1);
});
run();

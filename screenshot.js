let puppeteer = require('puppeteer'),
	path = require('path'),
	fs = require('fs'),
	util = require('./util.js');

let browser;
let page;
let hostname = 'https://demo.imqs.co.za';
let configDirectory = 'config';
let outDirectory = 'output';

async function process_config_file(f) {
	const filePath = path.posix.join(configDirectory, f);
	const config = require('./' + filePath);

	console.log(`Capture screenshots for ${config.description} (${filePath}) started...`);

	const screenshots = config.screenshots;
	for (let i = 0; i < screenshots.length; i++) {
		console.log(`Generating screenshot for "${screenshots[i].description}" started`);
		const t0 = process.hrtime()[0];
		await screenshot(screenshots[i], path.parse(f).name); // output into directory with same name as config file
		const t1 = process.hrtime()[0];
		console.log(`Generating screenshot for "${screenshots[i].description}" done`);
		console.log(`Output to "${screenshots[i].filename}" in ${t1 - t0}s\n`);
	}

	console.log(`Capture screenshots for ${config.description} (${filePath}) done`);
}

async function process_all() {
	page = await browser.newPage();
	page.setViewport({ width: 1024, height: 768 });
	await page.goto(hostname, { waitUntil: 'networkidle0' });

	const configFiles = fs.readdirSync(configDirectory);
	for (let i = 0; i < configFiles.length; i++) {
		const f = configFiles[i];
		await util.make_dir(path.join(outDirectory, path.parse(f).name));
		await process_config_file(f);
	}

	await page.close();
}

async function getElPosition(selector) {
	return page.evaluate(selector => {
		const el = document.querySelector(selector);
		const offsets = el.getBoundingClientRect();
		return {
			x: offsets.left,
			y: offsets.top,
			width: el.offsetWidth,
			height: el.offsetHeight
		};
	}, selector);
}

async function clickAction(action) {
	if (action.clickCount) {
		for (let j = 0; j < action.clickCount; j++) {
			await page.click(action.itemToClickOn);
		}
	} else {
		const clickPromises = [page.click(action.itemToClickOn)];
		if (action.itemToWaitFor)
			clickPromises.push(page.waitForSelector(action.itemToWaitFor));
		if (action.waitUntil)
			clickPromises.push(page.waitForNavigation({ waitUntil: action.waitUntil }));
		await Promise.all(clickPromises);
	}
}

async function screenshot(item, dir) {
	for (let i = 0; i < item.actions.length; i++) {
		const action = item.actions[i];
		console.log(`\t${action.description} started...`);
		switch (action.actionType) {
			case 'click':
				await clickAction(action);
				break;
			case 'type':
				await page.type(action.itemToTypeIn, action.valueToType);
				break;
			default:
				throw 'Unknown action type';
				break;
		}
		console.log(`\t${action.description} done`);
	}
	const screenshotOptions = {
		path: path.join(outDirectory, dir, item.filename)
	};
	if (item.clip) {
		const pos = await getElPosition(item.clip);
		screenshotOptions.clip = pos;
	}
	await page.screenshot(screenshotOptions);
}

async function run() {
	if (process.argv.length !== 5) {
		throw 'Missing command line parameters, there should be three: [hostname], [test directory] and [output directory]';
	}

	hostname = process.argv[2];
	configDirectory = process.argv[3];
	outDirectory = process.argv[4];

	await util.make_dir(outDirectory);

	browser = await puppeteer.launch({ slowMo: 100 });

	await process_all();
	await browser.close();
}

process.on('unhandledRejection', error => {
	console.log(error);
	process.exit(1);
});
run();

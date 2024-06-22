import puppeteer from "puppeteer-extra";
import * as fs from "fs";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

async function getHeroData(name) {
	puppeteer
		.launch({ headless: true, defaultViewport: null })
		.then(async (browser) => {
			const page = await browser.newPage();

			console.log(`Loading page dota2protracker..`);
			await page.goto(`https://dota2protracker.com/hero/${name}`, {
				waitUntil: "networkidle2",
			});

			console.log(`Getting page data..`);

			await page.waitForSelector(
				".flex.flex-col.lg\\:flex-row.gap-2.sticky.top-1.bg-black\\/20"
			);

			const heroData = await page.$$eval(
				".flex.flex-col.lg\\:flex-row.gap-2.sticky.top-1.bg-black\\/20 > div",
				(elements) => {
					return elements
						.map((element) => {
							const roleElement = element.querySelector(
								".flex.font-bold.gap-2.items-center.text-sm.lg\\:text-lg"
							);
							const winRateElement = element.querySelector(
								".text-white\\/\\[0\\.4\\].text-xs.text-center > span"
							);
							const matchesElement = element.querySelector(
								".text-white\\/\\[0\\.4\\].text-xs.text-center"
							);

							if (roleElement && winRateElement && matchesElement) {
								const role = roleElement.innerText.trim();
								const winRate = winRateElement.innerText.trim();
								const matchesText = matchesElement.innerText;
								const matches = matchesText.match(/(\d+) matches/)[1];
								const players = matchesText.match(/by (\d+) Players/)[1];

								return {
									role,
									winRate,
									matches,
									players,
								};
							}
							return null;
						})
						.filter(Boolean);
				}
			);

			const jsonOutputPath = "hero_data.json";
			let data = JSON.stringify(heroData, null, 2);
			fs.writeFile(jsonOutputPath, data, (err) => {
				if (err) throw err;
				console.log("Data written to file");
			});

			console.log(`Hero data, database atualized. ✨`);

			await browser.close();
		})
		.catch((error) => {
			console.error("Error during puppeteer execution:", error);
		});
}

getHeroData("Anti-Mage");

import puppeteer from "puppeteer-extra";
import * as fs from "fs";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

async function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

puppeteer
	.launch({ headless: true, defaultViewport: null })
	.then(async (browser) => {
		const page = await browser.newPage();

		console.log(`Loading page dota2protracker..`);
		await page.goto("https://dota2protracker.com/meta", {
			waitUntil: "networkidle2",
		});

		console.log(`get page data..`);
		await page.waitForSelector("#meta-table .hero-row");
		await page.waitForSelector(".nav a");

		const navLinks = await page.$$(".nav a");

		const allHeroData = {};

		for (const link of navLinks) {
			const linkText = await page.evaluate((el) => el.innerText.trim(), link);
			console.log(`get meta data '${linkText}' heroes...`);

			await link.click();

			await sleep(2000);

			const heroes = await page.evaluate(() => {
				const heroElements = document.querySelectorAll("#meta-table .hero-row");
				const heroData = [];

				const dataIndexToProperty = [
					"role",
					"name",
					"matches",
					"winRate",
					"winRate9500",
					"contestRate",
					"rating",
					"radiantWinRate",
					"direWinRate",
					"expertWinRate",
					"phase1WinRate",
					"phase2WinRate",
					"phase3WinRate",
					"networth",
				];
				heroElements.forEach((hero, index) => {
					if (index >= 5) return;

					const dataElements = hero.querySelectorAll("div[data-sort-value]");
					const heroInfo = {};

					dataElements.forEach((element, dataIndex) => {
						const property = dataIndexToProperty[dataIndex];
						if (property) {
							heroInfo[property] = element.dataset.sortValue;
						}
					});

					heroData.push(heroInfo);
				});

				return heroData;
			});

			allHeroData[linkText] = heroes;
		}

		console.log("Heróis do Meta:", allHeroData);
		// save data
		const jsonOutputPath = "heroes_meta_data.json";
		let data = JSON.stringify(allHeroData, null, 2);
		fs.writeFile(jsonOutputPath, data, (err) => {
			if (err) throw err;
			console.log("Data written to file");
		});

		console.log(`All done, database atualized. ✨`);

		await browser.close();
	})
	.catch((error) => {
		console.error("Error during puppeteer execution:", error);
	});

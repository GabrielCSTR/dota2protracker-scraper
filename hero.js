import puppeteer from "puppeteer-extra";

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
			await page.waitForSelector(".mt-6.flex.gap-2");

			const heroData = await page.evaluate(() => {
				const selectedRole =
					document.querySelector(".mt-6.flex.gap-2 b").innerText;
				const matches = document.querySelector(
					"body > div > div > div > div:nth-child(2) > b"
				).innerText;
				const winRate = document.querySelector(
					"body > div > div > div > div:nth-child(3) > b > div"
				).innerText;

				return {
					selectedRole,
					matches,
					winRate,
				};
			});
			console.log(heroData);
			await browser.close();
		})
		.catch((error) => {
			console.error("Error during puppeteer execution:", error);
		});
}

getHeroData("Anti-Mage");

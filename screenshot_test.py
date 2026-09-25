import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            context = browser.contexts[0]
            page = context.pages[0]
            await page.screenshot(path="final_state.png")
            print(await page.evaluate("document.body.innerText"))
            await browser.close()
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(run())

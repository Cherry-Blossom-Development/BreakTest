import BasePage from './BasePage';

class SessionsPage extends BasePage {
    get screen() {
        return this.rid('screen-sessions');
    }

    get bpContent() {
        return this.rid('sessions-bp-content');
    }

    get indContent() {
        return this.rid('sessions-ind-content');
    }

    get bandsContent() {
        return this.rid('sessions-bands-content');
    }

    async waitForScreen(timeout = 15000): Promise<void> {
        await this.screen.waitForDisplayed({ timeout });
    }

    async clickTab(tabName: 'Band Practice' | 'Individual' | 'Bands'): Promise<void> {
        const tab = await $(`android=new UiSelector().text("${tabName}")`);
        await tab.waitForDisplayed({ timeout: 5000 });
        await tab.click();
        await driver.pause(500);
    }

    async isTabVisible(tabName: string): Promise<boolean> {
        try {
            const tab = await $(`android=new UiSelector().text("${tabName}")`);
            return await tab.isDisplayed();
        } catch {
            return false;
        }
    }
}

export default new SessionsPage();

import BasePage from './BasePage';

class HaulonautPlayPage extends BasePage {
    get screen() {
        return this.rid('screen-haulonaut-play');
    }

    get visitOutpostBtn() {
        return this.rid('haulonaut-visit-outpost-btn');
    }

    get viewCargoBtn() {
        return this.rid('haulonaut-view-cargo-btn');
    }

    get backToSectorBtn() {
        return this.rid('haulonaut-back-to-sector-btn');
    }

    get sectorNumberText() {
        return this.rid('haulonaut-sector-number');
    }

    get creditsText() {
        return this.rid('haulonaut-resource-credits');
    }

    get rationsText() {
        return this.rid('haulonaut-resource-rations');
    }

    /**
     * Reads a resource pill (Credits/Rations) and returns just the number.
     * The element merges its "<value> <label>" into one accessibility node
     * (see ResourcePill in HaulonautPlayScreen.kt) -- content-desc carries it
     * when the merged node's own text is empty.
     */
    async readResourceValue(element: WebdriverIO.Element): Promise<number> {
        const text = (await element.getText()) || (await element.getAttribute('content-desc')) || '';
        const match = text.match(/-?\d+/);
        if (!match) throw new Error(`Could not parse a number out of resource text: "${text}"`);
        return parseInt(match[0], 10);
    }

    async getSectorNumber(): Promise<number> {
        const text = await this.sectorNumberText.getText();
        const match = text.match(/\d+/);
        if (!match) throw new Error(`Could not parse sector number out of: "${text}"`);
        return parseInt(match[0], 10);
    }

    // Seeded test items (see BreakTest/database/seed-data.sql) -- item_key-scoped
    // so a specific item can be bought deterministically regardless of catalog order.
    buyBtn(itemKey: string) {
        return this.rid(`haulonaut-outpost-buy-${itemKey}`);
    }

    warpBtn(sectorNumber: number) {
        return this.rid(`haulonaut-warp-btn-${sectorNumber}`);
    }

    async waitForScreen(timeout = 15000): Promise<void> {
        await this.screen.waitForDisplayed({ timeout });
    }
}

export default new HaulonautPlayPage();

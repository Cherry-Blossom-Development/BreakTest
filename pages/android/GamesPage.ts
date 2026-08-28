import BasePage from './BasePage';

class GamesPage extends BasePage {
    get screen() {
        return this.rid('screen-games');
    }

    get playNowBtn() {
        return this.rid('games-play-now-btn');
    }

    get newCharacterBtn() {
        return this.rid('games-new-character-btn');
    }

    get characterResumeBtn() {
        return this.rid('games-character-resume-btn');
    }

    // Dialog elements: Dialog() re-applies testTagsAsResourceId on its own Card
    // (see GamesScreen.kt), so these resolve as resource-ids same as the main screen.
    get captainNameInput() {
        return this.rid('games-captain-name-input');
    }

    get launchBtn() {
        return this.rid('games-launch-btn');
    }

    async waitForScreen(timeout = 15000): Promise<void> {
        await this.screen.waitForDisplayed({ timeout });
    }

    async createCharacter(name: string): Promise<void> {
        await this.newCharacterBtn.waitForDisplayed({ timeout: 5000 });
        await this.newCharacterBtn.click();
        await this.captainNameInput.waitForDisplayed({ timeout: 5000 });
        await this.captainNameInput.setValue(name);
        await driver.hideKeyboard();
        await this.launchBtn.waitForEnabled({ timeout: 3000 });
        await this.launchBtn.click();
    }
}

export default new GamesPage();

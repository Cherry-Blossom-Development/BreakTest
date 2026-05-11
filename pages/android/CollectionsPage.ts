import BasePage from './BasePage';

class CollectionsPage extends BasePage {
    get screen() {
        return this.rid('screen-collections');
    }

    get fab() {
        return this.rid('collections-fab');
    }

    get ordersBtn() {
        return this.rid('collections-orders-btn');
    }

    get shippingBtn() {
        return this.rid('collections-shipping-btn');
    }

    get collectionCards() {
        return this.rids('collection-card');
    }

    // Dialog elements: AlertDialog creates a new window where testTagsAsResourceId
    // from the root Surface does not propagate. Use text/className selectors instead.
    get nameInput() {
        return $('android=new UiSelector().className("android.widget.EditText")');
    }

    get dialogSaveBtn() {
        return $('android=new UiSelector().text("Create")');
    }

    get dialogSaveBtnEdit() {
        return $('android=new UiSelector().text("Save")');
    }

    get dialogCancelBtn() {
        return $('android=new UiSelector().text("Cancel")');
    }

    get deleteConfirmBtn() {
        return $('android=new UiSelector().text("Delete")');
    }

    get deleteCancelBtn() {
        return $('android=new UiSelector().text("Cancel")');
    }

    async waitForScreen(timeout = 15000): Promise<void> {
        await this.screen.waitForDisplayed({ timeout });
    }

    async findCardWithName(name: string) {
        const cards = await this.collectionCards;
        for (const card of cards) {
            try {
                const nameEl = await card.$('android=new UiSelector().resourceId("collection-card-name")');
                if (await nameEl.isExisting()) {
                    const text = await nameEl.getText();
                    if (text === name) return card;
                }
            } catch {
                // continue
            }
        }
        return null;
    }

    async getEditBtnForCard(card: WebdriverIO.Element) {
        return card.$('android=new UiSelector().resourceId("collection-card-edit")');
    }

    async getDeleteBtnForCard(card: WebdriverIO.Element) {
        return card.$('android=new UiSelector().resourceId("collection-card-delete")');
    }

    async createCollection(name: string): Promise<void> {
        await this.fab.waitForDisplayed({ timeout: 5000 });
        await this.fab.click();
        await this.nameInput.waitForDisplayed({ timeout: 5000 });
        await this.nameInput.setValue(name);
        await driver.hideKeyboard();
        await this.dialogSaveBtn.waitForEnabled({ timeout: 3000 });
        await this.dialogSaveBtn.click();
        await this.dialogSaveBtn.waitForDisplayed({ timeout: 5000, reverse: true });
    }
}

export default new CollectionsPage();

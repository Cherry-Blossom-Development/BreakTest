import BasePage from './BasePage';

class CollectionsPage extends BasePage {
    get container() {
        return $('.collections-page');
    }

    get heading() {
        return $('.collections-page h1');
    }

    get newCollectionBtn() {
        return $('.page-header .btn-primary');
    }

    get setupLinks() {
        return $$('.setup-link');
    }

    get setupLinkTitles() {
        return $$('.setup-link-title');
    }

    get storefrontCard() {
        return $('.storefront-card');
    }

    get collectionCards() {
        return $$('.collection-card');
    }

    get modal() {
        return $('.modal:not(.modal-sm)');
    }

    get modalTitle() {
        return $('.modal-title');
    }

    get nameInput() {
        return $('.modal .form-input');
    }

    get colorPicker() {
        return $('.color-swatch');
    }

    get saveButton() {
        return $('.modal-actions .btn-primary:not(.btn-danger-solid)');
    }

    get cancelButton() {
        return $('.modal-actions .btn-secondary');
    }

    get deleteConfirmModal() {
        return $('.modal-sm');
    }

    get confirmDeleteButton() {
        return $('.btn-danger-solid');
    }

    async open(): Promise<void> {
        await super.open('/collections');
    }

    async clickNewCollection(): Promise<void> {
        await this.newCollectionBtn.waitForClickable({ timeout: 5000 });
        await this.newCollectionBtn.click();
    }

    async findCollectionCard(name: string) {
        const cards = await this.collectionCards;
        for (const card of cards) {
            const nameEl = await card.$('.card-name');
            if (await nameEl.isExisting() && (await nameEl.getText()) === name) {
                return card;
            }
        }
        return null;
    }

    async getCollectionIdFromCard(name: string): Promise<number | null> {
        const cards = await this.collectionCards;
        for (const card of cards) {
            const nameEl = await card.$('.card-name');
            if (await nameEl.isExisting() && (await nameEl.getText()) === name) {
                const href = await nameEl.getAttribute('href');
                const idStr = href ? href.split('/').pop() : null;
                return idStr ? parseInt(idStr, 10) : null;
            }
        }
        return null;
    }
}

export default new CollectionsPage();

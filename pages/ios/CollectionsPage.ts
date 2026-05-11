import BasePage from './BasePage';

/**
 * Page object for iOS Collections feature.
 * Provides selectors and actions for testing Collections screens.
 */
class CollectionsPage extends BasePage {
    // -- Screen identifiers --
    get screenCollections() { return this.aid('screenCollections'); }
    get screenCollectionDetail() { return this.aid('screenCollectionDetail'); }

    // -- Collections list --
    get collectionsList() { return this.aid('collectionsList'); }
    get collectionsLoading() { return this.aid('collectionsLoading'); }
    get collectionsEmpty() { return this.aid('collectionsEmpty'); }
    get collectionsError() { return this.aid('collectionsError'); }
    get collectionsRetryButton() { return this.aid('collectionsRetryButton'); }

    // -- Collection card --
    collectionCard(id: number) { return this.aid(`collectionCard_${id}`); }

    // -- Add/Create collection --
    get addButton() { return this.aid('collectionsAddButton'); }
    get createFirstButton() { return this.aid('collectionsCreateFirstButton'); }

    // -- Collection form --
    get collectionForm() { return this.aid('collectionForm'); }
    get nameField() { return this.aid('collectionNameField'); }
    get colorPicker() { return this.aid('collectionColorPicker'); }
    get saveButton() { return this.aid('collectionSaveButton'); }
    get cancelButton() { return this.aid('collectionCancelButton'); }

    // -- Collection detail (items) --
    get itemsLoading() { return this.aid('collectionItemsLoading'); }
    get itemsEmpty() { return this.aid('collectionItemsEmpty'); }
    get itemsError() { return this.aid('collectionItemsError'); }
    get itemsRetryButton() { return this.aid('collectionItemsRetryButton'); }
    get addItemButton() { return this.aid('collectionAddItemButton'); }
    get addFirstItemButton() { return this.aid('collectionAddFirstItemButton'); }

    /**
     * Wait for the Collections screen to be displayed.
     * Checks for screen identifier or any of the content states.
     */
    async waitForScreen(timeout = 30000): Promise<void> {
        // Try main screen identifier first
        try {
            await this.screenCollections.waitForDisplayed({ timeout: 5000 });
            return;
        } catch {
            // Fall back to checking content states
        }

        // Check for any content state that indicates we're on Collections
        const endTime = Date.now() + timeout;
        while (Date.now() < endTime) {
            // Check for loading state
            const loading = await this.collectionsLoading.isDisplayed().catch(() => false);
            if (loading) return;

            // Check for empty state
            const empty = await this.collectionsEmpty.isDisplayed().catch(() => false);
            if (empty) return;

            // Check for list
            const list = await this.collectionsList.isDisplayed().catch(() => false);
            if (list) return;

            // Check for add button (always visible in toolbar)
            const addBtn = await this.addButton.isDisplayed().catch(() => false);
            if (addBtn) return;

            await driver.pause(500);
        }

        // Final attempt with main identifier
        await this.screenCollections.waitForDisplayed({ timeout: 5000 });
    }

    /**
     * Wait for the Collection Detail screen to be displayed.
     */
    async waitForDetailScreen(timeout = 30000): Promise<void> {
        await this.screenCollectionDetail.waitForDisplayed({ timeout });
    }

    /**
     * Check if collections list is displayed (has collections).
     */
    async hasCollections(): Promise<boolean> {
        try {
            await this.collectionsList.waitForDisplayed({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if collections empty state is displayed.
     */
    async isEmpty(): Promise<boolean> {
        try {
            await this.collectionsEmpty.waitForDisplayed({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Tap on a collection card to open it.
     */
    async openCollection(id: number): Promise<void> {
        const card = this.collectionCard(id);
        await card.waitForDisplayed({ timeout: 10000 });
        await card.click();
    }

    /**
     * Create a new collection with the given name.
     */
    async createCollection(name: string): Promise<void> {
        await this.addButton.waitForDisplayed({ timeout: 10000 });
        await this.addButton.click();
        await this.collectionForm.waitForDisplayed({ timeout: 5000 });
        await this.nameField.waitForDisplayed({ timeout: 5000 });
        await this.nameField.clearValue();
        await this.nameField.setValue(name);
        await this.saveButton.click();
    }

    /**
     * Create first collection using the empty state button.
     */
    async createFirstCollection(name: string): Promise<void> {
        await this.createFirstButton.waitForDisplayed({ timeout: 10000 });
        await this.createFirstButton.click();
        await this.collectionForm.waitForDisplayed({ timeout: 5000 });
        await this.nameField.waitForDisplayed({ timeout: 5000 });
        await this.nameField.clearValue();
        await this.nameField.setValue(name);
        await this.saveButton.click();
    }

    /**
     * Cancel the collection form.
     */
    async cancelForm(): Promise<void> {
        await this.cancelButton.waitForDisplayed({ timeout: 5000 });
        await this.cancelButton.click();
    }

    /**
     * Add an item to the current collection (from detail view).
     */
    async tapAddItem(): Promise<void> {
        await this.addItemButton.waitForDisplayed({ timeout: 10000 });
        await this.addItemButton.click();
    }
}

export default new CollectionsPage();

import LoginPage from '../../pages/web/LoginPage';
import CollectionsPage from '../../pages/web/CollectionsPage';
import TestUsers from '../data/testUsers';

describe('Breakroom Web - Collections', () => {
    // Unique names to avoid conflicts with previous test runs
    const testCollectionName = `Test Collection ${Date.now()}`;
    const editedCollectionName = `${testCollectionName} Edited`;
    let testCollectionId: number | null = null;

    before(async () => {
        await browser.setWindowSize(1280, 800);
        await browser.deleteCookies();
        await LoginPage.open();
        await LoginPage.login(TestUsers.standard.handle, TestUsers.standard.password);
        await browser.pause(3000);
        const url = await browser.getUrl();
        if (url.includes('login') || url.includes('about')) {
            throw new Error(`Login failed — still on: ${url}`);
        }
    });

    after(async () => {
        // Clean up if a test collection was created but not deleted by the delete test
        if (testCollectionId !== null) {
            await browser.execute(async (id: number) => {
                await fetch(`/api/collections/${id}`, { method: 'DELETE', credentials: 'include' });
            }, testCollectionId);
        }
    });

    beforeEach(async () => {
        await CollectionsPage.open();
        await CollectionsPage.container.waitForDisplayed({ timeout: 10000 });
    });

    // ─── Page structure ────────────────────────────────────────────────────────

    it('should display the Collections heading', async () => {
        await CollectionsPage.heading.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.heading.getText()).toBe('Collections');
    });

    it('should display the New Collection button', async () => {
        expect(await CollectionsPage.newCollectionBtn.isDisplayed()).toBe(true);
    });

    it('should display the Payment Setup link', async () => {
        const titles = await CollectionsPage.setupLinkTitles;
        const texts: string[] = [];
        for (const title of titles) {
            texts.push(await title.getText());
        }
        expect(texts).toContain('Payment Setup');
    });

    it('should display the Shipping Setup link', async () => {
        const titles = await CollectionsPage.setupLinkTitles;
        const texts: string[] = [];
        for (const title of titles) {
            texts.push(await title.getText());
        }
        expect(texts).toContain('Shipping Setup');
    });

    it('should display the Orders link', async () => {
        const titles = await CollectionsPage.setupLinkTitles;
        const texts: string[] = [];
        for (const title of titles) {
            texts.push(await title.getText());
        }
        expect(texts).toContain('Orders');
    });

    it('should display the Storefront card', async () => {
        await CollectionsPage.storefrontCard.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.storefrontCard.isDisplayed()).toBe(true);
    });

    // ─── New Collection modal ──────────────────────────────────────────────────

    it('should open the New Collection modal', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.modal.isDisplayed()).toBe(true);
    });

    it('should show "New Collection" as the modal title', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.modalTitle.getText()).toBe('New Collection');
    });

    it('should have a name input in the New Collection modal', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.nameInput.isDisplayed()).toBe(true);
    });

    it('should have a color picker in the New Collection modal', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.colorPicker.isExisting()).toBe(true);
    });

    it('should disable the Save button when the collection name is empty', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        // Name input starts empty — Save should be disabled
        const disabled = await CollectionsPage.saveButton.getAttribute('disabled');
        expect(disabled).not.toBeNull();
    });

    it('should close the modal when Cancel is clicked', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.cancelButton.click();
        await browser.waitUntil(
            async () => !(await $('.modal').isExisting()),
            { timeout: 5000, timeoutMsg: 'Modal did not close after clicking Cancel' }
        );
    });

    // ─── CRUD flow (tests below are sequentially dependent) ───────────────────

    it('should create a new collection and show it in the grid', async () => {
        await CollectionsPage.clickNewCollection();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.nameInput.setValue(testCollectionName);
        await CollectionsPage.saveButton.waitForClickable({ timeout: 3000 });
        await CollectionsPage.saveButton.click();
        await browser.waitUntil(
            async () => !(await $('.modal').isExisting()),
            { timeout: 5000, timeoutMsg: 'Modal did not close after creating collection' }
        );
        await browser.waitUntil(
            async () => (await CollectionsPage.findCollectionCard(testCollectionName)) !== null,
            { timeout: 5000, timeoutMsg: `Collection "${testCollectionName}" did not appear in grid` }
        );
        testCollectionId = await CollectionsPage.getCollectionIdFromCard(testCollectionName);
        expect(testCollectionId).not.toBeNull();
    });

    it('should navigate to the collection detail page via the Manage link', async () => {
        const card = await CollectionsPage.findCollectionCard(testCollectionName);
        expect(card).not.toBeNull();
        const manageLink = await card!.$('.btn-sm*=Manage');
        await manageLink.waitForClickable({ timeout: 5000 });
        await manageLink.click();
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/collections/'),
            { timeout: 8000, timeoutMsg: 'Did not navigate to collection detail page' }
        );
        expect(await browser.getUrl()).toMatch(/\/collections\/\d+/);
    });

    // ─── Collection detail page ────────────────────────────────────────────────

    it('should show the back link on the collection detail page', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        const backLink = await $('.back-link');
        await backLink.waitForDisplayed({ timeout: 5000 });
        expect(await backLink.getText()).toContain('Collections');
    });

    it('should show the Add Item button on the collection detail page', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        const addBtn = await $('.collection-detail-page .page-header .btn-primary');
        await addBtn.waitForDisplayed({ timeout: 5000 });
        expect(await addBtn.getText()).toContain('Add Item');
    });

    it('should open the Add Item modal', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        const addBtn = await $('.collection-detail-page .page-header .btn-primary');
        await addBtn.waitForClickable({ timeout: 5000 });
        await addBtn.click();
        await $('.modal').waitForDisplayed({ timeout: 5000 });
        expect(await $('.modal').isDisplayed()).toBe(true);
    });

    it('should show "Add Item" as the modal title', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        await ($('.collection-detail-page .page-header .btn-primary')).waitForClickable({ timeout: 5000 });
        await ($('.collection-detail-page .page-header .btn-primary')).click();
        await ($('.modal')).waitForDisplayed({ timeout: 5000 });
        expect(await $('.modal-title').getText()).toBe('Add Item');
    });

    it('should disable Save when the Add Item name is empty', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        await ($('.collection-detail-page .page-header .btn-primary')).waitForClickable({ timeout: 5000 });
        await ($('.collection-detail-page .page-header .btn-primary')).click();
        await ($('.modal')).waitForDisplayed({ timeout: 5000 });
        const disabled = await $('.modal-actions .btn-primary').getAttribute('disabled');
        expect(disabled).not.toBeNull();
    });

    it('should close the Add Item modal when Cancel is clicked', async () => {
        await browser.url(`/collections/${testCollectionId}`);
        await ($('.collection-detail-page .page-header .btn-primary')).waitForClickable({ timeout: 5000 });
        await ($('.collection-detail-page .page-header .btn-primary')).click();
        await ($('.modal')).waitForDisplayed({ timeout: 5000 });
        await ($('.modal-actions .btn-secondary')).click();
        await browser.waitUntil(
            async () => !(await ($('.modal')).isExisting()),
            { timeout: 5000, timeoutMsg: 'Add Item modal did not close after Cancel' }
        );
    });

    // ─── Edit collection ───────────────────────────────────────────────────────

    it('should open the Edit modal with the collection name prefilled', async () => {
        const card = await CollectionsPage.findCollectionCard(testCollectionName);
        expect(card).not.toBeNull();
        const editBtn = await card!.$('.btn-sm*=Edit');
        await editBtn.waitForClickable({ timeout: 5000 });
        await editBtn.click();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.modalTitle.getText()).toBe('Edit Collection');
        expect(await CollectionsPage.nameInput.getValue()).toBe(testCollectionName);
    });

    it('should update the collection name after editing', async () => {
        const card = await CollectionsPage.findCollectionCard(testCollectionName);
        const editBtn = await card!.$('.btn-sm*=Edit');
        await editBtn.click();
        await CollectionsPage.modal.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.nameInput.clearValue();
        await CollectionsPage.nameInput.setValue(editedCollectionName);
        await CollectionsPage.saveButton.waitForClickable({ timeout: 3000 });
        await CollectionsPage.saveButton.click();
        await browser.waitUntil(
            async () => !(await $('.modal').isExisting()),
            { timeout: 5000, timeoutMsg: 'Edit modal did not close after saving' }
        );
        await browser.waitUntil(
            async () => (await CollectionsPage.findCollectionCard(editedCollectionName)) !== null,
            { timeout: 5000, timeoutMsg: `Renamed collection "${editedCollectionName}" not found in grid` }
        );
    });

    // ─── Delete collection ─────────────────────────────────────────────────────

    it('should open a delete confirmation dialog', async () => {
        const card = await CollectionsPage.findCollectionCard(editedCollectionName);
        expect(card).not.toBeNull();
        const deleteBtn = await card!.$('.btn-danger');
        await deleteBtn.waitForClickable({ timeout: 5000 });
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmModal.waitForDisplayed({ timeout: 5000 });
        expect(await CollectionsPage.deleteConfirmModal.isDisplayed()).toBe(true);
    });

    it('should keep the collection when delete is cancelled', async () => {
        const card = await CollectionsPage.findCollectionCard(editedCollectionName);
        const deleteBtn = await card!.$('.btn-danger');
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmModal.waitForDisplayed({ timeout: 5000 });
        const cancelBtn = await CollectionsPage.deleteConfirmModal.$('.btn-secondary');
        await cancelBtn.click();
        await browser.waitUntil(
            async () => !(await $('.modal-sm').isExisting()),
            { timeout: 5000, timeoutMsg: 'Delete confirm modal did not close after Cancel' }
        );
        expect(await CollectionsPage.findCollectionCard(editedCollectionName)).not.toBeNull();
    });

    it('should remove the collection from the grid after deleting', async () => {
        const card = await CollectionsPage.findCollectionCard(editedCollectionName);
        const deleteBtn = await card!.$('.btn-danger');
        await deleteBtn.click();
        await CollectionsPage.deleteConfirmModal.waitForDisplayed({ timeout: 5000 });
        await CollectionsPage.confirmDeleteButton.click();
        await browser.waitUntil(
            async () => !(await $('.modal-sm').isExisting()),
            { timeout: 5000, timeoutMsg: 'Delete confirm modal did not close after deletion' }
        );
        await browser.waitUntil(
            async () => (await CollectionsPage.findCollectionCard(editedCollectionName)) === null,
            { timeout: 5000, timeoutMsg: `Collection "${editedCollectionName}" still visible after deletion` }
        );
        testCollectionId = null;
    });
});

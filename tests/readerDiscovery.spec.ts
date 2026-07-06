import { test, expect } from '@playwright/test'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test.describe('Reader Discovery (Oracle) Component', () => {
    const mockArchetype = {
        readerArchetype: {
            title: 'The Cybernetic Philosopher',
            description:
                'You seek systems, structures, and the ghostly souls within the machine.',
        },
        recommendations: [
            {
                title: 'Do Androids Dream of Electric Sheep?',
                author: 'Philip K. Dick',
                publishedYear: '1968',
                matchReason:
                    'Explores the boundaries of empathy and synthetic life.',
                coverImageUrl: 'https://example.com/androids.jpg',
            },
        ],
    }

    test.beforeEach(async ({ page }) => {
        await page.goto('/oracle')
    })

    test('Validates input length and appends Quick Vibe tags correctly', async ({
        page,
    }) => {
        const inputArea = page.locator('textarea')
        const submitButton = page.getByRole('button', {
            name: 'Reveal My Archetype',
        })

        await expect(submitButton).toBeDisabled()

        await inputArea.fill('Too short')
        await expect(page.getByText('9/15 characters minimum')).toBeVisible()
        await expect(submitButton).toBeDisabled()

        await page.getByRole('button', { name: '+ Plot-Driven' }).click()

        await expect(inputArea).toHaveValue(
            'Too short, looking for a plot-driven story with twists',
        )
        await expect(submitButton).toBeEnabled()
        await expect(
            page.locator('span:has-text("characters minimum")'),
        ).toHaveClass(/text-green-600/)
    })

    test('Navigates the full pipeline: Input -> Loading -> Results', async ({
        page,
    }) => {
        await page.route('**/api/books/reader-discovery', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockArchetype),
            })
        })

        await page
            .locator('textarea')
            .fill('I want a story about robots and the meaning of life.')
        await page.getByRole('button', { name: 'Reveal My Archetype' }).click()

        await expect(page.getByText('The Literary Oracle')).not.toBeVisible()

        await expect(
            page.getByRole('heading', { name: 'The Cybernetic Philosopher' }),
        ).toBeVisible()
        await expect(
            page.getByText('Do Androids Dream of Electric Sheep?'),
        ).toBeVisible()
        await expect(page.getByText('By Philip K. Dick • 1968')).toBeVisible()
    })

    test('Saves archetype securely to local storage journal', async ({
        page,
    }) => {
        await page.route('**/api/books/reader-discovery', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockArchetype),
            })
        })

        await page
            .locator('textarea')
            .fill('This is a sufficiently long string to pass validation.')
        await page.getByRole('button', { name: 'Reveal My Archetype' }).click()
        await expect(
            page.getByRole('heading', { name: 'The Cybernetic Philosopher' }),
        ).toBeVisible()

        await page.getByRole('button', { name: 'Save to Journal' }).click()

        await expect(
            page.getByText('Archetype securely saved to your local journal.'),
        ).toBeVisible()

        const journalData = await page.evaluate(() =>
            window.localStorage.getItem('oracle_journal'),
        )
        expect(journalData).toBeTruthy()
        expect(journalData).toContain('The Cybernetic Philosopher')
    })

    test('Recovers gracefully if the Oracle API fails', async ({ page }) => {
        await page.route('**/api/books/reader-discovery', async route => {
            await route.fulfill({ status: 500 })
        })

        await page
            .locator('textarea')
            .fill('This is a sufficiently long string to pass validation.')
        await page.getByRole('button', { name: 'Reveal My Archetype' }).click()

        await expect(
            page.getByText(
                'The Oracle is currently clouded. Please try again later.',
            ),
        ).toBeVisible()
        await expect(page.locator('textarea')).toBeVisible()
    })
})

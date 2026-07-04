import { test, expect } from '@playwright/test'

test.describe('Home / Storefront Component', () => {
    const mockCategories = [
        { id: 1, type: 'Technology' },
        { id: 2, type: 'Architecture' },
    ]
    const mockAuthors = [{ id: 1, name: 'Robert', lastName: 'Martin' }]
    const mockBooks = {
        content: [
            {
                id: 'b1',
                title: 'Clean Code',
                price: 45.99,
                authors: mockAuthors,
                categories: [mockCategories[0]],
            },
        ],
        totalPages: 1,
    }

    test('Loads the default storefront and displays books, categories, and hero', async ({
        page,
    }) => {
        await page.route('**/api/categories', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockCategories),
            })
        })
        await page.route('**/api/authors', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockAuthors),
            })
        })

        await page.route(/.*\/api\/books(\?.*)?$/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks),
            })
        })

        await page.goto('/')

        await expect(
            page.getByRole('heading', { name: /Curated\s*Literature\./i }),
        ).toBeVisible()

        await expect(
            page.getByRole('button', { name: 'Technology' }),
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Architecture' }),
        ).toBeVisible()

        await expect(page.getByText('Clean Code')).toBeVisible()
        await expect(page.getByText('Robert Martin')).toBeVisible()
        await expect(page.getByText('$45.99')).toBeVisible()
    })

    test('Navigating with an active search query displays the search indicator and allows clearing', async ({
        page,
    }) => {
        await page.route('**/api/categories', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockCategories),
            })
        })
        await page.route('**/api/authors', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockAuthors),
            })
        })

        await page.route(/.*\/api\/books\/search.*/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks),
            })
        })

        await page.goto('/?search=Clean')

        await expect(page.getByText('Search Results For:')).toBeVisible()
        await expect(page.getByText('"Clean"')).toBeVisible()

        await page.click('button:has-text("Clear Search")')
        await expect(page).not.toHaveURL(/.*search=Clean.*/)
    })

    test('Displays the empty state when no books match the configuration', async ({
        page,
    }) => {
        await page.route('**/api/categories', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockCategories),
            })
        })
        await page.route('**/api/authors', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockAuthors),
            })
        })

        await page.route(/.*\/api\/books.*/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ content: [], totalPages: 0 }),
            })
        })

        await page.goto('/')

        await expect(
            page.getByText('No titles matching this configuration.'),
        ).toBeVisible()
    })

    test('Switching to the Authors view renders the author grid', async ({
        page,
    }) => {
        await page.route('**/api/categories', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockCategories),
            })
        })
        await page.route('**/api/authors', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockAuthors),
            })
        })
        await page.route(/.*\/api\/books.*/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks),
            })
        })

        await page.goto('/?view=authors')

        await expect(
            page.getByRole('heading', { name: 'Our Authors' }),
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Robert Martin' }),
        ).toBeVisible()
        await expect(page.getByText('Contributor')).toBeVisible()
    })
})

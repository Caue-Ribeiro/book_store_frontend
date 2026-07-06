import { test, expect } from '@playwright/test'

test.describe('Author Details Component', () => {
    const mockAuthor = { id: 1, name: 'Martin', lastName: 'Fowler' }
    const mockWiki = {
        title: 'Martin Fowler',
        description: 'British software developer',
        extract:
            'Martin Fowler is a British software developer, author and international public speaker on software architecture.',
        originalimage: { source: 'https://example.com/fowler-image.jpg' },
        content_urls: {
            desktop: { page: 'https://en.wikipedia.org/wiki/Martin_Fowler' },
        },
    }
    const mockBooks = {
        content: [
            {
                id: 'b1',
                title: 'Refactoring',
                price: 55.99,
                authors: [mockAuthor],
            },
            {
                id: 'b2',
                title: 'Clean Architecture',
                price: 45.99,
                authors: [{ id: 2, name: 'Robert', lastName: 'Martin' }],
            },
        ],
    }

    test('Loads author profile, Wikipedia summary, and filters their specific books', async ({
        page,
    }) => {
        await page.route(/.*\/api\/authors\/1$/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockAuthor),
            })
        })

        await page.route(/.*\/api\/authors\/summary.*/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockWiki),
            })
        })

        await page.route('**/api/books/list', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks),
            })
        })

        await page.goto('/authors/1')

        await expect(
            page.getByRole('heading', { name: 'Martin Fowler', level: 1 }),
        ).toBeVisible()

        await expect(
            page.getByText('British software developer', { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByText('international public speaker'),
        ).toBeVisible()

        const externalLink = page.getByRole('link', {
            name: /Read full article on Wikipedia/i,
        })
        await expect(externalLink).toHaveAttribute(
            'href',
            'https://en.wikipedia.org/wiki/Martin_Fowler',
        )

        await expect(page.getByText('1 Title Available')).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Refactoring' }),
        ).toBeVisible()
        await expect(page.getByText('Clean Architecture')).not.toBeVisible()
    })

    test('Displays fallback UI when Wikipedia data is missing and author has no books', async ({
        page,
    }) => {
        const fallbackAuthor = { id: 3, name: 'Jane', lastName: 'Austen' }

        await page.route(/.*\/api\/authors\/3$/, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(fallbackAuthor),
            })
        })

        await page.route(/.*\/api\/authors\/summary.*/, async route => {
            await route.fulfill({ status: 404 })
        })

        await page.route('**/api/books/list', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks),
            })
        })

        await page.goto('/authors/3')

        await expect(
            page.getByRole('heading', { name: 'Jane Austen', level: 1 }),
        ).toBeVisible()

        await expect(page.getByText('No Image Available')).toBeVisible()
        await expect(
            page.getByText(
                'Detailed biographical summary is currently unavailable for this author.',
            ),
        ).toBeVisible()
        await expect(
            page.getByText('No works currently in stock for this author.'),
        ).toBeVisible()
    })

    test('Displays the error state when the primary author API fails', async ({
        page,
    }) => {
        await page.route(/.*\/api\/authors\/999$/, async route => {
            await route.fulfill({ status: 500 })
        })

        await page.goto('/authors/999')

        await expect(
            page.getByText(
                'Failed to load author profile. They may not exist in our records.',
            ),
        ).toBeVisible()
        await expect(
            page.getByRole('link', { name: 'Return to Catalog' }),
        ).toBeVisible()
    })
})

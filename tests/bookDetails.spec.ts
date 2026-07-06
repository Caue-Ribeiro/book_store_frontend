import { test, expect } from '@playwright/test'

test.describe('Book Details Component', () => {
    const mockBook = {
        id: 'b123',
        title: 'Design Patterns',
        isbn: 9780201633610,
        releaseDate: '1994-10-31',
        stock: 5,
        price: 59.99,
        description: 'A classic software engineering book.',
        coverImageUrl: 'https://example.com/cover.jpg',
        authors: [{ id: 1, name: 'Erich', lastName: 'Gamma' }],
        categories: [{ id: 1, type: 'Software Engineering' }],
    }

    const outOfStockBook = {
        ...mockBook,
        id: 'b124',
        stock: 0,
    }

    test('Loads and displays complete book details successfully', async ({
        page,
    }) => {
        await page.route('**/api/books/b123', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBook),
            })
        })

        await page.goto('/books/b123')

        await expect(
            page.getByRole('heading', { name: 'Design Patterns', level: 1 }),
        ).toBeVisible()
        await expect(page.getByText('By Erich Gamma')).toBeVisible()
        await expect(
            page.getByText('Software Engineering', { exact: true }),
        ).toBeVisible()

        await expect(page.getByText('$59.99')).toBeVisible()
        await expect(page.getByText('In Stock (5)')).toBeVisible()

        await expect(page.getByText('9780201633610')).toBeVisible()
        await expect(page.getByText('1994-10-31')).toBeVisible()

        const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' })
        await expect(addToCartBtn).toBeVisible()
        await expect(addToCartBtn).toBeEnabled()
    })

    test('Displays "Out of Stock" and disables the Add to Cart button when stock is 0', async ({
        page,
    }) => {
        await page.route('**/api/books/b124', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(outOfStockBook),
            })
        })

        await page.goto('/books/b124')

        await expect(
            page.getByText('Out of Stock', { exact: true }),
        ).toBeVisible()

        const soldOutBtn = page.getByRole('button', { name: 'Sold Out' })
        await expect(soldOutBtn).toBeVisible()
        await expect(soldOutBtn).toBeDisabled()
    })

    test('Redirects to login when an unauthenticated user clicks Add to Cart', async ({
        page,
    }) => {
        await page.route('**/api/books/b123', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBook),
            })
        })

        await page.goto('/books/b123')

        await page.getByRole('button', { name: 'Add to Cart' }).click()

        await expect(page).toHaveURL(/.*login/)
    })

    test('Displays the 404 error state when the book is not found', async ({
        page,
    }) => {
        await page.route('**/api/books/999', async route => {
            await route.fulfill({ status: 404 })
        })

        await page.goto('/books/999')

        await expect(
            page.getByRole('heading', { name: 'Book not found.' }),
        ).toBeVisible()
        await expect(
            page.getByRole('link', { name: 'Return to Catalog' }),
        ).toBeVisible()
    })
})

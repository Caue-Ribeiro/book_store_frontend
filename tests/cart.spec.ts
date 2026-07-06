import { test, expect } from '@playwright/test'

test.describe('Cart Component & AI Judger', () => {
    const mockUser = { id: 'user-789', name: 'Cauê', role: 'CLIENT' }

    const mockCartItem = {
        bookId: 'book-clean',
        title: 'Clean Code',
        quantity: 1,
        price: 50.0,
        subTotal: 50.0,
        coverImageUrl: 'https://example.com/clean.jpg',
    }

    const mockCart = {
        id: 'order-123',
        status: 'CART',
        total: 50.0,
        items: [mockCartItem],
    }

    const mockJudgment = {
        judgment:
            'Oh, look, another software engineer reading Clean Code. Groundbreaking.',
        better_suggestions: ['The Mythical Man-Month', 'Gödel, Escher, Bach'],
    }

    test.beforeEach(async ({ page }) => {
        await page.route('**/api/**', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                })
                return
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            })
        })

        await page.route('**/authenticate', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: 'mock-token',
                    id: mockUser.id,
                    name: mockUser.name,
                    role: mockUser.role,
                }),
            })
        })

        await page.goto('/login')
        await page.fill('input[type="email"]', 'user@eruditus.dev')
        await page.fill('input[type="password"]', 'Password123!')
        await page.click('button[type="submit"]')

        await expect(page).toHaveURL('http://localhost:5173/')
    })

    test('Renders empty cart state with redirection link', async ({ page }) => {
        await page.route(
            `**/api/orders/users/${mockUser.id}/cart`,
            async route => {
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'No cart found' }),
                })
            },
        )

        await page.locator('a[href="/cart"]').first().click()

        await expect(
            page.getByRole('heading', { name: 'Your Cart', level: 1 }),
        ).toBeVisible()
        await expect(
            page.getByText('Your cart is currently empty.'),
        ).toBeVisible()
        await expect(
            page.getByRole('link', { name: 'Continue Shopping' }),
        ).toBeVisible()
    })

    test('Displays items, allows item mutation, and processes quantity adjustment', async ({
        page,
    }) => {
        let callCount = 0

        await page.route(
            `**/api/orders/users/${mockUser.id}/cart`,
            async route => {
                if (callCount === 0) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(mockCart),
                    })
                } else {
                    const updatedCart = {
                        ...mockCart,
                        total: 100.0,
                        items: [
                            { ...mockCartItem, quantity: 2, subTotal: 100.0 },
                        ],
                    }
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify(updatedCart),
                    })
                }
                callCount++
            },
        )

        await page.route(
            `**/api/orders/users/${mockUser.id}/cart/items/book-clean?quantity=1`,
            async route => {
                expect(route.request().method()).toBe('POST')
                await route.fulfill({ status: 200 })
            },
        )

        await page.locator('a[href="/cart"]').first().click()

        await expect(
            page.getByRole('link', { name: 'Clean Code' }),
        ).toBeVisible()
        await expect(page.getByText('$50.00 each')).toBeVisible()
        await expect(page.locator('span:has-text("1")')).toBeVisible()

        await page.click('button:has(svg.lucide-plus)')

        await expect(page.locator('span:has-text("2")')).toBeVisible()
        await expect(page.getByText('$100.00').first()).toBeVisible()
    })

    test('Proceeds to checkout and redirects to internal/external payment gateway', async ({
        page,
    }) => {
        await page.route(
            `**/api/orders/users/${mockUser.id}/cart`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockCart),
                })
            },
        )

        await page.route(
            `**/api/orders/users/${mockUser.id}/checkout`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        checkoutUrl:
                            'https://checkout.stripe.com/mock-pay-session-xyz',
                    }),
                })
            },
        )

        await page.locator('a[href="/cart"]').first().click()

        await page.click('button:has-text("Proceed to Checkout")')

        await page.waitForURL('https://checkout.stripe.com/**')
    })

    test('Executes full AI Book Judger wizard modal pipeline', async ({
        page,
    }) => {
        await page.route(
            `**/api/orders/users/${mockUser.id}/cart`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockCart),
                })
            },
        )

        await page.route(
            `**/api/orders/order-choice-judger/${mockUser.id}`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockJudgment),
                })
            },
        )

        await page.locator('a[href="/cart"]').first().click()

        await page.click('button:has-text("Judge My Choices")')

        await expect(
            page.getByRole('heading', {
                name: 'Are you sure you want to be teased for free?',
            }),
        ).toBeVisible()

        await page.click('button:has-text("Yes, Roast Me")')

        await expect(
            page.getByRole('heading', { name: 'The Verdict' }),
        ).toBeVisible()
        await expect(page.getByText(mockJudgment.judgment)).toBeVisible()
        await expect(
            page.getByText('What you SHOULD be reading instead:'),
        ).toBeVisible()
        await expect(page.getByText('The Mythical Man-Month')).toBeVisible()
    })
})

import { test, expect, Page } from '@playwright/test'

test.describe('Orders Component', () => {
    const mockUser = { id: 'user-789', name: 'Standard User', role: 'CLIENT' }

    const mockOrderItems = [
        {
            bookId: 'b1',
            title: 'Clean Architecture',
            quantity: 1,
            price: 45.0,
            subTotal: 45.0,
            coverImageUrl: 'https://example.com/arch.jpg',
        },
    ]

    const mockOrders = [
        {
            id: 'ORD-001',
            moment: '2026-10-20T14:30:00Z',
            status: 'AWAITING_PAYMENT',
            total: 45.0,
            items: mockOrderItems,
        },
        {
            id: 'ORD-002',
            moment: '2026-10-15T09:15:00Z',
            status: 'PAID',
            total: 90.0,
            items: [{ ...mockOrderItems[0], quantity: 2, subTotal: 90.0 }],
        },
    ]

    async function navigateToOrders(page: Page) {
        await page.evaluate(() => {
            window.history.pushState({}, '', '/orders')
            window.dispatchEvent(new Event('popstate'))
        })
    }

    async function navigateToOrders1(page: Page) {
        await page.evaluate(() => {
            window.history.pushState({}, '', '/orders')
            window.dispatchEvent(new Event('popstate'))
        })

        await expect(
            page.getByRole('heading', { name: 'Order History', level: 1 }),
        ).toBeVisible()
    }

    test.beforeEach(async ({ page }) => {
        await page.route('**/authenticate', async route => {
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

    test('Renders the empty state when the user has no order history', async ({
        page,
    }) => {
        await page.route(`**/api/orders/users/${mockUser.id}`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            })
        })

        await navigateToOrders(page)

        await expect(
            page.getByRole('heading', { name: 'Order History', level: 1 }),
        ).toBeVisible()
        await expect(
            page.getByText("You haven't placed any orders yet."),
        ).toBeVisible()
        await expect(
            page.getByRole('link', { name: 'Start Shopping' }),
        ).toBeVisible()
    })

    test('Displays a list of orders with their correct statuses and conditionally renders action buttons', async ({
        page,
    }) => {
        await page.route(`**/api/orders/users/${mockUser.id}`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockOrders),
            })
        })

        await navigateToOrders(page)

        await expect(page.getByText('ORD-001')).toBeVisible()
        await expect(
            page.getByText('AWAITING PAYMENT', { exact: true }),
        ).toBeVisible()

        await expect(page.getByText('ORD-002')).toBeVisible()
        await expect(page.getByText('PAID', { exact: true })).toBeVisible()

        const payButtons = await page
            .getByRole('button', { name: 'Pay Now' })
            .count()
        const cancelButtons = await page
            .getByRole('button', { name: 'Cancel Order' })
            .count()

        expect(payButtons).toBe(1)
        expect(cancelButtons).toBe(1)
    })

    test('Successfully cancels an order and refreshes the list', async ({
        page,
    }) => {
        let callCount = 0

        await page.route(`**/api/orders/users/${mockUser.id}`, async route => {
            if (callCount === 0) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([mockOrders[0]]),
                })
            } else {
                const canceledOrder = { ...mockOrders[0], status: 'CANCELED' }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([canceledOrder]),
                })
            }
            callCount++
        })

        await page.route(
            `**/api/orders/users/${mockUser.id}/ORD-001/cancel`,
            async route => {
                expect(route.request().method()).toBe('POST')
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Success' }),
                })
            },
        )

        await navigateToOrders1(page)

        await page.getByRole('button', { name: 'Cancel Order' }).click()

        await expect(page.getByText('CANCELED', { exact: true })).toBeVisible()

        await expect(
            page.getByRole('button', { name: 'Pay Now' }),
        ).not.toBeVisible()
    })

    test('Successfully processes a pending payment and redirects to the checkout gateway', async ({
        page,
    }) => {
        await page.route(`**/api/orders/users/${mockUser.id}`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([mockOrders[0]]),
            })
        })

        await page.route(
            `**/api/orders/users/${mockUser.id}/ORD-001/pay`,
            async route => {
                expect(route.request().method()).toBe('POST')
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        checkoutUrl:
                            'https://checkout.stripe.com/mock-retry-session',
                    }),
                })
            },
        )

        await navigateToOrders1(page)

        await page.getByRole('button', { name: 'Pay Now' }).click()
        await page.waitForURL('https://checkout.stripe.com/**')
    })
})

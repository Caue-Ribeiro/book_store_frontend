import { test, expect } from '@playwright/test'

test.describe('Authentication & Recovery Flow', () => {
    test('User can navigate to Forgot Password and request a reset email', async ({
        page,
    }) => {
        await page.route(/.*\/forgot-password\/.*/, async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                })
                return
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Success' }),
            })
        })

        await page.goto('/login')
        await page.click('text="Forgot Password?"')
        await expect(page.locator('h2')).toContainText('Recover Password')
        await page.fill('input[type="email"]', 'test@email.com')
        await page.click('button[type="submit"]')

        await expect(
            page.getByText('Recovery email sent! Please check your inbox.'),
        ).toBeVisible()

        await expect(page).toHaveURL(/.*reset-password/)
    })
})

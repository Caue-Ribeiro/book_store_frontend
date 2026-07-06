import { test, expect } from '@playwright/test'

test.describe('Profile Component', () => {
    const mockUser = { id: 'user-789', name: 'Standard User', role: 'CLIENT' }

    const mockLogs = [
        {
            id: 'log-1',
            action: 'LOGIN_SUCCESS',
            details: 'Successful login from 192.168.1.1',
            timestamp: '2026-10-25T10:00:00Z',
        },
        {
            id: 'log-2',
            action: 'PASSWORD_UPDATED',
            details: 'User updated their password',
            timestamp: '2026-10-24T15:30:00Z',
        },
        {
            id: 'log-3',
            action: 'LOGIN_FAILED',
            details: 'Failed attempt with incorrect password',
            timestamp: '2026-10-24T15:28:00Z',
        },
    ]

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

    test('Loads profile data and audit logs successfully', async ({ page }) => {
        await page.route(
            `**/api/users/${mockUser.id}/audit-logs*`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ content: mockLogs }),
                })
            },
        )

        await page.locator('a[href="/profile"]').first().click()

        await expect(
            page.getByRole('heading', { name: 'My Account', level: 1 }),
        ).toBeVisible()
        await expect(
            page.getByText(`${mockUser.name} • ${mockUser.role}`),
        ).toBeVisible()

        await expect(
            page.getByText('LOGIN SUCCESS', { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByText('LOGIN FAILED', { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByText('Successful login from 192.168.1.1'),
        ).toBeVisible()
    })

    test('Displays error when new passwords do not match', async ({ page }) => {
        await page.route(
            `**/api/users/${mockUser.id}/audit-logs*`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                })
            },
        )

        await page.locator('a[href="/profile"]').first().click()

        const passwordInputs = page.locator('input[type="password"]')

        await passwordInputs.nth(0).fill('NewSecurePass123!')
        await passwordInputs.nth(1).fill('CompletelyDifferent!')

        await page.getByRole('button', { name: 'Update Password' }).click()

        await expect(
            page.getByText('New passwords do not match.', { exact: true }),
        ).toBeVisible()
    })

    test('Successfully updates password and refreshes audit logs', async ({
        page,
    }) => {
        let fetchCount = 0

        await page.route(
            `**/api/users/${mockUser.id}/audit-logs*`,
            async route => {
                if (fetchCount === 0) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([]),
                    })
                } else {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([mockLogs[1]]),
                    })
                }
                fetchCount++
            },
        )

        await page.route(`**/api/users/${mockUser.id}`, async route => {
            expect(route.request().method()).toBe('PATCH')
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Password updated' }),
            })
        })

        await page.locator('a[href="/profile"]').first().click()

        const passwordInputs = page.locator('input[type="password"]')
        await passwordInputs.nth(0).fill('ValidPass123!')
        await passwordInputs.nth(1).fill('ValidPass123!')

        await page.getByRole('button', { name: 'Update Password' }).click()

        await expect(
            page.getByText('Password updated successfully.', { exact: true }),
        ).toBeVisible()
        await expect(passwordInputs.nth(0)).toHaveValue('')

        await expect(
            page.getByText('PASSWORD UPDATED', { exact: true }),
        ).toBeVisible()
    })

    test('Successfully completes the account deletion pipeline', async ({
        page,
    }) => {
        await page.route(
            `**/api/users/${mockUser.id}/audit-logs*`,
            async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                })
            },
        )

        await page.route(`**/api/users/${mockUser.id}`, async route => {
            expect(route.request().method()).toBe('DELETE')
            await route.fulfill({ status: 200 })
        })

        await page.locator('a[href="/profile"]').first().click()

        await page.getByRole('button', { name: 'Delete My Account' }).click()

        await expect(
            page.getByRole('heading', { name: 'Critical Warning' }),
        ).toBeVisible()
        await expect(
            page.getByText(
                'Are you sure you want to permanently delete your account?',
            ),
        ).toBeVisible()

        await page.getByRole('button', { name: 'Yes, Delete' }).click()
    })
})

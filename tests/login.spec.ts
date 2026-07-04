import { test, expect } from '@playwright/test'

test.describe('Login Component', () => {
    test('User can successfully log in and is redirected', async ({ page }) => {
        await page.route('**/authenticate', async route => {
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
                body: JSON.stringify({
                    token: 'mock-jwt-token-12345',
                    id: 'uuid-string',
                    name: 'Admin Eruditus',
                    role: 'ADMIN',
                }),
            })
        })

        await page.goto('/login')

        await page.fill('input[type="email"]', 'admin@bookstore.com')
        await page.fill('input[type="password"]', 'securepassword123')

        await page.click('button[type="submit"]')

        await expect(page).toHaveURL('http://localhost:5173/')
    })

    test('Displays error toast on invalid credentials', async ({ page }) => {
        await page.route('**/authenticate', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                })
                return
            }

            await route.fulfill({ status: 401 })
        })

        await page.goto('/login')

        await page.fill('input[type="email"]', 'wrong@eruditus.dev')
        await page.fill('input[type="password"]', 'badpassword')
        await page.click('button[type="submit"]')

        await expect(page.getByText('Invalid credentials.')).toBeVisible()
    })

    test('Displays specific error when account is locked', async ({ page }) => {
        await page.route('**/authenticate', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                })
                return
            }

            await route.fulfill({
                status: 423,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Account locked due to failed attempts.',
                }),
            })
        })

        await page.goto('/login')

        await page.fill('input[type="email"]', 'hacker@eruditus.dev')
        await page.fill('input[type="password"]', 'bruteforce123')
        await page.click('button[type="submit"]')

        await expect(
            page.getByText('Account locked due to failed attempts.'),
        ).toBeVisible()
    })
})

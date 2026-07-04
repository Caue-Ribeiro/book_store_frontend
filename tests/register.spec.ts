import { test, expect } from '@playwright/test'

test.describe('Register Component', () => {
    test('User can successfully register and is redirected to login', async ({
        page,
    }) => {
        await page.route('**/api/users/register', async route => {
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
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'User registered successfully',
                }),
            })
        })

        await page.goto('/register')

        await page.fill('input[name="name"]', 'John')
        await page.fill('input[name="lastName"]', 'Doe')
        await page.fill('input[name="email"]', 'john.doe@bookstore.com')
        await page.fill('input[name="birthdate"]', '1995-05-15')
        await page.fill('input[name="password"]', 'StrongPass123!')

        await page.click('button[type="submit"]')

        await expect(page).toHaveURL(/.*login/)
    })

    test('Displays specific error for weak password validation (400 Bad Request)', async ({
        page,
    }) => {
        await page.route('**/api/users/register', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                })
                return
            }

            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Password must contain at least one special character.',
                }),
            })
        })

        await page.goto('/register')

        await page.fill('input[name="name"]', 'Jane')
        await page.fill('input[name="lastName"]', 'Doe')
        await page.fill('input[name="email"]', 'jane@eruditus.dev')
        await page.fill('input[name="birthdate"]', '1998-10-20')

        await page.fill('input[name="password"]', 'weakpassword')

        await page.click('button[type="submit"]')

        await expect(
            page.getByText(
                'Password must contain at least one special character.',
            ),
        ).toBeVisible()
    })

    test('Displays generic error message when server fails', async ({
        page,
    }) => {
        await page.route('**/api/users/register', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                })
                return
            }

            await route.fulfill({ status: 500 })
        })

        await page.goto('/register')

        await page.fill('input[name="name"]', 'Error')
        await page.fill('input[name="lastName"]', 'User')
        await page.fill('input[name="email"]', 'error@eruditus.dev')
        await page.fill('input[name="birthdate"]', '2000-01-01')
        await page.fill('input[name="password"]', 'ValidPass123!')

        await page.click('button[type="submit"]')

        await expect(
            page.getByText('Registration failed. Please check your data.'),
        ).toBeVisible()
    })
})

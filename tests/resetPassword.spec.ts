import { test, expect, Page } from '@playwright/test'

test.describe('Reset Password Component', () => {
    const testEmail = 'user@eruditus.dev'

    async function navigateWithState(page: Page) {
        await page.goto('/login')

        await page.evaluate(email => {
            window.history.pushState({ usr: { email } }, '', '/reset-password')
            window.dispatchEvent(new Event('popstate'))
        }, testEmail)

        await expect(
            page.getByRole('heading', { name: 'Create New Password' }),
        ).toBeVisible()
    }

    test('Redirects to /forgot-password if accessed directly without email state', async ({
        page,
    }) => {
        await page.goto('/reset-password')

        await expect(page).toHaveURL(/.*forgot-password/)
    })

    test('Validates password matching dynamically and prevents submission', async ({
        page,
    }) => {
        await navigateWithState(page)

        await expect(
            page.getByText(`Enter the OTP sent to ${testEmail}`),
        ).toBeVisible()

        const passwordInputs = page.locator('input[type="password"]')
        const submitBtn = page.getByRole('button', {
            name: 'Confirm New Password',
        })

        await expect(submitBtn).toBeDisabled()

        await passwordInputs.nth(0).fill('SecurePass123!')
        await passwordInputs.nth(1).fill('WrongPass456!')

        await expect(
            page.getByText('Passwords do not match', { exact: true }),
        ).toBeVisible()
        await expect(submitBtn).toBeDisabled()

        await passwordInputs.nth(1).fill('SecurePass123!')

        await expect(
            page.getByText('Passwords match', { exact: true }),
        ).toBeVisible()
        await expect(submitBtn).toBeEnabled()
    })

    test('Successfully resets password and redirects to login', async ({
        page,
    }) => {
        await page.route('**/reset-password-otp', async route => {
            expect(route.request().method()).toBe('POST')
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 201,
                    message: 'Password reset successful.',
                }),
            })
        })

        await navigateWithState(page)

        await page.getByPlaceholder('XXXXXX').fill('123456')
        const passwordInputs = page.locator('input[type="password"]')
        await passwordInputs.nth(0).fill('NewSecurePass123!')
        await passwordInputs.nth(1).fill('NewSecurePass123!')

        await page.getByRole('button', { name: 'Confirm New Password' }).click()

        await expect(page.getByText('Password reset successful.')).toBeVisible()

        await page.waitForURL(/.*login/)
    })

    test('Handles invalid OTP and redirects back to forgot-password', async ({
        page,
    }) => {
        await page.route('**/reset-password-otp', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',

                body: JSON.stringify({
                    status: 400,
                    message: 'Invalid or expired OTP.',
                }),
            })
        })

        await navigateWithState(page)

        await page.getByPlaceholder('XXXXXX').fill('000000') // Wrong OTP
        const passwordInputs = page.locator('input[type="password"]')
        await passwordInputs.nth(0).fill('NewSecurePass123!')
        await passwordInputs.nth(1).fill('NewSecurePass123!')

        await page.getByRole('button', { name: 'Confirm New Password' }).click()

        await expect(page.getByText('Invalid or expired OTP.')).toBeVisible()

        await page.waitForURL(/.*forgot-password/)
    })
})

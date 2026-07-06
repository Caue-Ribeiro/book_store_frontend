import { test, expect } from '@playwright/test'

test.describe('Book Events Component', () => {
    const mockEvents = [
        {
            id: 1,
            name: 'Autumn Author Meetup',

            startDate: '2026-10-15T12:00:00Z',
            endDate: '2026-10-16T12:00:00Z',
            description:
                'Join us for a cozy weekend of book readings and signings.',
        },
        {
            id: 2,
            name: 'Winter Coding Workshop',
            startDate: '2026-12-01T12:00:00Z',
            endDate: '2026-12-05T12:00:00Z',
            description: 'Intensive 5-day tech and literature workshop.',
        },
    ]

    test('Loads and correctly formats a list of scheduled events', async ({
        page,
    }) => {
        await page.route('**/api/books/events', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockEvents),
            })
        })

        await page.goto('/events')

        await expect(
            page.getByRole('heading', { name: 'Literary Calendar', level: 1 }),
        ).toBeVisible()

        const expectedStartDate = new Date(
            mockEvents[0].startDate,
        ).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })

        const expectedEndDate = new Date(
            mockEvents[0].endDate,
        ).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })

        await expect(
            page.getByRole('heading', {
                name: 'Autumn Author Meetup',
                level: 2,
            }),
        ).toBeVisible()
        await expect(
            page.getByText(
                'Join us for a cozy weekend of book readings and signings.',
            ),
        ).toBeVisible()
        await expect(
            page.getByText(expectedStartDate, { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByText(expectedEndDate, { exact: true }),
        ).toBeVisible()

        await expect(
            page.getByRole('heading', {
                name: 'Winter Coding Workshop',
                level: 2,
            }),
        ).toBeVisible()
    })

    test('Displays the empty state when no events are returned', async ({
        page,
    }) => {
        await page.route('**/api/books/events', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            })
        })

        await page.goto('/events')

        await expect(
            page.getByText('No upcoming events are currently scheduled.', {
                exact: true,
            }),
        ).toBeVisible()

        await expect(
            page.getByRole('heading', {
                name: 'Autumn Author Meetup',
                level: 2,
            }),
        ).not.toBeVisible()
    })

    test('Displays custom error message when the API fails', async ({
        page,
    }) => {
        await page.route('**/api/books/events', async route => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'Database connection timeout.',
                }),
            })
        })

        await page.goto('/events')

        await expect(
            page.getByText('Database connection timeout.', { exact: true }),
        ).toBeVisible()
    })

    test('Displays fallback error message on generic network failure', async ({
        page,
    }) => {
        await page.route('**/api/books/events', async route => {
            await route.abort('failed')
        })

        await page.goto('/events')

        await expect(
            page.getByText('Failed to load upcoming events.', { exact: true }),
        ).toBeVisible()
    })
})

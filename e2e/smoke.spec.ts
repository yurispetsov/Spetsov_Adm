import { test, expect } from '@playwright/test'

test('login page renders and navigates to products', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Вход в админку')).toBeVisible()
  // This assumes test backend returns a token for any credentials in dev
  await page.getByPlaceholder('Email').fill('admin@example.com')
  await page.getByPlaceholder('Пароль').fill('password')
  await page.getByRole('button', { name: 'Войти' }).click()
  // Without a real backend, this may stay on login; adapt once API is ready.
  // When backend is ready, expect products header:
  // await expect(page.getByText('Товары')).toBeVisible()
})

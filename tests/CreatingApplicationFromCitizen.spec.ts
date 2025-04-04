import { test, expect } from '@playwright/test';

const citizenUser = {
    username: "yakkabogʻ_mfy_1",
    password: "qweasdzxc"
}


test.describe("Creating Applicatio From Citizen", () => {
    test("dd", async ({ page, request }) => {
        await page.goto("/login")
        await page.getByRole('textbox', { name: '*Login' }).fill(citizenUser.username);
        await page.getByRole('textbox', { name: '*Password' }).fill(citizenUser.password);
        await page.getByRole('button', { name: 'Kirish' }).click();

        // await page.getByText("Arizani yaratish").click()
        await page.getByRole('button', { name: 'Ariza yaratish' }).click();
        await page.getByText('HAJ SAFARIGA RO’YHATDAN O’TISH').click();
        await page.pause()

        // await page.getByRole('button', { name: 'el.messagebox.close' }).click();
    })

})



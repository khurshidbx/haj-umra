import { test, expect } from "@playwright/test"
import path from "node:path"
import { faker } from "@faker-js/faker";

const administration = {
    username: "administratsiya",
    password: "qweasdzxc"
}
test.describe("Vedeo qo'llanma page", () => {
     test.beforeEach("Login as administration role", async ({ page }) => {
        await page.goto("/login")
        await page.getByRole('textbox', { name: '*Login' }).fill(administration.username);
        await page.getByRole('textbox', { name: '*Password' }).fill(administration.password);
        await page.getByRole('button', { name: 'Kirish' }).click();

    })
    test("Uploading mp4, mov, avi format vedeos", async ({ page, request }) => {
        test.setTimeout(50000)
        // Getting access token 
        const loginResponse = await page.waitForResponse("/api/user/login/");
        const loginResponseBody = await loginResponse.json()
        const access_token = loginResponseBody.access
        console.log(await loginResponse.json());

        // Uploading file
        await page.getByText("Boshqaruv").click();
        await page.getByText("Video qo'llanmalar").click();
        await page.locator('div').filter({ hasText: /^Video qo'llanmalar O'zbek$/ }).getByRole('img').click();
        await page.getByRole('option', { name: 'O\'zbek' }).click();
        await page.getByRole('button', { name: 'Video qo’shish' }).click();
        const modalTitle = page.getByRole('heading', { name: 'Video qo\'llanma yaratish' });
        await expect.soft(modalTitle).toHaveText("Video qo'llanma yaratish");
        await page.getByRole('textbox', { name: '*Qo’llanma nomi' }).click();

        const tutorialName = faker.lorem.words(3);
        console.log(tutorialName);
        await page.getByRole('textbox', { name: '*Qo’llanma nomi' }).fill(tutorialName);
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByText('Yuklash uchun bosingyoki').click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join(__dirname, 'city_cars.mp4'));
        const selectedVideoName = page.getByText('city_cars.mp4');
        await expect.soft(selectedVideoName).toContainText('city_cars.mp4')
        await page.getByRole('button', { name: 'Saqlash' }).click();
        // await page.waitForTimeout(11000)
        const uploadTutorial = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/tutorial/")
        const uploadTutorialBody = await uploadTutorial.json()
        console.log(uploadTutorialBody);
        const uploadedTutorialId = uploadTutorialBody.id
        expect.soft(uploadTutorial.status()).toEqual(201)
        await page.locator('#notification_1').click();
        const succesModalText = page.getByText('Muvaffaqiyatli yuklandi');
        await expect.soft(succesModalText).toContainText("Muvaffaqiyatli yuklandi")
    

        // await page.locator('.video-player').first().click();
        // const videoLocator = page.locator(`//div[contains(@class,'flex gap-5')]//video[1]`)
        // await videoLocator.evaluate((video: HTMLVideoElement) => video.play());
       
        // console.log("Video is playing");
        // await page.waitForTimeout(3000);

        // await page.locator("//div[contains(@class,'flex gap-5')]//button[1]").click()

        // Edit 
        await page.locator('.edit').first().click();
        const modalEditTitle = page.getByRole('heading', { name: 'Video qo\'llanmani tahrirlash' });
        await expect.soft(modalEditTitle).toHaveText("Video qo'llanmani tahrirlash");
        await page.getByRole('textbox', { name: '*Qo’llanma nomi' }).click();
        await page.getByRole('textbox', { name: '*Qo’llanma nomi' }).fill(tutorialName);


        const fileChooserPromiseEdit = page.waitForEvent('filechooser');
        await page.getByText('Yuklash uchun bosing').click();
        const fileChooserEdit = await fileChooserPromiseEdit;
        await fileChooserEdit.setFiles(path.join(__dirname, 'randomMMOOVV.mov'));
        const selectedVideoNameEdit = page.getByText('randomMMOOVV.mov');
        await expect.soft(selectedVideoNameEdit).toContainText('randomMMOOVV.mov')

        await page.getByRole('button', { name: 'Saqlash' }).click();
        // await page.waitForTimeout(11000)
        const succesModalText2 = page.getByText('Muvaffaqiyatli yuklandi');
        await expect.soft(succesModalText2).toContainText("Muvaffaqiyatli yuklandi")
        

        // Delete by BUTTON 
        await page.locator('.delete').first().click();
        await page.getByRole('tooltip', { name: 'Video qo\'llanmani o\'' }).getByRole('paragraph').click();
        await page.getByRole('button', { name: 'Ha', exact: true }).click();


        // Delete By Api
        // const response = await request.delete(`https://haj-umra.rx.unicon.uz/api/tutorial/${uploadedTutorialId}/`, {
        //     headers: {
        //         Authorization: `Bearer ${access_token}`
        //     }
        // })
        // expect(response.status()).toEqual(204)
        // await page.reload()
    })
})
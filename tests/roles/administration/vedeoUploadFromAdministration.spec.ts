import { test, expect } from "@playwright/test";
import path from "node:path";
import { faker } from "@faker-js/faker";
import authenticateUser from "../../../utils/utils.spec.ts"



const userObj = {
    username: "administratsiya",
    password: "qweasdzxc",
    role: "Super Admin"
};

type UserInfo = {
    first_name: string;
    middle_name: string;
    last_name: string;
    pinfl: string;
    passport_serial: string;
}

test.describe("Video Management Tests", () => {
    let access_token: string;
    let uploadedTutorialId: string;
    const tutorialName = faker.lorem.words(3);
    const editedTutorialName = faker.lorem.words(3);
    let context;
    let page;
    let userInfo 


    test.beforeAll(async ({ browser }) => {
        const authResult = await authenticateUser(browser, userObj.username, userObj.password, userObj.role);
        context = authResult.context;
        page = authResult.page;
        access_token = authResult.accessToken;
        userInfo = authResult.userInfo;

    });


    test("Upload a video", async () => {

        const videoFile = "city_cars.mp4";

        // Navigate to video management
        await page.getByText("Boshqaruv").click();
        await page.getByText("Video qo'llanmalar").click();
        await page.getByRole("button", { name: "Video qo’shish" }).click();

        // Fill in tutorial details
        await page.getByRole("textbox", { name: "*Qo’llanma nomi" }).fill(tutorialName);
        console.log(tutorialName);



        // Upload video
        const fileChooserPromise = page.waitForEvent("filechooser");
        await page.getByText("Yuklash uchun bosing").click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join(__dirname, videoFile));


        // Asserting by video name in the modal
        const selectedVideoName = page.getByText('city_cars.mp4');
        await expect.soft(selectedVideoName).toContainText('city_cars.mp4')

        // Save video
        await page.getByRole("button", { name: "Saqlash" }).click();

        // Get uploaded tutorial ID
        const uploadTutorial = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/tutorial/");
        const uploadTutorialBody = await uploadTutorial.json();
        uploadedTutorialId = uploadTutorialBody.id;
        console.log("Uploaded Tutorial ID:", uploadedTutorialId);

        expect.soft(uploadTutorial.status()).toEqual(201);

        // Verify success notification 
        const successNotification = page.getByText("Muvaffaqiyatli yuklandi");
        await expect.soft(successNotification).toContainText("Muvaffaqiyatli yuklandi");
    });

    test("Edit a video", async () => {

        const editedVideoFile = "randomMMOOVV.mov";

        // Edit video
        await page.locator('div', { hasText: tutorialName }).locator("button.edit").first().click()
        const modalEditTitle = page.getByRole("heading", { name: "Video qo'llanmani tahrirlash" });

        await expect.soft(modalEditTitle).toHaveText("Video qo'llanmani tahrirlash");
        await page.getByLabel("Qo’llanma nomi").click()
        await page.getByLabel("Qo’llanma nomi").fill('')
        await page.getByLabel("Qo’llanma nomi").fill(editedTutorialName)

        const fileChooserPromiseEdit = page.waitForEvent("filechooser");
        await page.getByText("Yuklash uchun bosing").click();
        const fileChooserEdit = await fileChooserPromiseEdit;
        await fileChooserEdit.setFiles(path.join(__dirname, editedVideoFile));

        await page.getByRole("button", { name: "Saqlash" }).click();

        // Verify success notification
        const successNotification = page.getByText("Muvaffaqiyatli yuklandi");
        await expect(successNotification).toContainText("Muvaffaqiyatli yuklandi");
    });

    test("Delete a video", async () => {
        // Delete video using UI
        await page.locator('div', { hasText: editedTutorialName }).locator("button.delete").first().click()
        await page.locator(".delete").first().click();
        await page.getByRole("tooltip", { name: "Video qo'llanmani o'" }).getByRole("paragraph").click();
        await page.getByRole("button", { name: "Ha", exact: true }).click();

        // Verify deletion (optional)
        console.log("Video deleted successfully.");
    });

    // test.skip("Delete a video using API", async ({ request }) => {
    //     // Delete video using API
    //     const response = await request.delete(`https://haj-umra.rx.unicon.uz/api/tutorial/${uploadedTutorialId}/`, {
    //         headers: {
    //             Authorization: `Bearer ${access_token}`,
    //         },
    //     });

    //     expect(response.status()).toEqual(204);
    //     console.log("Video deleted via API successfully.");
    // });
});
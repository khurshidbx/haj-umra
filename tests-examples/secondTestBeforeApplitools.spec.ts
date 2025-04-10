import { test, expect } from "@playwright/test";
// import { test, expect } from "@applitools/eyes-playwright/fixture"
import path from "node:path";
import { faker } from "@faker-js/faker";
import { assert } from "node:console";

const administration = {
    username: "administratsiya",
    password: "qweasdzxc",
};

// async function login(page) {
//     await page.goto("/login");
//     await page.getByRole("textbox", { name: "*Login" }).fill(administration.username);
//     await page.getByRole("textbox", { name: "*Password" }).fill(administration.password);
//     await page.getByRole("button", { name: "Kirish" }).click();
// }

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

    test.beforeAll(async ({ browser }) => {
        // Create a shared browser context
        context = await browser.newContext();
        page = await context.newPage();


        // Authentication logic starts .... 
        await page.goto("https://haj-umra.rx.unicon.uz/login");
        // await eyes.check("Login Page")
        await page.getByRole("textbox", { name: "*Login" }).fill(administration.username);
        await page.getByRole("textbox", { name: "*Password" }).fill(administration.password);
        await page.getByRole("button", { name: "Kirish" }).click();
        // await eyes.check("Home Page")

        const loginResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/login/")
        const getMeResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/get_me/")

        // Checking /login and /get-me api response status codes  
        expect(loginResponse.status()).toBe(200);
        expect(getMeResponse.status()).toBe(200);

        // Extracting body of responses
        const loginResponseBody = await loginResponse.json()
        const getMeResponseBody = await getMeResponse.json()

        // Logging body 
        console.log(loginResponseBody);
        console.log(getMeResponseBody);

        // Make sure you logged in as administrator
        const userName: string = getMeResponseBody.username
        expect.soft(userName).toEqual("administratsiya")

        // Get access token 
        access_token = loginResponseBody.access;
        console.log("Access Token:", access_token);

        // opening user dashboard
        const userProfileButton = await page.getByRole('button', { name: 'User' })
        userProfileButton.click()

        // extracting values from get-me response body
        const { first_name, last_name, middle_name, passport_serial, pinfl: pinflFromBack } = getMeResponseBody.userinfo

        const fullNameFromBack = `${first_name} ${last_name} ${middle_name}`

        // Checking full name from extracted values
        console.log(fullNameFromBack);


        // Getting text of fullname and matching with back data
        const fullNameInDashboardMenu = await page.locator("div", { hasText: "Super Admin" }).locator("div.text-stone-600.font-semibold")
        await expect(fullNameInDashboardMenu).toBeVisible();
        const fullNameInUI = await fullNameInDashboardMenu.textContent()
        await expect(fullNameFromBack).toEqual(fullNameInUI)

        // Logging ui and back data in the console
        console.log("FullName in UI: ", fullNameInUI);
        console.log("FullName From Back: ", fullNameFromBack);



        const jshshirInUserDashboard = page.locator(":text-is('JSHSHIR: ')");

        // Ensuring the element is visible before interacting
        await expect(jshshirInUserDashboard).toBeVisible();

        // Locate the `span` inside the element and get its text content
        const innerSpan = await jshshirInUserDashboard.locator("span").textContent();
        console.log("JSHSHIR Value In UI:", innerSpan);

        // Aassertion to verify the value
        expect(innerSpan).toEqual(pinflFromBack);
        console.log("JSHSHIR Value From Back:", pinflFromBack);

    });

    test("fake test", async () => {
        await page.getByText("Boshqaruv").click();
        await page.getByText("Video qo'llanmalar").click();
    })



    // test("Upload a video", async () => {

    //     const videoFile = "city_cars.mp4";

    //     // Navigate to video management
    //     await page.getByText("Boshqaruv").click();
    //     await page.getByText("Video qo'llanmalar").click();
    //     await page.getByRole("button", { name: "Video qo’shish" }).click();

    //     // Fill in tutorial details
    //     await page.getByRole("textbox", { name: "*Qo’llanma nomi" }).fill(tutorialName);
    //     console.log(tutorialName);



    //     // Upload video
    //     const fileChooserPromise = page.waitForEvent("filechooser");
    //     await page.getByText("Yuklash uchun bosing").click();
    //     const fileChooser = await fileChooserPromise;
    //     await fileChooser.setFiles(path.join(__dirname, videoFile));


    //     // Asserting by video name in the modal
    //     const selectedVideoName = page.getByText('city_cars.mp4');
    //     await expect.soft(selectedVideoName).toContainText('city_cars.mp4')

    //     // Save video
    //     await page.getByRole("button", { name: "Saqlash" }).click();

    //     // Get uploaded tutorial ID
    //     const uploadTutorial = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/tutorial/");
    //     const uploadTutorialBody = await uploadTutorial.json();
    //     uploadedTutorialId = uploadTutorialBody.id;
    //     console.log("Uploaded Tutorial ID:", uploadedTutorialId);

    //     expect.soft(uploadTutorial.status()).toEqual(201);

    //     // Verify success notification 
    //     const successNotification = page.getByText("Muvaffaqiyatli yuklandi");
    //     await expect.soft(successNotification).toContainText("Muvaffaqiyatli yuklandi");
    // });

    // test("Edit a video", async () => {

    //     const editedVideoFile = "randomMMOOVV.mov";

    //     // Navigate to video management
    //     // await page.getByText("Boshqaruv").click();
    //     // await page.pause()
    //     // const boshqaruv = await page.locator("h2:text-is('Boshqaruv')")
    //     // await expect.soft(boshqaruv).toHaveCount(1)
    //     // await page.getByText("Video qo'llanmalar").click();

    //     // Edit video
    //     // await page.locator("button.edit").nth(0).click();
    //     console.log(tutorialName);
    //     await page.locator('div', { hasText: tutorialName }).locator("button.edit").first().click()
    //     // await page.locator('div').filter({ hasText: /^deinde defessus repellatexplicabo minima collum$/ }).getByRole('button').first().click();
    //     // await page.waitForTimeout(5000)
    //     const modalEditTitle = page.getByRole("heading", { name: "Video qo'llanmani tahrirlash" });

    //     await expect.soft(modalEditTitle).toHaveText("Video qo'llanmani tahrirlash");
    //     await page.getByLabel("Qo’llanma nomi").click()
    //     await page.getByLabel("Qo’llanma nomi").fill('')
    //     await page.getByLabel("Qo’llanma nomi").fill(editedTutorialName)
    //     // await page.getByRole("textbox", { name: tutorialName }).clear()
    //     // await page.pause()

    //     // await page.getByRole("textbox", { name: "*Qo’llanma nomi" }).fill(editedTutorialName);
    //     console.log(editedTutorialName);


    //     const fileChooserPromiseEdit = page.waitForEvent("filechooser");
    //     await page.getByText("Yuklash uchun bosing").click();
    //     const fileChooserEdit = await fileChooserPromiseEdit;
    //     await fileChooserEdit.setFiles(path.join(__dirname, editedVideoFile));

    //     await page.getByRole("button", { name: "Saqlash" }).click();

    //     // Verify success notification
    //     const successNotification = page.getByText("Muvaffaqiyatli yuklandi");
    //     await expect(successNotification).toContainText("Muvaffaqiyatli yuklandi");
    // });

    // test("Delete a video", async () => {

    //     // await page.getByText("Boshqaruv").click();
    //     // await page.getByText("Video qo'llanmalar").click();

    //     // Delete video using UI
    //     await page.locator('div', { hasText: editedTutorialName }).locator("button.delete").first().click()
    //     // await page.locator("div", {hasText: "beatus tendo animus"}).locator("button.delete").click()
    //     await page.locator(".delete").first().click();
    //     await page.getByRole("tooltip", { name: "Video qo'llanmani o'" }).getByRole("paragraph").click();
    //     await page.getByRole("button", { name: "Ha", exact: true }).click();

    //     // Verify deletion (optional)
    //     console.log("Video deleted successfully.");
    // });

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
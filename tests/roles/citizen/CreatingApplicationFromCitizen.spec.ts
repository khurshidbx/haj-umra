import { expect, test } from '@playwright/test';
import { faker } from "@faker-js/faker"
import authenticateUser from '../../../utils/utils.spec';
import handleMaleUser from "../../../utils/maleHandler.spec.ts"
import handleFemaleUser from '../../../utils/femaleHandler.spec.ts';





//  sohil_mfy_1   nurli_yol_mfy_1 nurli_yol_mfy_1

const userObj = {
    username: "majnuntol_mfy_1",
    password: "qweasdzxc",
    role: "Arizachi"
}

function randomOneOrTwo() {
    return Math.random() < 0.5 ? 1 : 2;
}

export const generatePhoneNumber = () => {
    const staticPart = "+99899"; // First 5 digits
    const randomPart = faker.string.numeric(7); // Generate 7 random digits
    return `${staticPart}${randomPart}`;
};

export const generateRandomGmail = () => {
    const randomUsername = faker.internet.userName(); // Generate a random username
    return `${randomUsername.toLowerCase()}@gmail.com`; // Append "@gmail.com"
};





test.describe("citizen role", () => {
    let context: any;
    let page;
    let access_token: string;
    let userInfo: {}
    let send_allowed: boolean

    test.beforeAll("before all", async ({ browser }) => {
        const authResult = await authenticateUser(browser, userObj.username, userObj.password, userObj.role);
        context = authResult.context;
        page = authResult.page;
        access_token = authResult.accessToken;
        userInfo = authResult.userInfo;
    })

    test("Creating application from citizen", async () => {
        const createApplicationButton = await page.getByRole("button", { name: "Ariza yaratish" })
        createApplicationButton.click()


        const checkApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/application/check/")
        const checkApiResponseBody = await checkApiResponse.json()

        // Validate Response status 
        expect.soft(await checkApiResponse.status()).toEqual(200)

        send_allowed = checkApiResponseBody[0]?.send_allowed
        expect.soft(send_allowed, "send_allowed field is missing or undefined in the API response").not.toBeUndefined();

        if (!send_allowed) {
            console.log("This User aleady has  sent application");
            throw new Error("This User aleady has  sent application")
            return
        }

        await page.locator(":text-is('HAJ SAFARIGA RO’YHATDAN O’TISH')").click()
        await page.getByRole("button", { name: "Ortga" }).click()
        await page.getByRole("button", { name: "Ariza yaratish" }).click()
        await page.locator(":text-is('HAJ SAFARIGA RO’YHATDAN O’TISH')").click()


        // validating text "Haj safariga ro’yxatdan o’tish" 
        const headerText = await page.getByText("Haj safariga ro’yxatdan o’tish").textContent()
        expect.soft(headerText).toEqual("Haj safariga ro’yxatdan o’tish ")
        console.log(headerText);

        // validating text "So’rovnoma to’ldirish"
        const proccessTitle = await page.getByText("So’rovnoma to’ldirish").textContent()
        expect.soft(proccessTitle).toEqual("So’rovnoma to’ldirish")
        console.log(proccessTitle);

        // validating personal_data response
        const personalDataApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/personal_data/")
        expect.soft(await personalDataApiResponse.status()).toEqual(200)
        const personalDataApiResponseBody = await personalDataApiResponse.json()

        // validating JSHSHIR
        const jshshirInUserHeaderData = await page.locator("span", { hasText: "JSHSHIR" }).nth(0)
        await expect.soft(jshshirInUserHeaderData).toContainText(personalDataApiResponseBody.pinfl)

        // validating passport 
        const passportInUserHeaderData = await page.locator("span", { hasText: "PASPORT" }).nth(0)
        await expect.soft(passportInUserHeaderData).toContainText(personalDataApiResponseBody.passport_serial)

      
        // validating gender 
        const userGender = personalDataApiResponseBody.gender
        let exactUserGender;
        if (userGender === "m") {
            exactUserGender = "Erkak"
            await handleMaleUser(page, personalDataApiResponseBody, exactUserGender)
        } else if (userGender === "f") {
            exactUserGender = "Ayol"
            await handleFemaleUser(page, personalDataApiResponseBody, exactUserGender)
        } else {
            throw new Error("Gender is not valid data")
        }











        // await page.locator("flex-1 h-[100px] gap-[9.5px] flex flex-col", { hasText: "Talabgor" }).click()
        // await page.locator("button", {hasText: "Ortga"}).click()
        // await page.getByRole("button", { name: "Ortga" }).click()
        // const userHeaderData = await page.locator("div.flex-1", { hasText: "Talabgor" }).nth(2)

        // await expect(userHeaderData).toBeVisible()
        // await page.getByText("JSHSHIR: 36512436045727").textContent()
        // await userHeaderData.toBeVisible()
        // userHeaderData.locator("div").nth(0).click()
        // const userFullNameInUserHeaderData = userHeaderData.locator("div").click()
        // console.log(userFullNameInUserHeaderData);

        // const jshshirInUserHeaderData = userHeaderData.locator("span", {hasText: "JSHSHIR:"}).textContent()
        // const passportInUserHeaderData = userHeaderData.locator("span", {hasText: "PASPORT"}).textContent()


        // extracting values from get-me response body
        // const { first_name, last_name, middle_name, passport_serial: passportFromBack, pinfl: pinflFromBack } = userInfo

        // const fullNameFromBack = `${first_name} ${last_name} ${middle_name}`

        // console.log(fullNameFromBack);

        // Validating FullName, Jshshir and Passport 
        // expect.soft(userFullNameInUserHeaderData).toEqual(fullNameFromBack)
        // expect.soft(jshshirInUserHeaderData).toEqual(pinflFromBack)
        // expect.soft(passportInUserHeaderData).toEqual(passportFromBack)





    })

    // test.afterAll("after all", async () => {
    //     // Close the page and context after all tests
    //     // await page.close();
    //     // await context.close();
    // });
})



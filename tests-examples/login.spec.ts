import { test, expect } from "@playwright/test"\
import { faker } from "@faker-js/faker"


let access_token: string;
let uploadedTutorialId: string;
const tutorialName = faker.lorem.words(3);
const editedTutorialName = faker.lorem.words(3);
let context;
let page;



const administration = {
    username: "administratsiya",
    password: "qweasdzxc",
};

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
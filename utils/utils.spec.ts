import { test, expect } from "@playwright/test"
import { faker } from "@faker-js/faker"
async function authenticateUser(browser, username: string, password: string, role: string) {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the login page
    await page.goto("https://haj-umra.rx.unicon.uz/login");

    // Perform login
    await page.getByRole("textbox", { name: "*Login" }).fill(username);
    await page.getByRole("textbox", { name: "*Password" }).fill(password);
    await page.getByRole("button", { name: "Kirish" }).click();

    // Wait for API responses
    const loginResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/login/");
    const getMeResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/get_me/");

    // Validate responses
    expect(loginResponse.status()).toBe(200);
    expect(getMeResponse.status()).toBe(200);

    // Extract response bodies
    const loginResponseBody = await loginResponse.json();
    const getMeResponseBody = await getMeResponse.json();

    const roleName = getMeResponseBody.role.name_uz

    // Validate user role
    const userName: string = roleName;
    expect(userName).toEqual(role);

    const userProfileButton = await page.getByRole('button', { name: 'User' })
    userProfileButton.click()

    // extracting values from get-me response body
    const { first_name, last_name, middle_name, passport_serial, pinfl: pinflFromBack } = getMeResponseBody.userinfo

    const fullNameFromBack = `${first_name} ${last_name} ${middle_name}`

    // Getting text of fullname and matching with back data
    const fullNameInDashboardMenu = await page.locator("div", { hasText: roleName }).locator("div.text-stone-600.font-semibold")
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

    userProfileButton.click()


    // Return the context, page, and access token
    return {
        context,
        page,
        accessToken: loginResponseBody.access,
        userInfo: getMeResponseBody.userinfo,
    };
}

export default authenticateUser


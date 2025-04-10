const genderValue = await page.locator("div.el-select__placeholder").locator("span").nth(0).textContent()
expect.soft(genderValue).toEqual(exactUserGender)

// validating ish joyi
const workPlaceInp = await page.getByPlaceholder("Ish joyi")
expect.soft(await workPlaceInp.inputValue()).toEqual(personalDataApiResponseBody.work_place)

// validating lavozimi 
const workPosition = await page.getByPlaceholder("Lavozimi")
expect(await workPosition.inputValue()).toEqual(personalDataApiResponseBody.work_position)


const userNeighbourhoods = personalDataApiResponseBody.address_data.length
if (userNeighbourhoods > 1) {
    // select neighbourhood
    const randomNeighbourhood = personalDataApiResponseBody.address_data[0].mahalla?.name_uz
    await page.locator("span", { hasText: "Mahallasi" }).click()
    await page.getByRole('option', { name: randomNeighbourhood }).click();
}

// validating region 
const region = await page.locator("div.el-select__placeholder").locator("span").nth(1).textContent()
const regionFromBack = personalDataApiResponseBody.address_data[0].region?.name_uz
expect.soft(region).toEqual(regionFromBack)




// validating Tuman/Shahar
const district = await page.locator("div.el-select__placeholder").locator("span").nth(2).textContent()
const districtFromBack = personalDataApiResponseBody.address_data[0].district?.name_uz
await expect.soft(district).toEqual(districtFromBack)

// validating Doimiy yashash manzili
const isPermanentFromBack = personalDataApiResponseBody.address_data[0].is_permanent
let isPermanentVal: string;

if (isPermanentFromBack) {
    isPermanentVal = "Doimiy yashash manzili"
} else {
    isPermanentVal = "Vaqtinchalik yashash manzili"
}

const isPermanentValInUi = await page.locator("div.el-select__placeholder").locator("span").nth(4).textContent()
expect.soft(isPermanentValInUi).toEqual(isPermanentVal)

// Inserting phone number
const randomPhoneNumber = generatePhoneNumber();
console.log(randomPhoneNumber);
await page.getByRole('textbox', { name: '*Telefon raqami' }).fill(randomPhoneNumber)

// Inserting gmail
const randomGmail = generateRandomGmail();
console.log(randomGmail);
await page.getByRole("textbox", { name: "Elektron pochta manzili" }).fill(randomGmail)

// Validating nogironligi
const disabilityInp = await page.getByPlaceholder("Nogironligi")
expect(await disabilityInp.inputValue()).toEqual(personalDataApiResponseBody.disability.name_uz)

// davom etish button 
if (userGender === "m") {
    await page.getByRole("button", { name: "Davom etish" }).click()
} else if (userGender === "f") {
    await page.getByRole("button", { name: "Mahram qo'shish" }).click()
}


// ortga
await page.getByRole("button", { name: "Ortga" }).click()
// davom etish button 
await page.getByRole("button", { name: "Davom etish" }).click()


// Ma'lumotlarni tekshirish

// Tug'ilgan sanasi 
const dateOfBirth2 = await page.locator(".field-info-value").nth(0).textContent()
expect.soft(dateOfBirth2).toEqual(formattedDateFromBackend)

// Jinsi 
const gender2 = await page.locator(".field-info-value").nth(1).textContent()
expect.soft(gender2).toEqual(exactUserGender)

// Nogironligi
const disability2 = await page.locator(".field-info-value").nth(2).textContent()
expect.soft(disability2).toEqual(personalDataApiResponseBody.disability.name_uz)

// Doimiy yashash manzili
const placeOfResidence = await page.locator(".field-info-value").nth(3).textContent()
expect.soft(placeOfResidence).toEqual(personalDataApiResponseBody.place_of_residence)

// Ro’yxatdan o’tgan manzili
const regesteredAddress = await page.locator(".field-info-value").nth(4).textContent()
expect.soft(regesteredAddress).toEqual(personalDataApiResponseBody.address_data[0]?.address)

// Ish joyi
const workPlace2 = await page.locator(".field-info-value").nth(5).textContent()
expect.soft(workPlace2).toEqual(personalDataApiResponseBody.work_place)

// Lavozimi
const workPosition2 = await page.locator(".field-info-value").nth(6).textContent()
expect.soft(workPosition2).toEqual(personalDataApiResponseBody.work_position)

// Telefon raqami
const phoneNumber2 = await page.locator(".field-info-value").nth(7).textContent()
expect.soft(phoneNumber2.replace(/\s+/g, "")).toEqual(randomPhoneNumber)

// Elektron pochta manzili
const gmailVal = await page.locator(".field-info-value").nth(8).textContent()
expect.soft(gmailVal).toEqual(randomGmail)

await page.getByRole("button", { name: "Davom etish" }).click()
await page.getByPlaceholder("111111").fill("234552");

const sentOneTimePasswordApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/services/send_one_time_password/")

// Validating sent one time password api status code 
const sentOneTimePassworStatus = await sentOneTimePasswordApiResponse.status()
if (sentOneTimePassworStatus > 400) {
    console.log("One time password has't sent :(");

}
expect(sentOneTimePassworStatus).toEqual(200)

await page.getByRole("button", { name: "Tasdiqlash" }).click()

// Validating Application created or not 
const pilgrimageApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/application/pilgrimage/")
expect(await pilgrimageApiResponse.status()).toEqual(201)
console.log("Arizangiz muvaffaqiyatli yaratildi");

// Validating success modal text

const successModalHeaderText = await page.getByRole('heading', { name: 'Tabriklaymiz!' }).textContent();
expect.soft(successModalHeaderText).toEqual("Tabriklaymiz!")

const successModalParagraphText = await page.locator("div", { hasText: "Arizangiz muvaffaqiyatli yaratildi" }).last().textContent()
expect.soft(successModalParagraphText).toEqual("Arizangiz muvaffaqiyatli yaratildi")
await page.getByText('Arizangiz muvaffaqiyatli').click();
await page.getByRole("button", { name: "Yopish" }).nth(1).click()
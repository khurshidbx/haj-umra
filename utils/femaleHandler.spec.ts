import { expect } from "@playwright/test"
import { faker } from "@faker-js/faker";
import dayjs from 'dayjs';

const generatePhoneNumber = () => {
    const staticPart = "+99899"; // First 5 digits
    const randomPart = faker.string.numeric(7); // Generate 7 random digits
    return `${staticPart}${randomPart}`;
};

const generateRandomGmail = () => {
    const randomUsername = faker.person.firstName()
    return `${randomUsername.toLowerCase()}@gmail.com`; // Append "@gmail.com"
};

function randomOneOrTwo() {
    return Math.random() < 0.5 ? 1 : 2;
}

async function handleFemaleUser(page, personalDataApiResponseBody, exactUserGender) {
    console.log("Female is creating application ...");

    // FORM VALIDATION starts ... 

    const dateOfBirth = await page.getByPlaceholder("Tug’ilgan sanasi")
    const dateOfBirthFromBack = personalDataApiResponseBody.date_of_birth

    // Parse and format the backend date using dayjs
    const formattedDateFromBackend = dayjs(dateOfBirthFromBack, "YYYY-MM-DD").format("DD.MM.YYYY"); // "07-11-1978"
    console.log("Formatted Date from Backend:", formattedDateFromBackend);

    // Validate the frontend date input value
    expect.soft(await dateOfBirth.inputValue()).toEqual(formattedDateFromBackend);

    const genderValue = await page.locator("div.el-select__placeholder").locator("span").nth(0).textContent()
    expect.soft(genderValue).toEqual(exactUserGender)

    // validating ish joyi
    const workPlaceInp = await page.getByPlaceholder("Ish joyi")
    const workPlaceValue = (await workPlaceInp.inputValue()) || ""; // Normalize empty string
    const workPlaceFromBack = personalDataApiResponseBody.work_place || ""; // Normalize null to empty string
    if (!personalDataApiResponseBody.work_place) {
        console.warn("Warning: Backend returned null or empty value for 'work_place'");
    }

    expect.soft(workPlaceValue).toEqual(workPlaceFromBack);

    // validating lavozimi 
    const workPosition = await page.getByPlaceholder("Lavozimi");
    const workPositionValue = await workPosition.inputValue() || ""; // Normalize empty string
    const workPositionFromBack = personalDataApiResponseBody.work_position || ""; // Normalize null to empty string


    if (!personalDataApiResponseBody.work_position) {
        console.warn("Warning: Backend returned null or empty value for 'work_position'");
    }

    expect.soft(workPositionValue).toEqual(workPositionFromBack);


    // validating mahallasi and select mahalla
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

    // validating Ro’yxatdan o’tgan manzili
    const residenceAddress = await page.getByPlaceholder("Ro’yxatdan o’tgan manzili").inputValue() || ""
    const residenceAddressFromBack = personalDataApiResponseBody.address_data[0]?.address || ""
    expect(residenceAddress).toEqual(residenceAddressFromBack)


    // validating Navbatga qo'yiladigan manzil turini tanlash
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
    // await page.getByRole("button", { name: "Mahram qo'shish" }).click()
    await page.getByRole('button', { name: 'Mahram qo’shish' }).click();

    const familyMembersApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/user/family_members/")

    // validate family_members api status code 
    expect.soft(await familyMembersApiResponse.status()).toEqual(200)

    const mahramlarRoyxatiButton = await page.getByRole("button", { name: "Mahramlar ro’yxati" })
    const mahramlarRoyxatiButtonClass = await mahramlarRoyxatiButton.getAttribute("class")
    expect.soft(mahramlarRoyxatiButtonClass).toContain("bg-sky-500");

    const familyMembersApiResponseBody = await familyMembersApiResponse.json()
    const hasFather = familyMembersApiResponseBody?.father
    const hasHusband = familyMembersApiResponseBody?.husband
    let fatherData = familyMembersApiResponseBody?.father;
    let husbandData = familyMembersApiResponseBody?.husband;
    let selectedMahram;
    const selectRandomMahram = randomOneOrTwo()





    if (!hasHusband && !hasFather) {
        console.log("This person doesn't have a default mahram, please add your mahram.");

    } else if (selectRandomMahram === 1) {
        if (hasFather) {
            // fatherData = familyMembersApiResponseBody?.father;
            console.log("Father selected as mahram.");
            await page.locator('.el-checkbox__inner').first().click();
            selectedMahram = familyMembersApiResponseBody?.father

            // Validating father data in the ui

        } else if (hasHusband) {
            // husbandData = familyMembersApiResponseBody?.husband;
            console.log("Father doesn't exist. Husband selected as mahram.");
            await page.locator('.el-checkbox__inner').last().click();
            selectedMahram = familyMembersApiResponseBody?.husband
        } else {
            console.warn("Neither father nor husband exists.");
        }
    } else if (selectRandomMahram === 2) {
        if (hasHusband) {
            // husbandData = familyMembersApiResponseBody?.husband;
            console.log("Husband selected as mahram.");
            await page.locator('.el-checkbox__inner').last().click();
            selectedMahram = familyMembersApiResponseBody?.husband
        } else if (hasFather) {
            // fatherData = familyMembersApiResponseBody?.father;
            console.log("Husband doesn't exist. Father selected as mahram.");
            await page.locator('.el-checkbox__inner').first().click();
            selectedMahram = familyMembersApiResponseBody?.father
        } else {
            console.warn("Neither husband nor father exists.");
        }
    }

    // validating father and husband data in the ui
    if (hasHusband || hasFather) {
        // const { first_name, last_name, middle_name } = fatherData
        if (hasFather) {
            const fatherFullName = `${familyMembersApiResponseBody?.father?.first_name} ${familyMembersApiResponseBody?.father?.last_name} ${familyMembersApiResponseBody?.father?.middle_name}`
            console.log(fatherFullName)
            await page.getByText(fatherFullName).click()
        }

        if (hasHusband) {
            const husbandFullName = `${familyMembersApiResponseBody?.husband?.first_name} ${familyMembersApiResponseBody?.husband?.last_name} ${familyMembersApiResponseBody?.husband?.middle_name}`
            console.log(husbandFullName);
            await page.getByText(husbandFullName).click()
        }
    }

    await page.locator(":text-is('Mahram qo’shish')").nth(1).click();



    // Ma'lumotlarni tekshirish

    // Tug'ilgan sanasi 
    const dateOfBirth2 = (await page.locator(".field-info-value").nth(0).textContent()); // Normalize empty string
    expect.soft(dateOfBirth2).toEqual(formattedDateFromBackend);

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
    const workPlace2 = await page.locator(".field-info-value").nth(5).textContent() || ""
    const workPlaceFromBack2 = personalDataApiResponseBody.work_place || ""
    expect.soft(workPlace2).toEqual(workPlaceFromBack2)

    // Lavozimi
    const workPosition2 = await page.locator(".field-info-value").nth(6).textContent() || ""
    const workPostionFromBack = personalDataApiResponseBody.work_position || ""
    expect.soft(workPosition2).toEqual(workPostionFromBack)

    // Telefon raqami
    const phoneNumber2 = await page.locator(".field-info-value").nth(7).textContent()
    expect.soft(phoneNumber2.replace(/\s+/g, "")).toEqual(randomPhoneNumber)

    // Elektron pochta manzili
    const gmailVal = await page.locator(".field-info-value").nth(8).textContent()
    expect.soft(gmailVal).toEqual(randomGmail)






    // Mahram ma'lumotlarini tekshirish

    // Tug’ilgan sanasi
    const dateBirthOfMahram = await page.getByPlaceholder("Tug’ilgan sanasi").inputValue()
    const dateBirthOfMahramFromBack = selectedMahram.date_of_birth

    // Parse and format the backend date using dayjs
    const formattedDateBirthOfMahramFromBack = dayjs(dateBirthOfMahramFromBack, "YYYY-MM-DD").format("DD.MM.YYYY");
    expect.soft(dateBirthOfMahram).toEqual(formattedDateBirthOfMahramFromBack)

    // Jinsi
    const genderOfMahram = await page.locator("div.el-select__placeholder").locator("span").nth(0).textContent()
    const genderOfMahramBack = selectedMahram?.gender === "m" ? "Erkak" : ""
    expect.soft(genderOfMahram).toEqual(genderOfMahramBack)

    // Ish joyi
    const workPlaceOfMahram = await page.getByPlaceholder("Ish joyi").inputValue() || ""
    const workPlaceOfMahramBack = selectedMahram?.work_place || ""
    expect.soft(workPlaceOfMahram).toEqual(workPlaceOfMahramBack)

    // Lavozimi
    const workPositionOfMahram = await page.getByPlaceholder("Lavozimi").inputValue() || ""
    const workPositionOfMahramBack = selectedMahram.work_position || ""
    expect.soft(workPositionOfMahram).toEqual(workPositionOfMahramBack)

    // Hudud. Gets Female region 
    const regionOfMahram = await page.locator("div.el-select__placeholder").locator("span").nth(1).textContent() || ""
    const femaleRegion = personalDataApiResponseBody.address_data[0].region?.name_uz || ""
    expect.soft(regionOfMahram).toEqual(femaleRegion)

    // Tuman/Shahar. Gets Female Tuman/Shahar
    const districtOfMahram = await page.locator("div.el-select__placeholder").locator("span").nth(2).textContent()
    const femaleDistrict = personalDataApiResponseBody.address_data[0].district?.name_uz
    expect.soft(districtOfMahram).toEqual(femaleDistrict)

    // Doimiy yashash manzili
    const residenceAddressOfMahram = await page.getByPlaceholder("Doimiy yashash manzili").inputValue() || ""
    const residenceAddressBack = selectedMahram.place_of_residence
    expect.soft(residenceAddressOfMahram).toEqual(residenceAddressBack)

    // Mahallasi. Gets Female Tuman/Shahar
    const mahhallaOfMahram = await page.locator("div.el-select__placeholder").locator("span").nth(3).textContent()
    const mahhallaOfMahramBack = personalDataApiResponseBody.address_data[0].mahalla?.name_uz
    expect.soft(mahhallaOfMahram).toEqual(mahhallaOfMahramBack)

    // Ro’yxatdan o’tgan manzili
    const regesteredAdressOfMahram = await page.getByPlaceholder("Ro’yxatdan o’tgan manzili").inputValue() || ""
    const regesteredAddressOfMahramBack = personalDataApiResponseBody.address_data[0]?.address
    expect.soft(regesteredAdressOfMahram).toEqual(regesteredAddressOfMahramBack)

    // Navbatga qo'yiladigan manzil turini tanlash
    const addressTypeOfMahram = await page.locator("div.el-select__placeholder").locator("span").nth(4).textContent()
    const addressTypeOfMahramBack = personalDataApiResponseBody.address_data[0]?.is_permanent ? "Doimiy yashash manzili"
        : "Vaqtinchalik yashash manzili";
    expect.soft(addressTypeOfMahram).toEqual(addressTypeOfMahramBack)



    // filling Telefon raqami
    const phoneNumberInpOfMahram = await page.getByRole('textbox', { name: '*Telefon raqami' })
    const randomPhoneNumberOfMahram = generatePhoneNumber()
    await phoneNumberInpOfMahram.fill(randomPhoneNumberOfMahram)

    // filling Elektron pochta manzili
    const gmailInpOfMahram = await page.getByRole('textbox', { name: 'Elektron pochta manzili' })
    const randomGmailOfMahram = generateRandomGmail()
    await gmailInpOfMahram.fill(randomGmailOfMahram)

    // Nogironligi
    const disabilityOfMahram = await page.getByPlaceholder("Nogironligi").inputValue()
    const disabilityOfMahramBack = selectedMahram.disability?.name_uz
    expect.soft(disabilityOfMahram).toEqual(disabilityOfMahramBack)

    await page.getByRole("button", { name: "Davom etish" }).click()

    // await page.getByPlaceholder("111111").fill("234552");

    // const sentOneTimePasswordApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/services/send_one_time_password/")

    // // Validating sent one time password api status code 
    // const sentOneTimePassworStatus = await sentOneTimePasswordApiResponse.status()
    // if (sentOneTimePassworStatus > 400) {
    //     console.log("One time password has't sent :(");

    // }
    // expect(sentOneTimePassworStatus).toEqual(200)

    // await page.getByRole("button", { name: "Tasdiqlash" }).click()

    // Validating Application created or not 
    // const pilgrimageApiResponse = await page.waitForResponse("https://haj-umra.rx.unicon.uz/api/application/pilgrimage/")
    // const pilgrimageApiResponseStatus = pilgrimageApiResponse.status()
    // if (pilgrimageApiResponseStatus > 210) {
    //     console.log("Ariza yaratilmadi ! :(");
    // }
    // expect(await pilgrimageApiResponse.status()).toEqual(201)
    // console.log("Arizangiz muvaffaqiyatli yaratildi");

    // Validating success modal text

    // const successModalHeaderText = await page.getByRole('heading', { name: 'Tabriklaymiz!' }).textContent();
    // expect.soft(successModalHeaderText).toEqual("Tabriklaymiz!")

    // const successModalParagraphText = await page.locator("div", { hasText: "Arizangiz muvaffaqiyatli yaratildi" }).last().textContent()
    // expect.soft(successModalParagraphText).toEqual("Arizangiz muvaffaqiyatli yaratildi")
    // await page.getByText('Arizangiz muvaffaqiyatli').click();
    // await page.getByRole("button", { name: "Yopish" }).nth(1).click()
}

export default handleFemaleUser
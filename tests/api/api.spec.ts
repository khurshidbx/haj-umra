import { test, expect } from "@playwright/test"

const administration = {
    username: "administratsiya",
    password: "qweasdzxc"
}


test("pilgrims_list api", async ({ request }) => {
    const loginResponse = await request.post("https://haj-umra.rx.unicon.uz/api/user/login/", {
        data: {
            username: administration.username,
            password: administration.password
        }
    })


    // Get the JSON response
    const responseBody = await loginResponse.json();
    const access_token = responseBody.access


    // Log the full response body
    console.log("Response Body:", access_token);

    // Log only the access token if it exists
    if (access_token) {
        console.log("Access Token:", access_token);

        const pilgrims_list = await request.get("https://haj-umra.rx.unicon.uz/api/pilgrims_list", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const res = pilgrims_list.status();
        console.log(res);

    } else {
        console.log("Access token not found in response.");
    }
})
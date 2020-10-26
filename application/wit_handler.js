const fs = require("fs");
const axios = require("axios");
const https = require("https");


// initializing the variables needed
const catalog_id = process.env.CATALOG_ID;
const access_token = process.env.FB_ACCESS_TOKEN;

// best andmost sold producs to suggest on the user in case no match for the user's request was found, you can make this array change according to sales changes
const suggested_products = []

function responseFromWit(data) {
  console.log("data from wit:");
  console.log(JSON.stringify(data));

  const intent = (data.intents.length > 0 && data.intents[0]) || "__foo__";

  switch (intent.name) {
    case "asking_for_price":
      return askingForPrice(data);
    case "asking_for_availability":
      return askingForAvailability(data);
  }

  return handleGibberish();
}

function handleGibberish() {
  return Promise.resolve(
    "thanks reaching out, I could not find any matches for your search, here are the most requested items"
  );
}

async function askingForPrice(data) {
  const shirt_title = data.entities["t-shirt_title:t-shirt_title"];

  console.log(shirt_title);
  if (shirt_title != null) {
    const response = await axios.get(
      "https://graph.facebook.com/" + catalog_id + "/products",
      {
        params: {
          access_token,
          filter: {
            name: {
              i_contains: shirt_title[0].body
            }
          }
        }
      }
    );

    const response_data = response.data.data;

    if (response_data.length === 0) {
      return "we could not find t-shirts for this data";
    } else {
      console.log(response_data[0].price);
      return "the price for this item is: " + response_data[0].price;
    }
  }
}

async function askingForAvailability(data) {
  const shirt_color = data.entities["t-shirt_color:t-shirt_color"];
  const gender = data.entities["gender:gender"];
  const size = data.entities["size:size"];

  if (shirt_color) {
    if (gender) {
      const response = await axios.get(
        "https://graph.facebook.com/" + catalog_id + "/products",
        {
          params: {
            access_token,
            fields: ["url", "gender", "color"],
            filter: {
              and: [
                {
                  color: {
                    i_contains: shirt_color[0].body
                  }
                },
                {
                  gender: {
                    eq: gender[0].body
                  }
                }
              ]
            }
          }
        }
      );

      const response_data = response.data.data;

      if (response_data.length === 0) {
        return "Unfortunately we could not find any product that matches your criteria";
      } else {
        return "here is a product that matches your criteria: " + response_data[0].url;
      }
    }
  }
  if (size) {
        const response = await axios.get(
        "https://graph.facebook.com/" + catalog_id + "/products",
        {
          params: {
            access_token,
            filter: {
              and: [
                {
                  color: {
                    i_contains: shirt_color[0].body
                  }
                },
                {
                  size: {
                    eq: size[0].body
                  }
                }
              ]
            }
          }
        }
      );

      const response_data = response.data.data;

      if (response_data.length === 0) {
        return "Unfortunately we could not find any product that matches your criteria";
      } else {
        return "here is a product that matches your criteria: " + response_data[0].url;
      } 
  }
}



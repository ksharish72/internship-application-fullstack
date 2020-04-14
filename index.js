let htmlRewriter = new HTMLRewriter();
addEventListener("fetch", (event) => {
  var response = handleRequest(event.request);
  event.respondWith(response);
});

/**
 * Respond with variant pages
 * @param {Request} request
 */

async function handleRequest(request) {
  if (checkForCookie("variantUrl", request.headers)) {
    ///load from the cookie url
    var cookieObj = request.headers.get("cookie");
    var variantUrl = getCookieValue("variantUrl", cookieObj);
    console.log("Loaded url from cookie " + variantUrl + " url");
    const randomVariant = await getRandomVariant(variantUrl);
    return randomVariant;
  }
  const url = "https://cfw-takehome.developers.workers.dev/api/variants";
  // requirement 1: storing the two urls in a temperory variable variants
  const response = await getVariants(url);
  const variants = response["variants"];
  // requirement 3: load balance between the variant urls
  let cur = getRandomInt(variants.length);
  console.log("Loaded url from variants API " + variants[cur]);
  // requirement 2: fetch the corresponding variant
  const randomVariant = await getRandomVariant(variants[cur]);
  return randomVariant;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
/**
 * check if cookie is present
 * @param {*} cookieName 
 * @param {*} headers 
 */
function checkForCookie(cookieName, headers) {
  if (headers.has("cookie")) {
    var cookieObj = headers.get("cookie");
    var cookieValue = getCookieValue(cookieName, cookieObj);
    console.log("Cookie value :" + cookieValue);
    if (cookieValue != "") return true;
  }
  return false;
}
/**
 * function to get cookie value from name
 * @param {*} cname
 */
function getCookieValue(cname, cookie) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
/**
 * Element handler for title tag (title)
 */
class TitleElementHandler {
  text(text) {
    // An incoming piece of text
    if (!text.lastInTextNode) text.replace(`Modified ${text.text}`);
  }
}
/**
 * Element handler for title header tag  (h1#title)
 */
class TitleHeadingElementHandler {
  text(text) {
    // An incoming piece of text
    if (!text.lastInTextNode) text.replace(`Modified ${text.text}`);
  }
}
/**
 * Element handler for description text (p#description)
 */
class DescriptionElementHandler {
  text(text) {
    // An incoming piece of text
    if (!text.lastInTextNode)
      text.replace(`This is a modified description.${text.text}`);
  }
}
/**
 * Element handler for button url (a#url)
 */
class ButtonUrlElementHandler {
  element(element) {
    element.setAttribute(
      "href",
      "https://www.linkedin.com/in/harish-sivaprakash-032218114/"
    );
  }

  text(text) {
    // An incoming piece of text
    if (!text.lastInTextNode) text.replace(`Return to my LinkedIn Page`);
  }
}
/**
 * function to that returns an array of urls from /api/variant
 * @param {*} url
 */
async function getVariants(url) {
  return fetch(url)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Something went wrong on api server!");
      }
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
}
/**
 * function that returns an random variant response object
 * @param {*} url
 */
async function getRandomVariant(url) {
  return fetch(url)
    .then((response) => {
      if (response.status === 200) {
        return response;
      } else {
        throw new Error("Something went wrong on api server!");
      }
    })
    .then((response) => {
      let modifiedResponse = htmlRewriter
        .on("title", new TitleElementHandler())
        .on("#title", new TitleHeadingElementHandler())
        .on("#description", new DescriptionElementHandler())
        .on("#url", new ButtonUrlElementHandler())
        .transform(response);
      modifiedResponse.headers.append("set-cookie", `variantUrl=${url}`);
      return modifiedResponse;
    })
    .catch((error) => {
      return error;
    });
}

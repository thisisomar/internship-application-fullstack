addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class TitleHandler {
  element(element) {
    element.setInnerContent("Omar's Internship Challenge")
  }
}

class HeadingHandler {
  element(element) {
    element.prepend("Omar's Internship Challenge")
  }
}

class DescriptionHandler {
  element(element) {
    element.setInnerContent("It was a pleasure doing this challenge, never worked"
     + " with the Workers API, but the documentation was extremely helpful. Thank you Cloudfare :)");
  }
}

class URLHandler {
  element(element) {
    element.setInnerContent("Check out my personal website");
    element.setAttribute('href', 'https://www.omarabusamra.com')
  }
}

function abDecision(NAME, request) {
  const cookie = request.headers.get('Cookie')
  
  // return existing variant or choose one randomly if not set
  if (cookie && cookie.includes(`${NAME}=variant1`)) {
    return 'variant1'
  } else if (cookie && cookie.includes(`${NAME}=variant2`)) {
    return 'variant2'
  } else {
    // if no cookie then this is a new client, decide a group and set the cookie
    let group = Math.random() < 0.5 ? 'variant1' : 'variant2' // 50/50 split
    return group
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const API_URL = "https://cfw-takehome.developers.workers.dev/api/variants";
  const NAME = 'omarabusamra'

  const originalResponse = await fetch(API_URL)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      let variant = abDecision(NAME, request);

      if (variant === 'variant1') {
        response = fetch(response.variants[0], request);
      } else {
        response = fetch(response.variants[1], request);
      }

      return response.then((response) => {
        let persist = new Response(response.body, response)
        persist.headers.append('Set-Cookie', `${NAME}=${variant}; path=/`)
        return persist;
      })
    });
  
  let rewriteContent = new HTMLRewriter()
    .on('title', new TitleHandler())
    .on('h1#title', new HeadingHandler())
    .on('p#description', new DescriptionHandler())
    .on('a#url', new URLHandler())
    .transform(originalResponse)

  return rewriteContent;
}
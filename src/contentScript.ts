
window.addEventListener("load", loadScript, false);

const jpdbParseTextUrl: string = "https://jpdb.io/api/v1/parse";

async function loadScript() {
    const currentUrl: string = location.href;
    const whitelistedDomainsKeyStore: string = (await chrome.storage.local.get("whitelistedDomains")).whitelistedDomains
    const whitelistedDomains: string =
        whitelistedDomainsKeyStore
            ? whitelistedDomainsKeyStore.replaceAll(" ", "")
            : ".jp";
    const jpdbApiKey = (await chrome.storage.local.get("jpdbApiKey")).jpdbApiKey
    if (shouldShowPrediction(currentUrl, whitelistedDomains.split(","))) {
        showPrediction(jpdbApiKey).then(
            () => {
                console.log('Successfully shown prediction');
            },
            (reason) => {
                console.error(reason);
            });
    }
}

function shouldShowPrediction(currentUrl: string, whitelistedDomains: string[]) {
    return whitelistedDomains.length == 0
        || whitelistedDomains.some(domain => currentUrl.includes(domain));
}

async function showPrediction(jpdbApiKey: string) {
    const pageContent = document.documentElement.innerText;
    const parsedPage = await jpdbParsePage(jpdbApiKey, pageContent);
    const totalVocab = parsedPage.vocabulary;
    const knownVocab = new Set(totalVocab.filter(word => word[0] !== null)); // [0] state (reviewed/not)
    const uniqueWords: Set<string> = new Set(totalVocab);

    showPredictionOnPage(uniqueWords.size, knownVocab.size);
}

function showPredictionOnPage(pageWords: number, knownWords: number) {
    const container: HTMLElement = document.createElement('div')
    container.style.position = "fixed"
    container.style.height = "auto"
    container.style.width = " 250px"
    container.style.bottom = "5px"
    container.style.right = "5px"
    container.style.border = "1px solid white"
    container.style.backgroundColor = "#233142"
    container.style.color = "white"
    container.style.zIndex = "2000"
    container.style.textAlign = "center"
    container.innerHTML =
      "Comprehension percentage: "
          + String((knownWords / pageWords  * 100).toFixed(2)) + "%"
      + "<br> Unique page words: " + String(pageWords)
      + "<br> Known unique page words: " + String(knownWords)

    document.body.appendChild(container)
}

async function jpdbParsePage(jpdbApiKey: string, pageText: string) {
    const body = {
        text: pageText,
        token_fields: ["vocabulary_index","position","length","furigana"],
        vocabulary_fields: ["card_level"]
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jpdbApiKey}`
        },
        body: JSON.stringify(body),
    };
    const response = await fetch(jpdbParseTextUrl, requestOptions);

    return await response.json();
}
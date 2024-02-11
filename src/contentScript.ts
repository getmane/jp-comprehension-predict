
window.addEventListener("load", loadScript, false);

async function loadScript() {
    const currentUrl: string = location.href;
    const whitelistedDomainsKeyStore: string = (await chrome.storage.local.get("whitelistedDomains")).whitelistedDomains
    const whitelistedDomains: string =
        whitelistedDomainsKeyStore
            ? whitelistedDomainsKeyStore.replaceAll(" ", "")
            : ".jp";
    if (shouldShowPrediction(currentUrl, whitelistedDomains.split(","))) {
        showPrediction().then(
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

async function showPrediction() {
    const pageContent = document.documentElement.innerText;
    // TODO: use a dictionary
    const segmenter: Intl.Segmenter
      = new Intl.Segmenter([], {granularity: 'word'});
    const segmentedText: Intl.Segments = segmenter.segment(pageContent);
    const pageWords: string[] = filterOutNonJapanese([...segmentedText]
        .filter(s => s.isWordLike).map(s => s.segment));
    const uniqueWords: Set<string> = new Set(pageWords);

    const knownWords: string[]
      = (await chrome.storage.local.get("knownWords")).knownWords;
    const comprehension: number = calculateComprehension(pageWords, knownWords)

    showPredictionOnPage(comprehension, pageWords.length, uniqueWords.size);
}

function showPredictionOnPage(
  comprehension: number,
  pageWords: number,
  uniqueWords: number
) {
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
          + String((comprehension * 100).toFixed(2)) + "%"
      + "<br>" + "Total known page words: " + String(pageWords * comprehension)
      + "<br> Total words on page: " + String(pageWords)
      + "<br> Unique words on page: " + String(uniqueWords)
      + "<br> Unique percentage: "
            + String((uniqueWords / pageWords * 100).toFixed(2)) + "%"

    document.body.appendChild(container)
}

function filterOutNonJapanese(text: string[]) {
    return text.filter(letter => {
        return (letter > '\u3040' && letter < '\u4DBF')
            || (letter > '\u4e00' && letter < '\u9faf');
    });
}

function calculateComprehension(wordsOnPage: string[], knownWords: string[]): number {
    return wordsOnPage.filter(Set.prototype.has, new Set(knownWords))
        .length / wordsOnPage.length;
}

window.addEventListener("load", loadScript, false);

async function loadScript() {
    const currentUrl = location.href;
    const whitelistedDomains = (await chrome.storage.local.get("whitelistedDomains")).whitelistedDomains.replace(" ", "");

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
        || whitelistedDomains.some(domains => currentUrl.includes(domains));
}

async function showPrediction() {
    const pageContent = document.documentElement.innerText;
    // TODO: use a dictionary
    const segmenter = new Intl.Segmenter([], {granularity: 'word'});
    const segmentedText = segmenter.segment(pageContent);
    const pageWords = filterOutNonJapanese([...segmentedText].filter(s => s.isWordLike).map(s => s.segment));
    const knownWords = (await chrome.storage.local.get("knownWords")).knownWords;
    const comprehension = calculateComprehension(pageWords, knownWords)

    showPredictionOnPage(comprehension * 100, pageWords.length * comprehension, pageWords);
}

function showPredictionOnPage(comprehension: number, knownWords: number, pageWords: string[]) {
    const container = document.createElement('div')
    container.style.position = "fixed"
    container.style.height = "auto"
    container.style.width = " 200px"
    container.style.bottom = "5px"
    container.style.right = "5px"
    container.style.border = "1px solid white"
    container.style.backgroundColor = "#233142"
    container.style.color = "white"
    container.style.zIndex = "2000"
    container.style.textAlign = "center"
    container.innerHTML = "Comprehension percentage: " + String(comprehension.toFixed(2)) + "%"
        + "<br>" + "Known words: " + String(knownWords)
        + "<br> Words on page: " + String(pageWords.length)

    document.body.appendChild(container)
}

function filterOutNonJapanese(text: string[]) {
    return text.filter(letter => {
        return (letter > '\u3040' && letter < '\u4DBF')
            || (letter > '\u4e00' && letter < '\u9faf');
    }).reduce((a, b) => {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
}

function calculateComprehension(wordsOnPage: string[], knownWords: string[]): number {
    return wordsOnPage.filter(Set.prototype.has, new Set(knownWords)).length / wordsOnPage.length;
}
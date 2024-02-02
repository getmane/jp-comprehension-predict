const currentUrl = location.href;
const jpDomainRegex = /\.jp/;
const onlyJpSites = (await chrome.storage.local.get("onlyJp")).onlyJp;

if ((jpDomainRegex.test(currentUrl) && onlyJpSites) || !onlyJpSites) {
    showPrediction().then(
        () => {
            console.log('Successfully shown prediction');
        },
        (reason) => {
            console.error(reason);
        });
}

async function showPrediction() {
    const pageContent = document.documentElement.innerText;
    // TODO: use a dictionary
    const segmenter = new Intl.Segmenter([], {granularity: 'word'});
    const segmentedText = segmenter.segment(pageContent);
    const pageWords = wordStat([...segmentedText].filter(s => s.isWordLike).map(s => s.segment));
    const knownWords = (await chrome.storage.local.get("knownWords")).knownWords;
    const similarity = similarityPercentage(pageWords, knownWords)

    console.log(pageWords)
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
    container.innerHTML = "Comprehension percentage: " + String(similarity.toFixed(2)) + "%"
        + "<br>" + "Total known words: " + String(knownWords.length)
        + "<br> Words on page: " + String(pageWords.length)

    document.body.appendChild(container)
}

function wordStat(text: string[]) {
    return text.filter(letter => {
        return (letter > '\u3040' && letter < '\u4DBF')
            || (letter > '\u4e00' && letter < '\u9faf');
    }).reduce((a, b) => {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
}

function similarityPercentage(wordsOnPage: string[], totalWords: string[]): number {
    return 100 * wordsOnPage.filter(Set.prototype.has, new Set(totalWords)).length / wordsOnPage.length;
}
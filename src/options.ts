import '../styles/options.scss';

const whitelistedDomainsStore = (await chrome.storage.local.get("whitelistedDomains")).whitelistedDomains;
if (whitelistedDomainsStore) {
    (<HTMLInputElement> document.getElementById('whitelist-domains')).value = whitelistedDomainsStore
} else {
    (<HTMLInputElement> document.getElementById('whitelist-domains')).value = ".jp"
}


const saveOptions = () => {
    const jpdbReviews = <HTMLInputElement> document.getElementById('jpdb-file')
    const whitelistedDomains = <HTMLInputElement> document.getElementById('whitelist-domains')

    if ('files' in jpdbReviews && jpdbReviews.files.length > 0) {
        storeJpdbWords(jpdbReviews.files[0])
    }
    chrome.storage.local.set({ whitelistedDomains: whitelistedDomains.value });

    savedNotify();
}

function storeJpdbWords(file: Blob) {
    readFileContent(file).then(fileContent => {
        const jpdb = JSON.parse(fileContent);
        const knownWords = jpdb.cards_vocabulary_jp_en.map((word: { spelling: string; }) => word.spelling);
        chrome.storage.local.set(
            { knownWords: knownWords },
            () => console.log('Set known words (jpdb)')
        );
    }).catch(error => console.log(error))
}

function readFileContent(file: Blob): Promise<string> {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function savedNotify() {
    const status = document.getElementById('status');
    status.textContent = 'Saved.';
    setTimeout(() => {
        status.textContent = '';
    }, 750);
}

document.getElementById('save').addEventListener('click', saveOptions);
import '../styles/options.scss';

const onlyJpSites = (await chrome.storage.local.get("onlyJp")).onlyJp;
if (onlyJpSites) {
    (<HTMLInputElement> document.getElementById('only-jp')).checked = true
}

const saveOptions = () => {
    const jpdbReviews = <HTMLInputElement> document.getElementById('jpdb-file')
    const onlyJp = <HTMLInputElement> document.getElementById('only-jp')

    if ('files' in jpdbReviews && jpdbReviews.files.length > 0) {
        storeJpdbWords(jpdbReviews.files[0])
    }
    chrome.storage.local.set({ onlyJp: onlyJp.checked });

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
import '../styles/options.scss';

const saveOptions = () => {
    const input: HTMLElement = document.getElementById('jpdb-file')
    if ('files' in input && input.files.length > 0) {
        placeFileContent(input.files[0])
    }
}

function placeFileContent(file: Blob) {
    readFileContent(file).then(fileContent => {
        const jpdb = JSON.parse(fileContent);
        const knownWords = jpdb.cards_vocabulary_jp_en.map((word: { spelling: string; }) => word.spelling);
        chrome.storage.local.set(
            { knownWords: knownWords },
            () => {
                const status = document.getElementById('status');
                status.textContent = 'Saved.';
                setTimeout(() => {
                    status.textContent = '';
                }, 750);
            }
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
document.getElementById('save').addEventListener('click', saveOptions);
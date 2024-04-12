import '../styles/options.scss';

const whitelistedDomainsStore: string = (await chrome.storage.local.get("whitelistedDomains")).whitelistedDomains;
const jpdbApiKey: string = (await chrome.storage.local.get("jpdbApiKey")).jpdbApiKey;

if (whitelistedDomainsStore) {
    (<HTMLInputElement> document.getElementById('whitelist-domains')).value = whitelistedDomainsStore
} else {
    (<HTMLInputElement> document.getElementById('whitelist-domains')).value = ".jp"
}
if (jpdbApiKey) {
    (<HTMLInputElement> document.getElementById('jpdb-api')).value = jpdbApiKey
}

const saveOptions = () => {
    const jpdbApiKey: HTMLInputElement = <HTMLInputElement> document.getElementById('jpdb-api')
    const whitelistedDomains: HTMLInputElement = <HTMLInputElement> document.getElementById('whitelist-domains')

    chrome.storage.local.set({ whitelistedDomains: whitelistedDomains.value });
    chrome.storage.local.set({ jpdbApiKey: jpdbApiKey.value });

    savedNotify();
}


function savedNotify() {
    const status: HTMLElement = document.getElementById('status');
    status.textContent = 'Saved.';
    setTimeout(() => {
        status.textContent = '';
    }, 750);
}

document.getElementById('save').addEventListener('click', saveOptions);
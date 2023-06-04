
let pQuote = document.getElementById('pQuote');
function fetchNextQuote() {
    fetch('https://api.kanye.rest/').then(data => data.json()).then(quote => pQuote.innerHTML = quote.quote)
}

fetchNextQuote();

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Country {
    constructor(id, name, officialName, independent, unmember, currency, capital, region, language, flag) {
        this.id = id;
        this.name = name;
        this.officialName = officialName;
        this.independent = independent;
        this.unmember = unmember;
        this.currency = currency;
        this.capital = capital;
        this.region = region;
        this.language = language;
        this.flag = flag;
    }

    static fromJSON(response) {
        let name = response.name?.common || "Unknown"
        let officialName = response.name?.official || "official"
        let independent = response.independent || false;
        let unmember = response.unMember || false;
        let loop = 0;
        const currencyObj = response.currencies || {};
        let currency;
        for (const entry in currencyObj) {
            if (loop > 0) { break; }
            if (currencyObj[entry]) {
                currency = `${currencyObj[entry].name}(${entry})`;
                loop += 1;
            }
        }

        let capital = (response.capital && response.capital.length > 0) ? response.capital[0] : undefined;
        let region = `${response.subregion || ''}, ${response.region || ''}`;

        let languageObj = response.languages || {};
        let language;
        for (const entry in languageObj) {
            if (languageObj[entry]) {
                if (language == undefined) {
                    language = `${languageObj[entry]}(${entry})`;
                } else {
                    language += `, ${languageObj[entry]}(${entry})`
                }
            }
        }
        language = (language == undefined) ? '' : language;
        let flag = response.flags?.png || '';

        return new Country(generateGUID(), name, officialName, independent, unmember, currency, capital, region, language, flag);
    }
}

class User {
    constructor(id, name, gender, address, age, dob, phone, cell, picture) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.address = address;
        this.age = age;
        this.dob = dob;
        this.phone = phone;
        this.cell = cell;
        this.picture = picture;
    }

    static fromResponse(response) {
        let id = response.login.uuid ?? generateGUID();
        let name = ((response.name?.title || '') + ' ' + (response.name?.first || '') + ' ' + (response.name?.last || '')).trim();
        let gender = response.gender ?? '';
        let address = ((response.location?.street?.number ?? '') + ',' + (response.location?.street?.name ?? '') + ',' + response.location?.city ?? '' + ',' + response.location?.state ?? '' + ',' + response.location?.country ?? '' + '-' + response.location?.postcode ?? '')
        let age = response.dob?.age
        let dob = (response.dob?.date != undefined) ? new Date(response.dob.date) : undefined;
        let phone = response.phone
        let cell = response.cell
        let picture = response.picture?.large ?? response.picture?.medium ?? response.picture?.thumbnail

        return new User(id, name, gender, address, age, dob, phone, cell, picture)

    }
}

const randomUsers = []
const countryObjects = []

const userSection = document.getElementById('userSection');
const countrySection = document.getElementById('countrySection');

let selectedItem;

function fetchUsers() {
    fetch('https://randomuser.me/api?results=40').then(data => data.json()).then((users) => {
        for (const user of users.results) {
            let userObj = User.fromResponse(user)
            addUserInSection(userObj);
            randomUsers.push(userObj);
        }

        console.log('Users fetching ended');
    })
}

function fetchCountries() {
    fetch('https://restcountries.com/v3.1/all').then(data => data.json()).then((countries) => {
        for (let i = 0; i < countries.length; i++) {
            const countryObj = Country.fromJSON(countries[i]);
            addCountryInSection(countryObj);
            countryObjects.push(countryObj);
        }

        console.log('Country fetching ended');
    });
}

fetchUsers();

fetchCountries();

function updateSelection(id) {
    sectionDetails.classList.remove('d-block', 'd-none');

    removeAllChildren(sectionDetails);
    if (selectedItem === id) {
        sectionDetails.classList.add('d-none')
        selectedItem = undefined;
    } else {
        selectedItem = id;
    }

    removeAllChildren(userSection);
    removeAllChildren(countrySection);

    for (const userObj of randomUsers) {
        addUserInSection(userObj);
    }

    for (const countryObj of countryObjects) {
        addCountryInSection(countryObj);
    }

}

function removeAllChildren(parent) {
    while (parent.firstChild) {
        parent.firstChild.remove();
    }
}

function addUserInSection(userObj) {
    let div = document.createElement('div');
    div.classList.add('card', 'col', 'rounded', 'm-1');
    div.classList.remove('shadow');
    div.style.backgroundColor = 'white';
    div.style.color = 'black';
    if (selectedItem === userObj.id) {
        div.classList.add('shadow')
        div.style.backgroundColor = 'tomato';
        div.style.color = 'white';

        showUserDetails(userObj);
    }
    div.id = userObj.id;
    div.innerHTML = `
            <div class="card-body"> 
                ${(selectedItem === userObj.id) ? "<i class='fa fa-check-circle'></i> " : ""}
                <b class="card-title">${userObj.name}</b> <br>
                <div class="card-text">
                    Gender: <span class="card-data">${userObj.gender}</span> <br>
                    Address: <span class="card-data">${userObj.address}</span> <br>
                </div>
            </div>
            `;
    userSection.appendChild(div);
    div.addEventListener('click', () => {
        updateSelection(userObj.id)
    })
}

function addCountryInSection(country) {
    let div = document.createElement('div');
    div.classList.add('card', 'col', 'rounded', 'm-1');
    div.classList.remove('shadow');
    div.style.backgroundColor = 'white';
    div.style.color = 'black';
    if (selectedItem === country.id) {
        div.classList.add('shadow')
        div.style.backgroundColor = 'tomato';
        div.style.color = 'white';

        showCountryDetails(country);
    }
    div.id = country.id;
    div.innerHTML = `
            <div class="card-body"> 
                ${(selectedItem === country.id) ? "<i class='fa fa-check-circle'></i> " : ""}
                <b class="card-title">${country.name}</b> <br>
                <div class="card-text">
                    Official Name: <span class="card-data">${country.officialName}</span> <br>
                    Capital: <span class="card-data">${country.capital}</span> <br>
                </div>
            </div>
            `;
    countrySection.appendChild(div);
    div.addEventListener('click', () => {
        updateSelection(country.id)
    })
}

const sectionDetails = document.getElementById('sectionDetails')

function showUserDetails(user) {
    sectionDetails.classList.add('d-block')
    let divContainer = document.createElement('div');
    let h2 = document.createElement('h2');
    h2.classList.add('text-center');
    h2.innerText = "User Details";
    divContainer.appendChild(h2);
    let div = document.createElement('div');
    div.classList.add('row', 'row-cols-1', 'row-cols-md-2', 'mt-3');

    div.innerHTML = `
        <div class="col text-start text-md-end text-capitalize">
            <h3${user.name}</h3>
            Gender: <b>${user.gender}</b> <br>
            Address: <b>${user.address}</b> <br>
            Age: <b>${user.age}</b> <br>
            Date of Birth: <b>${user.dob.toDateString()}</b> <br>
            Phone: <b>${user.phone}</b>
            Cell: <b>${user.cell}</b>
        </div>
        <img class="col" src="${user.picture}" alt="" style="width: 200px; height: 200px; object-fit: cover;">
    `;
    divContainer.appendChild(div);

    sectionDetails.appendChild(divContainer)
    window.location.href = '#sectionDetails'
}

function showCountryDetails(country) {
    sectionDetails.classList.add('d-block')
    let divContainer = document.createElement('div');
    let h2 = document.createElement('h2');
    h2.classList.add('text-center');
    h2.innerText = "Country Details";
    divContainer.appendChild(h2);

    let div = document.createElement('div');
    div.classList.add('row', 'row-cols-1', 'row-cols-md-2', 'mt-3');

    div.innerHTML = `
    <div class="col text-start text-md-end">
        <h3>${country.name}</h3>
        Official Name: <b>${country.officialName}</b> <br>
        Language: <b>${country.language}</b> <br>
        Currency: <b>${country.currency}</b> <br>
        Capital: <b>${country.capital}</b> <br>
        Region: <b>${country.region}</b>
    </div>
    <img class="col mt-2 mt-md-0" src="${country.flag}" alt="" style="max-width: 200px; height: 200px; object-fit: cover;">
    `;
    divContainer.appendChild(div);

    sectionDetails.appendChild(divContainer);
    window.location.href = '#sectionDetails'
}
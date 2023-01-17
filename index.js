const changePage = (whichPage) => {
    let pages = document.querySelectorAll('.pages');
    pages.forEach((page) => {
        page.classList.add('hide');
        page.classList.remove('block');
    });
    let imgBox = document.querySelectorAll('.img-box');
    imgBox.forEach((box) => {
        box.classList.remove('selected-page');
    });
    if (whichPage === 'profile-page') {
        pageToChangeTo = document.querySelector('.profile-page');
        selectedPage = document.querySelector('.profile');
    }
    if (whichPage === 'projects-page') {
        pageToChangeTo = document.querySelector('.projects-page');
        selectedPage = document.querySelector('.projects');
    }
    if (whichPage === 'graphs-page') {
        pageToChangeTo = document.querySelector('.graphs-page');
        selectedPage = document.querySelector('.graphs');
    }
    if (whichPage === 'skills-page') {
        pageToChangeTo = document.querySelector('.skills-page');
        selectedPage = document.querySelector('.skills');
    }
    pageToChangeTo.classList.remove('hide');
    pageToChangeTo.classList.add('block');
    selectedPage.classList.add('selected-page');
};
const profileButton = document.querySelector('.profile');
profileButton.addEventListener('click', changePage.bind(null, 'profile-page'));
const projectsButton = document.querySelector('.projects');
projectsButton.addEventListener(
    'click',
    changePage.bind(null, 'projects-page')
);
const graphsButton = document.querySelector('.graphs');
graphsButton.addEventListener('click', changePage.bind(null, 'graphs-page'));
const skillsButton = document.querySelector('.skills');
skillsButton.addEventListener('click', changePage.bind(null, 'skills-page'));

const graphQLQuery = `{
    userdata: user(where: {id: {_eq: "241"}}) {
        login
        id
    }
    level: transaction(
        where: {_and: [{user: {id: {_eq: "241"}}}, {type: {_eq: "level"}}]}
        order_by: {amount: desc}
      ) {
      amount
    }
    exp: transaction(
    where: {_and: [{user: {id: {_eq: "241"}}}, {type: {_eq: "xp"}}]}
    order_by: {amount: desc}
    ) {
        amount
    }
    progress: progress(
        where: {_and: [{user: {id: {_eq: "241"}}}, {object: {type: {_eq: "project"}}}, {isDone: {_eq: true}}, {grade: {_neq: 0}}]}
        order_by: {updatedAt: desc}
    ) {
        id
        grade
        createdAt
        updatedAt
        object {
            id
            name
        }
    }
    skills: transaction(
        where: {_and: [{user: {id: {_eq: "241"}}}, {_or: [{type: {_eq: "skill_go"}}, {type: {_eq: "skill_html"}}, {type: {_eq: "skill_back-end"}}, {type: {_eq: "skill_front-end"}}, {type: {_eq: "skill_algo"}}, {type: {_eq: "skill_sql"}}, {type: {_eq: "skill_docker"}}, {type: {_eq: "skill_sys-admin"}}, {type: {_eq: "skill_js"}}, {type: {_eq: "skill_prog"}}, {type: {_eq: "skill_game"}}]}]}
        order_by: {amount: desc}
        ) {
        type
        amount
      }
    projecttransactions: transaction(
        where: {_and: [{user: {id: {_eq: "241"}}}, {object: {type: {_eq: "project"}}}, {type: {_eq: "xp"}}]}
        order_by: {createdAt: desc}
    ) {
        amount
        createdAt
        object {
            id
            name
        }
    }
}`;
let graphQLObject = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: graphQLQuery
    })
};
fetch(
    'https://learn.01founders.co/api/graphql-engine/v1/graphql',
    graphQLObject
)
    .then((response) => response.json())
    .then((response) => {
        console.log(response);
        //Profile page
        const profilePage = document.querySelectorAll('.profile-page div');
        profilePage[0].innerHTML = 'Name: ' + response.data.userdata[0].login;
        profilePage[1].innerHTML = 'Id: ' + response.data.userdata[0].id;
        profilePage[2].innerHTML =
            'Current Level: ' + response.data.level[0].amount;
        let totalExp = 0;
        for (let i = 0; i < response.data.exp.length; i++) {
            totalExp += response.data.exp[i].amount;
        }
        totalExp = totalExp / 1000;
        profilePage[3].innerHTML = 'Total Exp: ' + totalExp + 'kB';
        profilePage[4].innerHTML =
            'Highest xp gain: ' + response.data.exp[0].amount / 1000 + 'kB';
        profilePage[5].innerHTML =
            'Lowest xp gain: ' +
            response.data.exp[response.data.exp.length - 1].amount / 1000 +
            'kB';
        let averageGrade = 0;
        for (let i = 0; i < response.data.progress.length; i++) {
            averageGrade += response.data.progress[i].grade;
        }
        averageGrade =
            Math.round((averageGrade / response.data.progress.length) * 100) /
            100;
        profilePage[6].innerHTML = 'Average Grade: ' + averageGrade;

        //Project page
        const projectsPage = document.querySelector('.projects-page');
        for (let i = 0; i < response.data.progress.length; i++) {
            let grade = Math.round(response.data.progress[i].grade * 100) / 100;
            let createdDate = convertDateFormat(
                response.data.progress[i].createdAt
            );
            let updatedDate = convertDateFormat(
                response.data.progress[i].updatedAt
            );
            let projectHTML = `
            <div>${response.data.progress[i].object.name}</div>
            <div>Grade: ${grade}</div>
            <div>Created at: ${createdDate}</div>
            <div>Last updated: ${updatedDate}</div>
            `;

            const project = document.createElement('div');
            project.classList.add('project');
            project.innerHTML = projectHTML;
            projectsPage.insertAdjacentElement('beforeend', project);
        }

        //Skills page
        const skillsPage = document.querySelector('.skills-page');
        const skillChartSvg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        // const skillChartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const title = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'title'
        );
        title.classList.add('title');
        title.innerHTML = 'Skill Levels';
        skillChartSvg.setAttribute('viewBox', '0 0 24 24');
        skillChartSvg.classList.add('skill-chart');

        skillChartSvg.role = 'img';
        // skillChartSvg.appendChild(skillChartPath);
        let skillChartObj = {};
        let go = 0;
        let backend = 0;
        let frontend = 0;
        let js = 0;
        let algo = 0;
        let html = 0;
        let sql = 0;
        let game = 0;
        let docker = 0;
        let prog = 0;
        let sysadmin = 0;
        skillsPage.appendChild(skillChartSvg);
        skillChartSvg.insertAdjacentElement('afterbegin', title);

        const skillChart = document.querySelector('.skill-chart');
        for (let i = 0; i < response.data.skills.length; i++) {
            let type = response.data.skills[i].type;
            skillDiv = document.querySelector(
                `.${response.data.skills[i].type}`
            );
            if (!skillDiv) {
                const skill = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'g'
                );
                const bar = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'rect'
                );
                const text = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'text'
                );
                const title = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'title'
                );
                skillChartObj[type] = 0;
                skill.classList.add(response.data.skills[i].type);
                skill.classList.add('bar');
                bar.setAttribute('height', 1);
                skill.insertAdjacentElement('beforeend', bar);
                skill.insertAdjacentElement('beforeend', text);
                skill.insertAdjacentElement('beforeend', title);
                skillChart.insertAdjacentElement('beforeend', skill);
            }
            if (type in skillChartObj)
                skillChartObj[type] += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_go')
                go += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_back-end')
                backend += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_front-end')
                frontend += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_js')
                js += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_algo')
                algo += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_html')
                html += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_sql')
                sql += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_game')
                game += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_docker')
                docker += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_prog')
                prog += response.data.skills[i].amount;
            if (response.data.skills[i].type === 'skill_sys-admin')
                sysadmin += response.data.skills[i].amount;
        }

        const skillBars = document.querySelectorAll('.skill-chart g');
        // console.log(skillChartObj)
        // for (const key in skillChartObj) {
        //     console.log(`${key}: ${skillChartObj[key]}`)
        // }
        // if (skillBars[i].classList[0] === type) {
        //     skillBars[i].children[0].setAttribute('width', skillChartObj[type] / 150 + "vw")
        //     skillBars[i].children[1].setAttribute('x', skillChartObj[type] / 150 + 0.02 + "vw")
        //     skillBars[i].children[2].innerHTML = skillChartObj[type]
        // }
        for (let i = 0; i < skillBars.length; i++) {
            if (skillBars[i].classList[0] === 'skill_go') {
                skillBars[i].children[0].setAttribute('width', go / 150 + 'vw');
                skillBars[i].children[1].setAttribute(
                    'x',
                    go / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = go;
            }
            if (skillBars[i].classList[0] === 'skill_back-end') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    backend / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    backend / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = backend;
            }
            if (skillBars[i].classList[0] === 'skill_front-end') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    frontend / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    frontend / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = frontend;
            }
            if (skillBars[i].classList[0] === 'skill_js') {
                skillBars[i].children[0].setAttribute('width', js / 150 + 'vw');
                skillBars[i].children[1].setAttribute(
                    'x',
                    js / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = js;
            }
            if (skillBars[i].classList[0] === 'skill_algo') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    algo / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    algo / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = algo;
            }
            if (skillBars[i].classList[0] === 'skill_html') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    html / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    html / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = html;
            }
            if (skillBars[i].classList[0] === 'skill_sql') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    sql / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    sql / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = sql;
            }
            if (skillBars[i].classList[0] === 'skill_game') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    game / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    game / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = game;
            }
            if (skillBars[i].classList[0] === 'skill_docker') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    docker / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    docker / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = docker;
            }
            if (skillBars[i].classList[0] === 'skill_prog') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    prog / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    prog / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = prog;
            }
            if (skillBars[i].classList[0] === 'skill_sys-admin') {
                skillBars[i].children[0].setAttribute(
                    'width',
                    sysadmin / 150 + 'vw'
                );
                skillBars[i].children[1].setAttribute(
                    'x',
                    sysadmin / 150 + 0.02 + 'vw'
                );
                skillBars[i].children[2].innerHTML = sysadmin;
            }
            skillBars[i].children[0].setAttribute('y', i * 0.2 + 'vh');
            skillBars[i].children[1].setAttribute('y', i * 0.2 + 0.1 + 'vh');
            skillShort = skillBars[i].classList[0].split('_')[1];
            skillBars[i].children[1].innerHTML = skillShort;
        }
    });
    const convertDateFormat = (date) => {
        let splitDate = date.split('T')[0].split('-');
        date = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
        return date;
    };
    
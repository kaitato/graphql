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
    projectexpovertime: transaction(
        where: {_and: [{user: {id: {_eq: "241"}}}, {type: {_eq: "xp"}}, {object: {type: {_eq: "project"}}}]}
        order_by: {createdAt: asc}
    ) {
        amount
        createdAt
        object {
            name
        }
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

        //Graphs page
        console.log(response)
        const graphsPage = document.querySelector('.graphs-page');
        const expGraphSvg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        const expGraphTitle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'title'
        );
        expGraphTitle.classList.add('title');
        expGraphTitle.innerHTML = 'Experience Levels';
        expGraphSvg.setAttribute('viewBox', '0 0 24 24');
        expGraphSvg.classList.add('exp-graph');
        expGraphSvg.role = 'img';
        graphsPage.appendChild(expGraphSvg);
        expGraphSvg.insertAdjacentElement('afterbegin', expGraphTitle);
        
        //Create axes
        const CreateXAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const CreateYAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const CreateXLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const CreateYLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        CreateXAxis.classList.add('grid', 'x-grid')
        CreateYAxis.classList.add('grid', 'y-grid')
        CreateXLine.setAttribute('x1', 0)
        CreateXLine.setAttribute('x2', "100%")
        CreateXLine.setAttribute('y1', "100%")
        CreateXLine.setAttribute('y2', "100%")
        CreateYLine.setAttribute('x1', 0)
        CreateYLine.setAttribute('x2', 0)
        CreateYLine.setAttribute('y1', "100%")
        CreateYLine.setAttribute('y2', 0)
        CreateXAxis.insertAdjacentElement('beforeend', CreateXLine)
        CreateYAxis.insertAdjacentElement('beforeend', CreateYLine)
        expGraphSvg.insertAdjacentElement('beforeend', CreateXAxis)
        expGraphSvg.insertAdjacentElement('beforeend', CreateYAxis)

        //Create the line
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        let lineCoordinates = "0,24 "
        let ycoord = 0
        response.data.projectexpovertime.forEach((project, i) => {
            ycoord += (project.amount/26348)
            let round = Math.round(ycoord*100)/100
            console.log(round)
            lineCoordinates += ((i+1)*0.75) + "," + (24-round) + " "
        });
        polyline.setAttribute('points', lineCoordinates)
        expGraphSvg.insertAdjacentElement('beforeend' , polyline)
        console.log(lineCoordinates)

        //Skills page
        const skillsPage = document.querySelector('.skills-page');
        const skillChartSvg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        // const skillChartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const skillChartTitle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'title'
        );
        skillChartTitle.classList.add('title');
        skillChartTitle.innerHTML = 'Experience Levels over time';
        skillChartSvg.setAttribute('viewBox', '0 0 24 24');
        skillChartSvg.classList.add('skill-chart');

        skillChartSvg.role = 'img';
        // skillChartSvg.appendChild(skillChartPath);
        let skillChartObj = {};
        skillsPage.appendChild(skillChartSvg);
        skillChartSvg.insertAdjacentElement('afterbegin', skillChartTitle);

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
        }

        const skillBars = [...document.querySelectorAll('.skill-chart g')];
        Object.keys(skillChartObj).forEach((skill, i) => {
            const chosenBar = skillBars.find(
                (bar) => bar.classList[0] === skill
            );
            chosenBar.children[0].setAttribute(
                'width',
                skillChartObj[skill] / 150 + 'vw'
            );
            chosenBar.children[1].setAttribute(
                'x',
                skillChartObj[skill] / 150 + 0.02 + 'vw'
            );
            chosenBar.children[2].innerHTML = skillChartObj[skill];

            chosenBar.children[0].setAttribute('y', i * 0.2 + 'vh');
            chosenBar.children[1].setAttribute('y', i * 0.2 + 0.1 + 'vh');
            let skillShort = skillBars[i].classList[0].split('_')[1];
            chosenBar.children[1].innerHTML = skillShort;
        });
    });
const convertDateFormat = (date) => {
    let splitDate = date.split('T')[0].split('-');
    date = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
    return date;
};

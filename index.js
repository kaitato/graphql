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
    });

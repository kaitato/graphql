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